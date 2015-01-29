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