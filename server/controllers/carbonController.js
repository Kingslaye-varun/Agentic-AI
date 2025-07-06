const getUKData = require('../scrapers/uk');
const getCaliforniaData = require('../scrapers/california');
const getGermanyData = require('../scrapers/germany');
const getFranceData = require('../scrapers/france');
const getIndiaData = require('../scrapers/india');

const getAllCarbonData = async (req, res) => {
  try {
    // Create an array to store all region data
    const allRegionData = [];
    
    // Fetch data for each region using their respective APIs
    // We'll use Promise.allSettled to handle each API call independently
    const results = await Promise.allSettled([
      getUKData(),
      getCaliforniaData(),
      getGermanyData(),
      getFranceData(),
      getIndiaData()
    ]);
    
    // Process the results for each region
    // UK Data
    if (results[0].status === 'fulfilled') {
      allRegionData.push(results[0].value);
    } else {
      console.error('Error fetching UK data:', results[0].reason.message);
      allRegionData.push({ 
        region: 'United Kingdom', 
        error: `Failed to fetch data: ${results[0].reason.message}`, 
        timestamp: new Date().toISOString() 
      });
    }
    
    // California Data
    if (results[1].status === 'fulfilled') {
      allRegionData.push(results[1].value);
    } else {
      console.error('Error fetching California data:', results[1].reason.message);
      allRegionData.push({ 
        region: 'California (CAISO)', 
        error: `Failed to fetch data: ${results[1].reason.message}`, 
        timestamp: new Date().toISOString() 
      });
    }
    
    // Germany Data
    if (results[2].status === 'fulfilled') {
      allRegionData.push(results[2].value);
    } else {
      console.error('Error fetching Germany data:', results[2].reason.message);
      allRegionData.push({ 
        region: 'Germany', 
        error: `Failed to fetch data: ${results[2].reason.message}`, 
        timestamp: new Date().toISOString() 
      });
    }
    
    // France Data
    if (results[3].status === 'fulfilled') {
      allRegionData.push(results[3].value);
    } else {
      console.error('Error fetching France data:', results[3].reason.message);
      allRegionData.push({ 
        region: 'France', 
        error: `Failed to fetch data: ${results[3].reason.message}`, 
        timestamp: new Date().toISOString() 
      });
    }
    
    // India Data
    if (results[4].status === 'fulfilled') {
      allRegionData.push(results[4].value);
    } else {
      console.error('Error fetching India data:', results[4].reason.message);
      allRegionData.push({ 
        region: 'Western India', 
        error: `Failed to fetch data: ${results[4].reason.message}`, 
        timestamp: new Date().toISOString() 
      });
    }
    
    res.json(allRegionData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
};

module.exports = { getAllCarbonData };