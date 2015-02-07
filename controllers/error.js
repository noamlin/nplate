var myDust = require('../lib/dust-implementation.js');

myDust.compileFile("error.dust", { templateName: "error" });

module.exports = function(err, req, res, next) {
	if(process.env.NODE_ENV === 'development')
		var errorMessage = nl2br(err.stack);
	else
		var errorMessage = err.message;

	if(!err.status || typeof err.status != 'number' || err.status >= 500) { // not an intended error so let's throw it for the domain to catch
		req.requestDomain.emit('error', err);
	}
	else { // we created this error because it has an err.status variable which we manually created
		bunyanLog.warn(err.message + ' - [original url: ' + req.originalUrl + '] [synthesized url: ' + req.url + ']');

		myDust.render("error",
			{
				errorCode: err.status,
				errorMessage: errorMessage
			},
			function(renderErr, output) {
				if(renderErr)
					throw renderErr;
				else
					res.status(err.status || 500).send(output);
			}
		);
	}
};