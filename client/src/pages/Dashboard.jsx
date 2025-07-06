import React, { useEffect, useState } from 'react';
import { fetchGlobalCarbonData } from '../services/Api';
import RegionCard from '../components/RegionCard';

const Dashboard = () => {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await fetchGlobalCarbonData();
      setRegions(data);
    } catch (error) {
      console.error('Failed to fetch carbon data:', error);
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
