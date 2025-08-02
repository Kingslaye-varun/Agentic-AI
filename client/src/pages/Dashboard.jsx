import React, { useEffect, useState } from 'react';
import { fetchGlobalCarbonData } from '../services/Api';
import RegionCard from '../components/RegionCard';
import CodeCarbonRunner from '../components/CodeCarbonRunner';

const Dashboard = () => {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await fetchGlobalCarbonData();
      setRegions(data);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Failed to fetch carbon data:', error);
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        setError('Cannot connect to the server. Please make sure the server is running at http://localhost:5000');
      } else if (error.response) {
        setError(`Server error: ${error.response.status} ${error.response.statusText}`);
      } else {
        setError(`Error: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Global Carbon Intensity Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {/* CodeCarbon Runner Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Code Carbon Emissions</h2>
        <CodeCarbonRunner />
      </div>
      
      {/* Global Carbon Intensity Section */}
      <h2 className="text-xl font-bold mb-4">Regional Carbon Intensity</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {regions.map((r, index) => (
            <RegionCard
              key={index}
              region={r.region}
              carbonIntensity={r.carbonIntensity}
              timestamp={r.timestamp}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
