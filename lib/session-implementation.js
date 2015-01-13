var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

module.exports = session({
    secret: '592da9zp628b',
    store: new MongoStore({
    	mongooseConnection: mdb.connection,
    	hash: {
    		salt: '0857ef720311',
    		algorithm: 'sha1'
    	}
    }),
    saveUninitialized: false,
    resave: false,
    cookie: {
    	maxAge: 60*60*24 * 1000
    }
});