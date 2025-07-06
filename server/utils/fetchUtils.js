const axios = require('axios');

/**
 * Utility function to fetch carbon intensity data from Electricity Maps API
 * @param {string} zone - The zone code for the region (e.g., 'IN-WE' for Western India)
 * @param {string} apiKey - The API key for Electricity Maps
 * @returns {Promise<Object>} - The carbon intensity data for the specified region
 */
const fetchElectricityMapsData = async (zone, apiKey) => {
  try {
    const response = await axios.get(
      `https://api.electricitymap.org/v3/carbon-intensity/latest?zone=${zone}`,
      {
        headers: {
          'auth-token': apiKey
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching data for zone ${zone}:`, error.message);
    throw error;
  }
};

module.exports = {
  fetchElectricityMapsData
};