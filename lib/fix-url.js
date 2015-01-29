module.exports = function fix_url(req, res, next) {
	if(req.originalUrl.length > 1 && req.originalUrl.match(/\/+$/) !== null) { // address ends with too many slashes (but skipping the root address i.e. '/')
		var newUrl = req.protocol + "://" + req.headers.host.replace(/www\./, "") + req.originalUrl.replace(/\/+$/, ''); // remove slashes and by the way remove www too
		res.redirect(302, newUrl);
	}
	else if(req.subdomains[ req.subdomains.length-1 ] == "www") { // address has www
		var newUrl = req.protocol + "://" + req.headers.host.replace(/www\./, "")+req.originalUrl; // remove www
		res.redirect(302, newUrl);
	}
	else {
		/*
		 * as a rule of thumb, we will always refer to inner urls as '/part1/part2' - i.e. no qsa and no slash at the end
		*/
		if(req.url.indexOf('?') > -1) {
			// express already processed the QSA (into req.query) so we can now omit it
			// so it won't interfere with future url parsings
			req.url = req.url.substring(0, req.url.indexOf('?'));
		}

		if(req.url.length > 1) { // only if url is longer than just a single '/' char
			var lastChar = req.url.substring(req.url.length-1);
			if(lastChar === '/')
				req.url = req.url.substring(0, req.url.length-1); // delete the unwanted last char '/'
		}

		next();
	}
}