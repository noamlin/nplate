// globals
/* self defined global functions. (instantly defined as global so no need of exporting them) */
require('./lib/globals.js');

// cluster for multi-threading
var cluster = require('cluster'),
	os = require('os'),
	numCPUs = os.cpus().length;

if(cluster.isMaster) {
	var maxAllowedThreads = Math.min(2, numCPUs);
	for(var i = 0; i < maxAllowedThreads; i++) {
		cluster.fork(); // Fork a new worker
	}

	cluster.on('fork', function (worker) {
		bunyanLog.info('forked a new worker. pid: ' + worker.process.pid);
	});
	cluster.on('exit', function (worker, code, signal) {
		bunyanLog.error('worker ' + worker.process.pid + ' died');
	});
	cluster.on('disconnect', function (worker) {
		bunyanLog.warn('worker ' + worker.process.pid + ' disconnected');
		cluster.fork();
	});
}
else { // cluster.isWorker
	var http = require('http'),
		domain = require('domain');

	// create our server object
	var server = http.createServer();

	// database
	var dbDomain = domain.create(); // a domain for the database
	dbDomain.on('error', function (err) {
		bunyanLog.fatal(err); // log the uncaught exception

		try {
			var killtimer = setTimeout(function() { // run 15s (in a dangerous territory) and let current connections finish
				bunyanLog.warn('15 seconds has passed. killing worker forcibly')
				process.exit(1);
			}, 15000);
			killtimer.unref(); // But don't keep the process open just for that!

			try {
				server.close(); // stop taking new requests
			}
			catch(serverErr) {
				bunyanLog.warn(serverErr); // server is probably not listening
			}
			
			// Let the master know we're dead. This will trigger a 'disconnect' in the cluster master, and then it will fork a new worker.
			cluster.worker.disconnect();
		}
		catch (killWorkerErr) {
			bunyanLog.error(killWorkerErr); // oh well, not much we can do at this point
		}
	});

	dbDomain.run(function() {
		global.mdb = require('./lib/mongoose/mdb.js');
		mdb.connect2db();
	});

	// express must be defined after a db.connection is created
	var expressApp = require('./app.js');
	
	server.on('request', function(request, response) {
		var requestDomain = domain.create();

		requestDomain.on('error', function (err) {
			bunyanLog.fatal(err); // log the uncaught exception

			try {
				var killtimer = setTimeout(function() { // run 15s (in a dangerous territory) and let current connections finish
					bunyanLog.warn('15 seconds has passed. killing worker forcibly')
					process.exit(1);
				}, 15000);
				killtimer.unref(); // But don't keep the process open just for that!

				try {
					bunyanLog.info('server is closing for new connections');
					server.close(); // stop taking new requests
				}
				catch(serverErr) {
					bunyanLog.warn(serverErr); // if we got here then server is probably not listening
				}
				
				// Let the master know we're dead. This will trigger a 'disconnect' in the cluster master, and then it will fork a new worker.
				cluster.worker.disconnect();

				// try to send an error to the request that triggered the problem
				response.statusCode = 500;
				response.setHeader('content-type', 'text/plain');
				response.end(http.STATUS_CODES[500]);
			}
			catch (killWorkerErr) {
				bunyanLog.fatal(killWorkerErr); // oh well, not much we can do at this point
			}
		});
		
		// must send the domain veriable forward (for later use) in order to explicitly emit 'error' events and thus bypassing express's try-catch which
		// always catches our errors and chains them to the error-routing (because of this the error never bubbles up to the domain)
		request.requestDomain = requestDomain;

		requestDomain.add(request);
		requestDomain.add(response);

		requestDomain.run(function() {
			expressApp(request, response); // use our express-app as the handler
		});
	});
	server.on('listening', function() {
		bunyanLog.info({ operation:"server" }, 'listening on port %d in %s mode', server.address().port, process.env.NODE_ENV);
	});

	server.listen(3000);
}