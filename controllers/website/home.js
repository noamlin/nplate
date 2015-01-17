var dust = require('dustjs-linkedin');

module.exports = function(req, res, next) {
	if(!req.params.part || (req.params.part!=='html' && req.params.part!=='dust' && req.params.part!=='json'))
		next(); // <<<<<<<<<<<<<< WAS HERE

	res.dustRender(
		"website/home.dust",
		{
			lang: req.clientParams.lang,
			title: "איך העברית פה?",
			misc: varDump(req.params)
		},
		function(err, output) {
			if(err)
				res.status(500).send(output);
			else
				res.send(output);
		}
	);
}