const getUKData = require('../scrapers/uk');
const getCaliforniaData = require('../scrapers/california');
const getGermanyData = require('../scrapers/germany');
const getFranceData = require('../scrapers/france');
const getIndiaData = require('../scrapers/india');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

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

const runCodeCarbonPrograms = async (req, res) => {
  try {
    const { programs } = req.body;
    
    if (!programs || !Array.isArray(programs) || programs.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of programs to run' });
    }
    
    // Validate program names
    const validPrograms = ['data_processing', 'ml_training', 'web_scraping', 'image_processing', 'matrix_operations'];
    const invalidPrograms = programs.filter(p => !validPrograms.includes(p));
    
    if (invalidPrograms.length > 0) {
      return res.status(400).json({ 
        error: `Invalid program names: ${invalidPrograms.join(', ')}`,
        validPrograms
      });
    }
    
    // Path to the CodeCarbon directory
    const codeCarbonDir = path.resolve(path.join(__dirname, '../../CodeCarbon'));
    console.log('CodeCarbon directory path:', codeCarbonDir);
    
    // Create results directory if it doesn't exist
    const resultsDir = path.join(codeCarbonDir, 'results');
    if (!fs.existsSync(resultsDir)) {
      console.log(`Creating results directory: ${resultsDir}`);
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    // Create a custom run script for the selected programs
    const pythonScript = `
from codecarbon import EmissionsTracker
import subprocess
import time
import os

# Ensure results directory exists
results_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'results')
if not os.path.exists(results_dir):
    os.makedirs(results_dir)

# List of programs to run
programs = [
    ${programs.map(p => `"${p}"`).join(',\n    ')}
]

if __name__ == "__main__":
    # Initialize the tracker
    tracker = EmissionsTracker(
        project_name="custom_run",
        output_file="results/emissions.csv",
        log_level="error"
    )
    tracker.start()
    
    try:
        for program in programs:
            print("Running " + program + "...")
            start_time = time.time()
            program_path = os.path.join("programs", program + ".py")
            if os.path.exists(program_path):
                subprocess.run(["python", program_path], check=True)
                duration = time.time() - start_time
                print("Completed " + program + " in " + "{:.2f}".format(duration) + " seconds")
            else:
                print("Error: Program file not found: " + program_path)
    finally:
        emissions = tracker.stop()
        print("\nTotal emissions for selected programs: " + "{:.6f}".format(emissions) + " kg CO2")
`;
    
    // Write the temporary script
    const tempScriptPath = path.join(codeCarbonDir, 'run_selected.py');
    fs.writeFileSync(tempScriptPath, pythonScript);
    
    // Check if the directory exists
    if (!fs.existsSync(codeCarbonDir)) {
      return res.status(500).json({ 
        error: 'CodeCarbon directory not found', 
        details: `Directory not found: ${codeCarbonDir}` 
      });
    }
    
    // Check if Python is installed
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
    
    // First check if codecarbon is installed
    try {
      console.log('Checking if codecarbon is installed...');
      const checkScriptPath = 'check_codecarbon.py';
      console.log(`Running script: ${pythonCommand} ${checkScriptPath} in directory ${codeCarbonDir}`);
      
      const checkResult = await new Promise((resolve, reject) => {
        const checkProcess = spawn(pythonCommand, [checkScriptPath], { 
          shell: true,
          cwd: codeCarbonDir
        });
        
        let output = '';
        let errorOutput = '';
        
        checkProcess.stdout.on('data', (data) => {
          output += data.toString();
          console.log(`Python stdout: ${data}`);
        });
        
        checkProcess.stderr.on('data', (data) => {
          errorOutput += data.toString();
          console.error(`Python stderr: ${data}`);
        });
        
        checkProcess.on('close', (code) => {
          console.log(`Python check process exited with code ${code}`);
          if (code !== 0 || output.includes('not installed')) {
            reject(new Error(`CodeCarbon package not installed: ${errorOutput || output}`));
          } else {
            console.log('CodeCarbon is installed:', output);
            resolve(true);
          }
        });
      });
    } catch (error) {
      console.error('Error checking for CodeCarbon:', error);
      return res.status(500).json({
        error: 'Python dependency missing',
        details: `The CodeCarbon package is not installed. Please install it using: pip install -r ${path.join(codeCarbonDir, 'requirements.txt')}`
      });
    }
    
    console.log(`Executing Python script with command: ${pythonCommand} ${tempScriptPath}`);
    console.log(`Working directory: ${codeCarbonDir}`);
    
    // Run the script
    const pythonProcess = spawn(pythonCommand, [tempScriptPath], { 
      cwd: codeCarbonDir,
      shell: true // Use shell on Windows to find Python in PATH
    });
    
    let output = '';
    let errorOutput = '';
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
      console.log(`Python stdout: ${data}`);
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error(`Python stderr: ${data}`);
    });
    
    pythonProcess.on('close', (code) => {
      // Clean up the temporary script
      try {
        fs.unlinkSync(tempScriptPath);
      } catch (err) {
        console.error('Error deleting temporary script:', err);
      }
      
      console.log(`Python process exited with code ${code}`);
      
      if (code !== 0) {
        // Check for common Python errors
        if (errorOutput.includes('ModuleNotFoundError')) {
          return res.status(500).json({ 
            error: 'Python module not found', 
            details: `${errorOutput}\nPlease install required packages using: pip install -r ${path.join(codeCarbonDir, 'requirements.txt')}` 
          });
        } else if (errorOutput.includes('PermissionError')) {
          return res.status(500).json({ 
            error: 'Permission error', 
            details: `${errorOutput}\nPlease check file permissions in the CodeCarbon directory` 
          });
        } else if (errorOutput.includes('FileNotFoundError')) {
          return res.status(500).json({ 
            error: 'File not found', 
            details: `${errorOutput}\nPlease check if all required files exist in the CodeCarbon directory` 
          });
        } else {
          return res.status(500).json({ 
            error: 'Error running CodeCarbon programs', 
            details: errorOutput 
          });
        }
      }
      
      // Read the emissions data
      const emissionsPath = path.join(codeCarbonDir, 'results', 'emissions.csv');
      const results = [];
      
      fs.createReadStream(emissionsPath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          res.json({ 
            message: 'Programs executed successfully', 
            output, 
            emissions: results.filter(r => programs.some(p => r.project_name.includes(p)) || r.project_name === 'custom_run')
          });
        })
        .on('error', (err) => {
          res.status(500).json({ 
            error: 'Error reading emissions data', 
            details: err.message 
          });
        });
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to run CodeCarbon programs', 
      details: error.message 
    });
  }
};

const getEmissionsData = async (req, res) => {
  try {
    const codeCarbonDir = path.resolve(path.join(__dirname, '../../CodeCarbon'));
    console.log('CodeCarbon directory path for emissions:', codeCarbonDir);
    
    if (!fs.existsSync(codeCarbonDir)) {
      return res.status(500).json({ 
        error: 'CodeCarbon directory not found', 
        details: `Directory not found: ${codeCarbonDir}` 
      });
    }
    
    const emissionsPath = path.join(codeCarbonDir, 'results', 'emissions.csv');
    console.log('Emissions file path:', emissionsPath);
    
    if (!fs.existsSync(emissionsPath)) {
      return res.status(404).json({ error: 'Emissions data not found' });
    }
    
    const results = [];
    
    fs.createReadStream(emissionsPath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        res.json({ 
          emissions: results 
        });
      })
      .on('error', (err) => {
        res.status(500).json({ 
          error: 'Error reading emissions data', 
          details: err.message 
        });
      });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch emissions data', 
      details: error.message 
    });
  }
};

module.exports = { 
  getAllCarbonData,
  runCodeCarbonPrograms,
  getEmissionsData
};