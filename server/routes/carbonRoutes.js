const express = require('express');
const router = express.Router();
const { getAllCarbonData } = require('../controllers/carbonController');

router.get('/global', getAllCarbonData);

module.exports = router;