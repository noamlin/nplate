var default_lang = "en";
module.exports.default_lang = default_lang;

var properties = {
	en: {
		code3: "eng",
		name: "english",
		name_en: "english",
		direction: "ltr",
		enabled: true
	},
	de: {
		code3: "deu",
		name: "deutsch",
		name_en: "german",
		direction: "ltr",
		enabled: true
	},
	he: {
		code3: "heb",
		name: "עברית",
		name_en: "hebrew",
		direction: "rtl",
		enabled: true
	},
	fr: {
		code3: "fra",
		name: "français",
		name_en: "french",
		direction: "ltr",
		enabled: false
	},
	es: {
		code3: "spa",
		name: "español",
		name_en: "spanish",
		direction: "ltr",
		enabled: false
	}
};
module.exports.properties = properties;

module.exports.resolveLang = function resolveLang(req, res, next) {
	if(req.url === '/') { // solve the special case of no url
		res.redirect(302, '/'+default_lang);
		return false;
	}

	var urlFragments = req.url.split('/');
	urlFragments.shift(); // first cell is always empty and we don't need it
	var lang = urlFragments[0]; // the language fragment

	if(typeof(properties[lang]) != "undefined" && properties[lang].enabled === true) { // language is ok
		req.clientParams.lang = lang;
		
		if(urlFragments.length == 1) { // probably was '/en' which exploded to ["","en"] and then 'shift' to ["en"]
			req.url = '/';
		}
		else {
			urlFragments.shift(); // rewrite our inner url without the language fragment
			req.url = '/' + urlFragments.join('/');
		}
		
		next();
	}
	else { // language is NOT ok
		if(typeof(properties[lang]) == "undefined") { // no language fragment at all
			urlFragments.unshift(default_lang); // add the default lang
		}
		else { // "properties[lang].enabled != true" - has an existant but disabled language
			urlFragments[0] = default_lang; // replace lang with the default-lang
		}
		var redirectTo = '/' + urlFragments.join('/');

		var qsaKeys = Object.keys(req.query);
		if(qsaKeys.length > 0) { // we have a QSA so let's add it
			var qsa = '';
			for(var i in qsaKeys) {
				qsa += qsaKeys[i]+'='+encodeURIComponent( req.query[qsaKeys[i]] )+'&';
			}
			qsa = qsa.substring(0, qsa.length-1); // chop off the last '&'
			redirectTo += '?' + qsa;
		}

		res.redirect(302, redirectTo);
	}
};
