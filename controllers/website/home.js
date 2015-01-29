var dust = require('dustjs-linkedin');

module.exports = function homePage(req, res, next) {
	res.dustRender("website/home.dust",
		{
			lang: req.clientParams.lang,
			title: "איך העברית פה?",
			misc: varDump(req.clientParams),
			misc2: varDump(req.query)
		},
		function(err, output) {
			if(err)
				res.status(500).send(output);
			else
				res.send(output);
		}
	);
}