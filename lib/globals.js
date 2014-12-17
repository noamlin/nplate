/* FUNCTIONS & VARIABLES FOR GLOBAL USE */
/* stuff that all files and libraries might use */

var util = require('util');
var extend = require('extend');

/*
** check whether the desired option exists
** and return the option's value if yes or a default value if not
Arguments:
- options [required] [object/undefined] - the object to check if our option exists inside it.
- name [required] [string] - the name of the option.
- defaultValue [required] [mixed] - a default value to return if our option doesn't exist
*/
var optionalArg = function(options, name, defaultValue) {
	return (options && options[name]!==undefined) ? options[name] : defaultValue;
}

/*
** converts new-line characters to '<br>' tags
Arguments:
- str [required] [string] - the string to convert its line-breaks chars to '<br>'.
- isXhtml [optional] [boolean] - whether to use xhtml '<br />' or else html5 '<br>'. default 'false'.
*/
function nl2br(str, isXhtml) {
    if(!isXhtml)
    	var breakTag = '<br>';
    else
    	var breakTag = '<br />';

    return str.replace(/(\r\n|\n\r|\r|\n)/g, breakTag);
    /*
    USAGE: string.replace(search-value, new-value).
    the 'new-value' can use the special dollar-sign ($).
    $$ = inserts a '$'
    $& = Inserts the matched substring
    $` = Inserts the portion of the string that precedes the matched substring
    $' = Inserts the portion of the string that follows the matched substring
    $n or $nn = Where n or nn are decimal digits, inserts the nth parenthesized submatch string, provided the first argument was a RegExp object
    EXAMPLE: "aaBcc".replace(/(B)/g, 'Z'+'$1'+'W') = "aaZBWcc"
    */
}

/*
** dumps variable content recursively.
** relies on node's 'util.inspect'
Arguments:
- variable [required] [mixed] - the variable to dump its content.
- forConsole [optional] [boolean] - is this dump for the console? true for coloring and no nl2br, false for the opposite.
- options [optional] [object] - options for 'util'
*/
var varDump = function(variable, forConsole, userOptions) {
	if(!forConsole)
		forConsole = false;

	/*if(!options)
		options = {};
	
	options.showHidden = optionalArg(options, 'showHidden', true);
	options.depth = optionalArg(options, 'depth', null);
	options.colors = optionalArg(options, 'colors', forConsole);*/
	var options = {
		showHidden: true,
		depth: null,
		colors: forConsole
	};
	extend(options, userOptions);

	var output;

	if(typeof(variable) == 'object') {
		if(variable.constructor === Array)
			output = 'array ('+variable.length+')';
		else
			output = 'object ('+Object.keys(variable).length+')';
	}
	else {
		output = typeof(variable);
		
		if(variable.hasOwnProperty('length'))
			output += ' ('+variable.length+')';
	}
	
	output += '\n'+util.inspect(variable, options);

	if(!forConsole) {
		output = output.replace(/(\u0020\u0020)/g, ' &nbsp;');
		output = output.replace(/(\t)/g, ' &nbsp;&nbsp;&nbsp;');
		output = nl2br(output);
	}

	return output;
}

module.exports = {
	optionalArg: optionalArg,
	varDump: varDump,
	nl2br: nl2br
}