import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const fetchGlobalCarbonData = async () => {
  const res = await axios.get(`${API_URL}/api/carbon/global`);
  return res.data;
};

export const runCodeCarbonPrograms = async (programs) => {
  const res = await axios.post(`${API_URL}/api/carbon/run-codecarbon`, { programs });
  return res.data;
};

export const fetchEmissionsData = async () => {
  const res = await axios.get(`${API_URL}/api/carbon/emissions`);
  return res.data;
};