import React from 'react';

const RegionCard = ({ region, carbonIntensity, timestamp }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-1">{region}</h3>
      <p className="text-2xl font-bold">{carbonIntensity} gCO₂/kWh</p>
      <p className="text-sm text-gray-500 mt-1">{new Date(timestamp).toLocaleString()}</p>
    </div>
  );
};

export default RegionCard;