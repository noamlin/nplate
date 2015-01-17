// globals
/* self defined global functions. (instantly defined as global so no need of exporting them) */
require('./lib/globals.js');

// cluster for multi-threading
var cluster = require('cluster');
var os = require('os');
var numCPUs = os.cpus().length;

if(cluster.isMaster) {
	var maxAllowedThreads = Math.min(2, numCPUs);
	for(var i = 0; i < maxAllowedThreads; i++) {
		cluster.fork(); // Fork a new worker
	}

	cluster.on('fork', function(worker) {
		bunyanLog.info('forked a new worker. pid: ' + worker.process.pid);
	});
	cluster.on('exit', function(worker, code, signal) {
		bunyanLog.info('worker ' + worker.process.pid + ' died');
	});
	cluster.on('disconnect', function(worker) {
		bunyanLog.error('worker ' + worker.process.pid + ' disconnected');
		cluster.fork();
	});
}
else { // cluster.isWorker
	var http = require('http');
	var domain = require('domain');

	// create our server object
	var server = http.createServer();

	// database
	var dbDomain = domain.create(); // a domain for the database
	dbDomain.on('error', function(err) {
		bunyanLog.fatal(err); // log the uncaught exception

		try {
			var killtimer = setTimeout(function() { // run 30s (in a dangerous territory) and let current connections finish
			  process.exit(1);
			}, 30000);
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
		catch (err2) {
			// oh well, not much we can do at this point.
			bunyanLog.error(err2);
		}
	});

	dbDomain.run(function() {
		global.mdb = require('./lib/mongoose/mdb.js');
		mdb.connect2db();
	});

	// express must be defined after a db.connection is created
	var expressApp = require('./app.js');
	
	server.on('request', function(request, response) {
		var requestDomain = domain.create(); // a domain per request
		requestDomain.on('error', function(err) {
			bunyanLog.fatal(err); // log the uncaught exception

			try {
				var killtimer = setTimeout(function() { // run 30s (in a dangerous territory) and let current connections finish
				  process.exit(1);
				}, 30000);
				killtimer.unref(); // But don't keep the process open just for that!

				try {
					server.close(); // stop taking new requests
				}
				catch(serverErr) {
					bunyanLog.warn(serverErr); // server is probably not listening
				}
				
				// Let the master know we're dead. This will trigger a 'disconnect' in the cluster master, and then it will fork a new worker.
				cluster.worker.disconnect();

				// try to send an error to the request that triggered the problem
				response.statusCode = 500;
				response.setHeader('content-type', 'text/plain');
				res.end(http.STATUS_CODES[500]);
			}
			catch (err2) {
				// oh well, not much we can do at this point.
				bunyanLog.error(err2);
			}
		});

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