import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './App.css';

function App() {
  const [emissionsData, setEmissionsData] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/emissions')
      .then(response => response.json())
      .then(data => {
        // Process data for visualization
        const processedData = data.map(item => ({
          name: item.project_name,
          emissions: parseFloat(item.emissions),
          energy: parseFloat(item.energy_consumed),
          duration: parseFloat(item.duration)
        }));
        setEmissionsData(processedData);
      });
  }, []);

  return (
    <div className="App">
      <h1>CodeCarbon Emissions Dashboard</h1>
      
      <div className="chart-container">
        <h2>Carbon Emissions by Program (kg CO2)</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={emissionsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="emissions" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h2>Energy Consumption by Program (kWh)</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={emissionsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="energy" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="data-table">
        <h2>Detailed Emissions Data</h2>
        <table>
          <thead>
            <tr>
              <th>Program</th>
              <th>Emissions (kg CO2)</th>
              <th>Energy (kWh)</th>
              <th>Duration (s)</th>
            </tr>
          </thead>
          <tbody>
            {emissionsData.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.emissions.toFixed(6)}</td>
                <td>{item.energy.toFixed(6)}</td>
                <td>{item.duration.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;