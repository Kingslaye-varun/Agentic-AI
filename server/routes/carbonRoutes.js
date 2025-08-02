const express = require('express');
const router = express.Router();
const { 
  getAllCarbonData,
  runCodeCarbonPrograms,
  getEmissionsData
} = require('../controllers/carbonController');

router.get('/global', getAllCarbonData);
router.post('/run-codecarbon', runCodeCarbonPrograms);
router.get('/emissions', getEmissionsData);

module.exports = router;