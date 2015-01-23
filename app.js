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
