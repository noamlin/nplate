var default_lang = "en";
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

var resolveLang = function(req, res, next) {
	var urlFragments = req.url.split('/');
	var lang = urlFragments[1]; // the language fragment. (url starts with '/' thus the first cell is always an empty one)

	if(typeof(properties[lang])=="undefined") { // no language fragment at all
		urlFragments.splice(1, 0, default_lang); // add default lang at cell [1]
		res.redirect(302, urlFragments.join('/'));
	}
	else if(properties[lang].enabled !== true) { // on existant but disabled language
		urlFragments[1] = default_lang;
		res.redirect(302, urlFragments.join('/'));
	}
	else { // language is ok
		req.clientParams.lang = lang;
		
		if(urlFragments.length == 2) { // two fragments means ["","en"] which as url was '/en'
			req.url = '/';
		}
		else {
			urlFragments.splice(1, 1);
			req.url = urlFragments.join('/');
		}
		
		next();
	}
};

module.exports = {
	properties: properties,
	default_lang: default_lang,
	resolveLang: resolveLang
};