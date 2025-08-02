import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CodeCarbonRunner = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [selectedPrograms, setSelectedPrograms] = useState({
    data_processing: true,
    ml_training: true,
    web_scraping: true,
    image_processing: true,
    matrix_operations: true
  });

  const handleProgramToggle = (program) => {
    setSelectedPrograms(prev => ({
      ...prev,
      [program]: !prev[program]
    }));
  };

  const runPrograms = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      const programsToRun = Object.keys(selectedPrograms).filter(key => selectedPrograms[key]);
      
      if (programsToRun.length === 0) {
        setError('Please select at least one program to run');
        setLoading(false);
        return;
      }
      
      // Show a message that this might take some time
      setResults({ message: 'Running programs, this might take a few minutes...' });
      
      const response = await axios.post(`${API_URL}/api/carbon/run-codecarbon`, {
        programs: programsToRun
      });
      
      setResults(response.data);
    } catch (err) {
      console.error('Error running CodeCarbon programs:', err);
      
      if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
        setError('Cannot connect to the server. Please make sure the server is running at ' + API_URL);
      } else if (err.response) {
        // Server responded with an error
        const errorMessage = err.response.data?.error || 'Server error';
        const errorDetails = err.response.data?.details ? `: ${err.response.data.details}` : '';
        setError(`${errorMessage}${errorDetails}`);
      } else {
        setError('Failed to run programs: ' + (err.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchEmissions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/api/carbon/emissions`);
      setResults(response.data);
    } catch (err) {
      console.error('Error fetching emissions data:', err);
      
      if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
        setError('Cannot connect to the server. Please make sure the server is running at ' + API_URL);
      } else if (err.response) {
        // Server responded with an error
        const errorMessage = err.response.data?.error || 'Server error';
        const errorDetails = err.response.data?.details ? `: ${err.response.data.details}` : '';
        setError(`${errorMessage}${errorDetails}`);
      } else {
        setError('Failed to fetch emissions data: ' + (err.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">CodeCarbon Runner</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Select Programs to Run:</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(selectedPrograms).map(program => (
            <div key={program} className="flex items-center">
              <input
                type="checkbox"
                id={program}
                checked={selectedPrograms[program]}
                onChange={() => handleProgramToggle(program)}
                className="mr-2"
              />
              <label htmlFor={program} className="capitalize">
                {program.replace('_', ' ')}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex space-x-4 mb-6">
        <button
          onClick={runPrograms}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Running...' : 'Run Selected Programs'}
        </button>
        
        <button
          onClick={fetchEmissions}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Fetch Latest Results
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {results && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Results:</h3>
          
          {results.message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {results.message}
            </div>
          )}
          
          {results.emissions && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Project</th>
                    <th className="py-2 px-4 border-b">Duration (s)</th>
                    <th className="py-2 px-4 border-b">Emissions (kg CO₂)</th>
                    <th className="py-2 px-4 border-b">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {results.emissions.map((emission, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-2 px-4 border-b">{emission.project_name}</td>
                      <td className="py-2 px-4 border-b">{parseFloat(emission.duration).toFixed(2)}</td>
                      <td className="py-2 px-4 border-b">{parseFloat(emission.emissions).toExponential(6)}</td>
                      <td className="py-2 px-4 border-b">{new Date(emission.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CodeCarbonRunner;