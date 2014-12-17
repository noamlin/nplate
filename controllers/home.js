var G = require('../lib/globals.js');
var dust = require('dustjs-linkedin');
var webCrawlers = require('../lib/web-crawlers.js');

module.exports = function(req, res) {
	var isHuman = true;
	for(var i=webCrawlers.length-1; i>0; i--) {
		if(req.headers['user-agent'].search(webCrawlers[i]) > -1) {
			isHuman = false;
			break;
		}
	}

	res.dustRender(
		"home.dust",
		{
			lang: req.clientParams.lang,
			title: "איך העברית פה?",
			misc: G.varDump(isHuman)
		},
		function(output) {
			res.send(output);
		}
	);
}