var express = require('express');
var router = express.Router();

/* check 'part' (html, dust or json) */
var checkPart = require('../controllers/website/check-part.js');
router.use(checkPart);

/* GET home page. */
var home = require('../controllers/website/home.js');
router.get('/', home);

module.exports = router;