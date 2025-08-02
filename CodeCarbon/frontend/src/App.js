import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  CircularProgress
} from '@mui/material';
import { BarChart, PieChart } from '@mui/x-charts';
import { format } from 'date-fns';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(...registerables);

function App() {
  const [emissionsData, setEmissionsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/emissions');
        const processedData = response.data.map(item => ({
          ...item,
          timestamp: format(new Date(item.timestamp), 'PPpp'),
          emissions: parseFloat(item.emissions),
          energy: parseFloat(item.energy_consumed),
          duration: parseFloat(item.duration)
        }));
        setEmissionsData(processedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Typography color="error">Error: {error}</Typography>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        CodeCarbon Emissions Dashboard
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 1fr' }, gap: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom align="center">
            Carbon Emissions by Program (kg CO₂)
          </Typography>
          <BarChart
            dataset={emissionsData}
            xAxis={[{ scaleType: 'band', dataKey: 'project_name' }]}
            series={[{ dataKey: 'emissions', label: 'CO₂ Emissions' }]}
            height={400}
          />
        </Paper>

        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom align="center">
            Energy Consumption Distribution
          </Typography>
          <PieChart
            series={[{
              data: emissionsData.map(item => ({
                id: item.project_name,
                value: item.energy,
                label: item.project_name
              }))
            }]}
            width={500}
            height={400}
          />
        </Paper>
      </Box>

      <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom align="center">
          Emissions Over Time
        </Typography>
        <Box sx={{ height: 400 }}>
          <Chart
            type="line"
            data={{
              labels: emissionsData.map(item => item.timestamp),
              datasets: [{
                label: 'CO₂ Emissions (kg)',
                data: emissionsData.map(item => item.emissions),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
              }]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false
            }}
          />
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom align="center">
          Detailed Emissions Data
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Program</TableCell>
                <TableCell align="right">Timestamp</TableCell>
                <TableCell align="right">Emissions (kg CO₂)</TableCell>
                <TableCell align="right">Energy (kWh)</TableCell>
                <TableCell align="right">Duration (s)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {emissionsData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.project_name}</TableCell>
                  <TableCell align="right">{row.timestamp}</TableCell>
                  <TableCell align="right">{row.emissions.toFixed(6)}</TableCell>
                  <TableCell align="right">{row.energy.toFixed(6)}</TableCell>
                  <TableCell align="right">{row.duration.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
}

export default App;