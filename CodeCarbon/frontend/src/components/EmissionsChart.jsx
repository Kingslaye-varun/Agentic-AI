import React from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  useTheme
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const EmissionsChart = ({ data }) => {
  const theme = useTheme();
  
  // Colors for the charts
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff8042'
  ];

  // Format emissions value for display
  const formatEmissions = (value) => {
    if (value < 0.000001) {
      return `${(value * 1000000).toFixed(2)} μg CO₂`;
    } else if (value < 0.001) {
      return `${(value * 1000).toFixed(2)} mg CO₂`;
    } else {
      return `${value.toFixed(6)} kg CO₂`;
    }
  };

  // Format energy value for display
  const formatEnergy = (value) => {
    if (value < 0.001) {
      return `${(value * 1000).toFixed(2)} Wh`;
    } else {
      return `${value.toFixed(6)} kWh`;
    }
  };

  // Custom tooltip for the bar chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper elevation={3} sx={{ p: 1.5, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
          <Typography variant="subtitle2" color="textPrimary">
            {label}
          </Typography>
          <Typography variant="body2" color="primary">
            Emissions: {formatEmissions(payload[0].value)}
          </Typography>
          {payload[1] && (
            <Typography variant="body2" color="secondary">
              Energy: {formatEnergy(payload[1].value)}
            </Typography>
          )}
          {payload[2] && (
            <Typography variant="body2" color="textSecondary">
              Duration: {payload[2].value.toFixed(2)} seconds
            </Typography>
          )}
        </Paper>
      );
    }
    return null;
  };

  // Custom label for the pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* Bar Chart for Emissions */}
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom align="center">
            Carbon Emissions by Program
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="project_name" 
                angle={-45} 
                textAnchor="end"
                height={70}
                interval={0}
              />
              <YAxis 
                label={{ 
                  value: 'kg CO₂', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="emissions" 
                name="Carbon Emissions" 
                fill={theme.palette.primary.main} 
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* Pie Chart for Energy Distribution */}
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom align="center">
            Energy Consumption Distribution
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={150}
                fill="#8884d8"
                dataKey="energy_consumed"
                nameKey="project_name"
                animationDuration={1500}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name, props) => [formatEnergy(value), props.payload.project_name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Box>
    </Box>
  );
};

export default EmissionsChart;