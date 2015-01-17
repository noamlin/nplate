var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var fixUrl = require('./lib/fix-url.js');
var i18n = require('./lib/i18n.js');
var dustRenderer = require('./lib/dust-renderer.js');
var mySession = require('./lib/session-implementation.js');
var isBot = require('./lib/is-client-bot.js');

var app = express();

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico'), {maxAge:'2d'}));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// create an object to store and pass per-request variables along the router.
// these are variables that shouldn't be saved for later use with 'session'
app.use(function(req, res, next) {
	req.clientParams = {};
	next();
});

app.use(mySession); // use mongo to store cookie-sessions
app.use(isBot); // check if client is a bot, and not a human being
app.use(fixUrl); // redirect to fixed addresses (e.g. no www and no slashes on the end)
app.use(i18n.resolveLang); // determine language or set the default language, and alter/update the URL accordingly
app.use(dustRenderer); // add our own implementation of using dust

// routing to router files
var adminPanel_router = require('./routes/admin_panel');
app.use('/admin', adminPanel_router);
var website_router = require('./routes/website');
app.use('/', website_router);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if(process.env.NODE_ENV === 'development') {
	app.use(function(err, req, res, next) {
		if(!err.status || err.status!=404){ // <<<<<<<<<<<<<<<<<<<<<<<<<<<< WAS HERE
			bunyanLog.warn(err);
		}
		consoleDump(res.dustRender);
		res.dustRender(
			"error.dust",
			{
				errorCode: err.status,
				errorMessage: err.stack
			},
			function(output) {
				res.status(err.status || 500).send(output);
			}
		);
	});
}
else {
	// production error handler
	// no stacktraces leaked to user
	app.use(function(err, req, res, next) {
		res.dustRender(
			"error.dust",
			{
				errorCode: err.status,
				errorMessage: err.message
			},
			function(output) {
				res.status(err.status || 500).send(output);
			}
		);
	});
}

module.exports = app;
