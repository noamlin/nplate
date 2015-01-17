var express = require('express');
var router = express.Router();

/* GET home page. */
var home = require('../controllers/website/home.js');
router.get('/:part?', home); // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< NEED TO FIX THAT 'part' ONLY APPLIES FOR html/dust/json

module.exports = router;