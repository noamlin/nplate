var webCrawlers = require('./web-crawlers.js');

module.exports = function(req, res, next) {
	if(req.session.isBot !== true && req.session.isBot !== false) {
		var isBot = false;
		for(var i=webCrawlers.length-1; i>0; i--) {
			if(req.headers['user-agent'].search(webCrawlers[i]) > -1) {
				isBot = true;
				break;
			}
		}
		req.session.isBot = isBot;
	}
	next();
}