/* CONNECTING TO MONGO DATABASE via MONGOOSE */
/* initializing schemas and db stuff */

var mongoose = require('mongoose');

mongoose.connection.on('error', function(err) {
	tagLog('DATABASE', err);
	mongoose.disconnect(); // force disconnecting on error. this also changes the 'readyState'
	setTimeout(connect2db, 1000); // try and reconnect every second
});
mongoose.connection.on('connecting', function() {
	tagLog('DATABASE', 'connecting to mongodb...');
});
// Emitted when this connection successfully connects to the db. May be emitted multiple times in reconnected scenarios.
mongoose.connection.on('connected', function() {
	tagLog('DATABASE', 'a connection to mongodb is made');
});
mongoose.connection.on('disconnected', function() {
	tagLog('DATABASE', 'disconnected a mongodb connection');
});
mongoose.connection.on('close', function() {
	tagLog('DATABASE', 'closed all connections to mongodb');
});
// Emitted after we connected and onOpen is executed on all of this connections models.
mongoose.connection.once('open', function() {
	// mongoose docs says to create the mongoose-models within the 'open' event. (i'm not sure why..)
	module.exports.Member = require('./member-model.js');
});
module.exports.connection = mongoose.connection;

var connect2db = function connect2db() {
	mongoose.connect(
		'mongodb://localhost/monochrome',
		{
			server: { auto_reconnect: true }
		}
	);
};
module.exports.connect2db = connect2db;