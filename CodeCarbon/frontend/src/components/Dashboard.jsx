import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Grid,
  Card,
  CardContent,
  useTheme
} from '@mui/material';
import axios from 'axios';
import FileUpload from './FileUpload';
import EmissionsChart from './EmissionsChart';
import EmissionsTable from './EmissionsTable';
import CO2Icon from '@mui/icons-material/Co2';
import BoltIcon from '@mui/icons-material/Bolt';
import TimerIcon from '@mui/icons-material/Timer';
import ComputerIcon from '@mui/icons-material/Computer';

const Dashboard = () => {
  const [emissionsData, setEmissionsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalEmissions: 0,
    totalEnergy: 0,
    totalDuration: 0,
    programCount: 0
  });
  const theme = useTheme();

  useEffect(() => {
    fetchEmissionsData();
    // Set up polling every 10 seconds
    const interval = setInterval(fetchEmissionsData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchEmissionsData = async () => {
    try {
      // Use the Vite environment variable for API URL if available
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const url = `${apiUrl}/api/emissions`;
      
      const response = await axios.get(url);
      
      // Process the data
      const processedData = response.data.map(item => ({
        ...item,
        emissions: parseFloat(item.emissions || 0),
        energy_consumed: parseFloat(item.energy_consumed || 0),
        duration: parseFloat(item.duration || 0)
      }));
      
      setEmissionsData(processedData);
      
      // Calculate statistics
      const totalEmissions = processedData.reduce((sum, item) => sum + (item.emissions || 0), 0);
      const totalEnergy = processedData.reduce((sum, item) => sum + (item.energy_consumed || 0), 0);
      const totalDuration = processedData.reduce((sum, item) => sum + (item.duration || 0), 0);
      
      setStats({
        totalEmissions,
        totalEnergy,
        totalDuration,
        programCount: processedData.length
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching emissions data:', err);
      setError(err.message || 'Failed to fetch emissions data');
      setLoading(false);
    }
  };

  const handleProgramRun = (newData) => {
    // Refresh data after a new program is run
    fetchEmissionsData();
  };

  // Format emissions value
  const formatEmissions = (value) => {
    if (value < 0.000001) {
      return `${(value * 1000000).toFixed(2)} μg CO₂`;
    } else if (value < 0.001) {
      return `${(value * 1000).toFixed(2)} mg CO₂`;
    } else {
      return `${value.toFixed(6)} kg CO₂`;
    }
  };

  // Format energy value
  const formatEnergy = (value) => {
    if (value < 0.001) {
      return `${(value * 1000).toFixed(2)} Wh`;
    } else {
      return `${value.toFixed(6)} kWh`;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          color: 'white'
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom align="center">
          CodeCarbon Emissions Dashboard
        </Typography>
        <Typography variant="h6" align="center" sx={{ opacity: 0.8 }}>
          Track and analyze the carbon footprint of your code
        </Typography>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={3} 
            sx={{ 
              height: '100%',
              background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
              color: 'white'
            }}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <CO2Icon sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h5" component="div" gutterBottom>
                {formatEmissions(stats.totalEmissions)}
              </Typography>
              <Typography variant="body2">
                Total Carbon Emissions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={3} 
            sx={{ 
              height: '100%',
              background: `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.main} 100%)`,
              color: 'white'
            }}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <BoltIcon sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h5" component="div" gutterBottom>
                {formatEnergy(stats.totalEnergy)}
              </Typography>
              <Typography variant="body2">
                Total Energy Consumed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={3} 
            sx={{ 
              height: '100%',
              background: `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
              color: 'white'
            }}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <TimerIcon sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h5" component="div" gutterBottom>
                {stats.totalDuration.toFixed(2)}s
              </Typography>
              <Typography variant="body2">
                Total Execution Time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={3} 
            sx={{ 
              height: '100%',
              background: `linear-gradient(135deg, ${theme.palette.info.light} 0%, ${theme.palette.info.main} 100%)`,
              color: 'white'
            }}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <ComputerIcon sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h5" component="div" gutterBottom>
                {stats.programCount}
              </Typography>
              <Typography variant="body2">
                Programs Executed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* File Upload Section */}
      <FileUpload onProgramRun={handleProgramRun} />

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {emissionsData.length > 0 ? (
        <>
          {/* Charts Section */}
          <EmissionsChart data={emissionsData} />
          
          {/* Table Section */}
          <EmissionsTable data={emissionsData} />
        </>
      ) : (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No emissions data available yet. Upload and run a program to see results.
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default Dashboard;