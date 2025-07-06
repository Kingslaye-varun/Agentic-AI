const { fetchElectricityMapsData } = require('../utils/fetchUtils');
require('dotenv').config();

const getIndiaData = async () => {
  try {
    // Using Electricity Maps API for Western India (IN-WE zone)
    const apiKey = process.env.ELECTRICITY_MAPS_API_KEY;
    const data = await fetchElectricityMapsData('IN-NO', apiKey);
    
    return {
      region: 'India (Northern)',
      carbonIntensity: Math.round(data.carbonIntensity),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching India carbon data:', error.message);
    throw new Error(`Failed to fetch carbon intensity data for Northern India: ${error.message}`);
  }
};

module.exports = getIndiaData;