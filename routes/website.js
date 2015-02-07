var express = require('express'),
	router = express.Router(),
	myDust = require('../lib/dust-implementation.js');

// pre-compile reusable components
myDust.compileFile("website/header.dust", { templateName: "website/header" });
myDust.compileFile("website/footer.dust", { templateName: "website/footer" });
myDust.compileFile("website/website-skeleton.dust", { templateName: "website/skeleton" });

// check 'part' (html, dust or json) and updates the internal url
var checkPart = require('../controllers/website/check-part.js');
router.use(checkPart);

// GET home page
var home = require('../controllers/website/home.js');
router.get('/', home);

module.exports = router;