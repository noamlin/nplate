/*
 * check the part of page that is requested (html, dust, json) and alter the inner url for ease of further use.
 * - html : send a complete html page to the client. this happens for the first page that is loaded, and also the only option for bots
 * - dust : send only a compiled dust template (a dust javascript function)
 * - json : send a json with the data for the client to render the dust template on his browser
 */
module.exports = function checkPart(req, res, next) {
	var urlFragments = req.url.split('/');
	var part = urlFragments.pop(); // the last fragment should be the 'part' of the page
	
	if(part === 'html' || part === 'dust' || part === 'json') {
		req.clientParams.part = part;

		if(urlFragments.length == 1)
			req.url = '/';
		else
			req.url = urlFragments.join('/');
	}
	else {
		req.clientParams.part = null;
	}

	next();
};