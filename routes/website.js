var express = require('express');
var router = express.Router();

/* GET home page. */
//router.get()
var home = require('../controllers/home.js');
router.get('/:part?', home);

module.exports = router;