// globals
/* self defines global functions, instead of exporting them */
require('./lib/globals.js');

// database
global.mdb = require('./lib/mongoose/mdb.js');
mdb.connect2db();

// express app
var expressApp = require('./app.js');
var server = expressApp.listen(3000, function() {
    tagLog('SERVER', 'listening on port %d in %s mode', server.address().port, process.env.NODE_ENV);
});