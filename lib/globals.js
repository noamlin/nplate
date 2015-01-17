/* FUNCTIONS & VARIABLES FOR GLOBAL USE */
/* stuff that all files and libraries might use */

var util = require('util');
var extend = require('extend');
var bunyan = require('bunyan');

/*
 * define the global logger and its options
 */
global.bunyanLog = bunyan.createLogger({name: 'NPlate'});
bunyanLog.level('debug');

/*
 * define a global, non-configurable and non-enumerable variables.
 * extra functions for stack at: https://code.google.com/p/v8-wiki/wiki/JavaScriptStackTraceApi
 */
Object.defineProperty(global, '__stack', { // returns an error stack
	get: function() {
		var orig = Error.prepareStackTrace;
		Error.prepareStackTrace = function(_, stack) { return stack; };
		var err = new Error;
		Error.captureStackTrace(err, arguments.callee);
		var stack = err.stack;
		Error.prepareStackTrace = orig;
		return stack;
	}
});
Object.defineProperty(global, '__line', { // returns the code line number from where this function was called
	get: function() {
		return __stack[1].getLineNumber();
	}
});

/*
 * check whether the desired option exists
 * and return the option's value if yes or a default value if not
 * 
 * @param "options" [required] [object/undefined] - the object to check if our option exists inside it.
 * @param "name" [required] [string] - the name of the option.
 * @param "defaultValue" [required] [mixed] - a default value to return if our option doesn't exist
 * @return - a default value or an already existing value (usually a string or a number)
 */
global.optionalArg = function(options, name, defaultValue) {
	return (options && options[name]!==undefined) ? options[name] : defaultValue;
}

/*
 * converts new-line characters to '<br>' tags
 *
 * @param "str" [required] [string] - the string to convert its line-breaks chars to '<br>'.
 * @param "isXhtml" [optional] [boolean] - whether to use xhtml '<br />' or else html5 '<br>'. default 'false'.
 * @return - new converted string
 */
global.nl2br = function(str, isXhtml) {
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
 * dumps variable content recursively.
 * relies on node's 'util.inspect'
 *
 * @param "variable" [required] [mixed] - the variable to dump its content
 * @param "options" [optional] [object] - options for 'util'
 * @return - a string ready for printing out
 */
global.varDump = function varDump(variable, userOptions) {
	var options = {
		showHidden: true,
		depth: 4,
		colors: false
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

	output = output.replace(/(\u0020\u0020)/g, ' &nbsp;');
	output = output.replace(/(\t)/g, ' &nbsp;&nbsp;&nbsp;');
	output = nl2br(output);

	return output;
}

/*
 * logs variable content to console, recursively.
 * relies on node's 'util.inspect'
 *
 * @param "variable" [required] [mixed] - the variable to dump its content.
 * @param "options" [optional] [object] - options for 'util'
 */
global.consoleDump = function consoleDump(variable, userOptions) {
	var options = {
		showHidden: true,
		depth: 4,
		colors: true
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

	console.log(output);
}

/*
 * logs to console with a pretty formatted tag at the beginning of the line
 *
 * @param "tag" [required] [string] - tags this log line
 * @param "output" [required] [string] - the actual string we want to log
 * @N-params [optional] [mixed] - extra parameters of console.log (like when using "bla %d bla %s bla")
 */
global.tagLog = function tagLog() {
	var tag = arguments[0],
		tagLength = tag.length,
		formattedTagLength = 9,
		extraSpaces = '',
		i;
	for (i=formattedTagLength-tagLength; i>0; i--) {
		extraSpaces += ' ';
	}

	arguments[1] = extraSpaces + '['+tag+'] ' + arguments[1]; // format the output with the pretty tag prefixing it
	Array.prototype.shift.apply(arguments); // remove the 'tag' argument. rest of the arguments fit perfectly to console.log
	
	console.log.apply(this, arguments);
};
module.exports.tagLog = tagLog;

/*
 * logs to console with a pretty formatted tag at the beginning of the line
 *
 * @param "err" [required] [error object] - an error object to print to the console
 */
global.errorLog = function errorLog(err) {
	tagLog('ERROR', err.message);

	var stackLength = __stack.length,
		stackMessage,
		functionString;

	for(var i=1; i < stackLength; i++) {
		functionString = __stack[i].getFunction().toString();
		functionString = functionString.split('\n')[0];
		stackMessage = '('+__stack[i].getFileName();
		stackMessage += ':'+__stack[i].getLineNumber();
		stackMessage += ':'+__stack[i].getColumnNumber()+')';
		stackMessage += '  "' + functionString + '"';
		tagLog('>', stackMessage);
	}
}