var dust = require('dustjs-linkedin');
var fs = require('fs');
var path = require('path');
var viewsDir = path.normalize( path.join(__dirname, '..', 'views/') );
var G = require('../lib/globals.js');

/*
** renders a compiled template (a JS function that is actually saved in 'dust.cache') to an HTML output
Arguments:
- template [required] [string] - the template's name.
- data [required] [object] - the variables to be passed along into the view file.
- callback [required] [function] - a function to be executed once the rendering has finished.
	> function callback(html_output) { ... }
*/
function renderTemplate(template, data, callback) {
	dust.render(
		template,
		data,
		function(err, out) {
			if(err) {
				console.log(err);
				callback("Error Compiling And Rendering Page");
			}
			else {
				callback(out);
			}
		}
	);
}

/*
** check template file and compiles it according to the options.
Arguments:
- templatePath [required] [string] - path to the template file. always looks for the file from 'views/' directory.
- data [required] [object] - the variables to be passed along into the view file.
- options [optional] [object] - an object with options.
	- options.forceLoad [boolean] - whether to force reload of the file or use cached version if available. defaults to 'false' (use cache).
- callback [required] [function] - a function to be executed or passed along to the 'renderTemplate'.
	> function callback(html_output) { ... }
*/
function checkTemplate() {
	var templatePath = arguments[0];
	var data = arguments[1];
	if(arguments.length == 3) {
		options = {};
		callback = arguments[2];
	}
	else if(arguments.length == 4) {
		options = arguments[2];
		callback = arguments[3];
	}
	
	var forceLoad = G.optionalArg(options, 'forceLoad', false);

	var template = templatePath.replace(/[\/\.]/g, '_'); // build template's name based on file name

	if(forceLoad || !dust.cache[template]) { // check if already exists (previously created and cached) OR forced reload
		fs.readFile(viewsDir+templatePath, 'utf8', function(err, fileContents) {
			if(err) {
				console.log(err);
				callback("Could not read file");
			}
			else {
				if(process.env.NODE_ENV === 'development') {
					dust.config.whitespace = true; // do not clear white-spaces
				}
				var compiledTemplate = dust.compile(fileContents, template); // compiles the template's file from html&dust to a javascript function
				dust.loadSource( compiledTemplate ); // loads the compiled template to dust's cache. this should occur only once per template
				renderTemplate(template, data, callback);
			}
		});
	}
	else
		renderTemplate(template, data, callback);
}

module.exports = function(req, res, next) {
	res.dustRender = checkTemplate;
	next();
};