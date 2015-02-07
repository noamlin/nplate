var express = require('express'),
	path = require('path'),
	favicon = require('serve-favicon'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),

	connectionTimeout = require('./lib/connection-timeout.js'),
	fixUrl = require('./lib/fix-url.js'),
	i18n = require('./lib/i18n.js'),
	mySession = require('./lib/session-implementation.js'),
	isBot = require('./lib/is-client-bot.js');

var app = express();

app.use(connectionTimeout.set(20000)); // sets a connection timeout that will emit an error if client is connected for too long

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico'), {maxAge:'2d'}));

app.use(connectionTimeout.haltOnTimedout); // will halt the routing progress if a connection timeout occured

app.use(bodyParser.json());

app.use(connectionTimeout.haltOnTimedout); // halt on timeout

app.use(bodyParser.urlencoded({ extended: false }));

app.use(connectionTimeout.haltOnTimedout); // halt on timeout

app.use(cookieParser());

app.use(connectionTimeout.haltOnTimedout); // halt on timeout

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(connectionTimeout.haltOnTimedout); // halt on timeout

// create an object to store and pass per-request variables along the router.
// these are variables that shouldn't be saved for later use with 'session'
app.use(function(req, res, next) {
	req.clientParams = {};
	next();
});

app.use(mySession); // use mongo to store cookie-sessions

app.use(connectionTimeout.haltOnTimedout); // halt on timeout

app.use(isBot); // check if client is a bot, and not a human being

app.use(connectionTimeout.haltOnTimedout); // halt on timeout

app.use(fixUrl); // redirect to fixed addresses (e.g. no www and no slashes on the end)

app.use(connectionTimeout.haltOnTimedout); // halt on timeout

app.use(i18n.resolveLang); // determine language or set the default language, and alter/update the URL accordingly

app.use(connectionTimeout.haltOnTimedout); // halt on timeout

/// routing to router files
var adminPanel_router = require('./routes/admin_panel');
app.use('/admin', adminPanel_router);
app.use(connectionTimeout.haltOnTimedout); // halt on timeout

var website_router = require('./routes/website');
app.use('/', website_router);
app.use(connectionTimeout.haltOnTimedout); // halt on timeout

/// last function in the chain. meaning no page was found so catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Page Not Found');
	err.status = 404;
	next(err);
});

/// error handlers
var errorControl = require('./controllers/error.js');
app.use(errorControl);


module.exports = app;
