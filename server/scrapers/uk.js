const axios = require('axios');

/**
 * Fetches carbon intensity data for the UK using the National Grid Carbon Intensity API
 * @returns {Promise<Object>} - The carbon intensity data for the UK
 */
const getUKData = async () => {
  try {
    // Using the UK Carbon Intensity API from National Grid ESO
    const response = await axios.get('https://api.carbonintensity.org.uk/intensity');
    
    if (response.data && response.data.data && response.data.data.length > 0) {
      const data = response.data.data[0];
      
      return {
        region: 'United Kingdom',
        carbonIntensity: data.intensity.actual || data.intensity.forecast,
        timestamp: new Date().toISOString()
      };
    } else {
      throw new Error('Invalid response format from UK Carbon Intensity API');
    }
  } catch (error) {
    console.error('Error fetching UK carbon data:', error.message);
    throw new Error(`Failed to fetch carbon intensity data for UK: ${error.message}`);
  }
};

module.exports = getUKData;