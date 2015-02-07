var dust = require('dustjs-linkedin'),
	myDust = require('../../lib/dust-implementation.js');

// compile the home page into a js function
myDust.compileFile("website/home.dust", { templateName: "website/home" });

// on homepage request
module.exports = function homePage(req, res, next) {
	var part = req.clientParams.part;

	if(part === "dust") {
		// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< TODO
	}
	else if(part === "json") {
		// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< TODO
	}
	else { // part === null || part === "html"
		myDust.render("website/skeleton",
			{
				lang: req.clientParams.lang,
				title: "איך העברית פה?",
				headerData: "is bot - " + varDump(req.session.isBot),
				footerData: varDump(req.query),

				body: "website/home",
				bodyData: varDump(req.clientParams)
			},
			function(err, output) {
				if(err)
					res.status(500).send(output);
				else
					res.send(output);
			}
		);
	}
}