var dust = require('dustjs-linkedin');
var fs = require('fs');
var path = require('path');
var viewsDir = path.normalize( path.join(__dirname, '..', 'views/') );

// controlling whitespace suppression
if(process.env.NODE_ENV === 'development') {
	dust.config.whitespace = true; // do not clear white-spaces
}

/*
 * renders a compiled template (a JS function that is actually saved in 'dust.cache') to an HTML output
 *
 * @param "template" (*required) [string] - the template's name.
 * @param "data" (*required) [object] - the variables to be passed along into the view file.
 * @param "callback" (*required) [function] - a function to be executed once the rendering has finished.
 *										= function callback(html_output) { ... }
*/
var render = function render(templateName, data, callback) {
	dust.render(
		templateName,
		data,
		function(err, out) {
			if(err) {
				// the only difference between dust's render function and our own function is this error output
				bunyanLog.warn(err);
				callback(err, "Error Compiling And Rendering Page");
			}
			else {
				callback(null, out);
			}
		}
	);
}
module.exports.render = render;

/*
 * check template file and compiles it according to the options.
 * this enables us to lazy-loading the template.
 *
 * @param "templatePath" (*required) [string] - path to the template file. always looks for the file from 'views/' directory.
 * @param "options" (optional) [object] - an object with options.
 *			"options.templateName" [string] - define our own name for this template.
 *			"options.lazyLoad" [boolean] - whether to also render the template. defaults to 'false'.
 *			"options.data" [object] - if lazy-loading (thus rendering) the template then put the data here.
 *			"options.forceLoad" [boolean] - whether to force reload of the file or use cached version if available. defaults to 'false' (use cache).
 * @param "callback" (optional) [function] - a function to be executed or passed along to the 'render'.
 *										= function callback(err, html_output) { ... }
*/
var compileFile = function compileFile(templatePath, options, callback) {
	if(arguments.length === 1) {
		options = {};
	}
	
	var forceLoad = optionalArg(options, 'forceLoad', false),
		templateName = templatePath.replace(/[\/\.]/g, '_'); // build template's name based on file name and path

	templateName = optionalArg(options, 'templateName', templateName); // if exists, overwrite path-name with user predefined name
	
	if(forceLoad || !dust.cache[templateName]) { // check if already exists (previously created and cached) OR forced reload
		fs.readFile(viewsDir+templatePath, 'utf8', function(err, fileContents) {
			if(err) {
				bunyanLog.warn(err);
				callback(err, "Could not read file");
			}
			else {
				var compiledTemplate = dust.compile(fileContents, templateName); // compiles the template's file from html&dust to a javascript function
				dust.loadSource( compiledTemplate ); // loads the compiled template to dust's cache. this should occur only once per template
				if(options.lazyLoad === true)
					render(templateName, options.data, callback);
			}
		});
	}
	else {
		if(options.lazyLoad === true)
			render(templateName, options.data, callback);
	}
}
module.exports.compileFile = compileFile;