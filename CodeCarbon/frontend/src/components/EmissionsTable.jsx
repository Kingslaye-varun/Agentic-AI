import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Chip,
  Tooltip
} from '@mui/material';
import { format } from 'date-fns';

const EmissionsTable = ({ data }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState('emissions');
  const [order, setOrder] = useState('desc');

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    try {
      return format(new Date(timestamp), 'MMM d, yyyy HH:mm:ss');
    } catch (error) {
      return timestamp || 'N/A';
    }
  };

  // Format emissions value
  const formatEmissions = (value) => {
    if (value === undefined || value === null) return 'N/A';
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;
    
    if (numValue < 0.000001) {
      return `${(numValue * 1000000).toFixed(2)} μg`;
    } else if (numValue < 0.001) {
      return `${(numValue * 1000).toFixed(2)} mg`;
    } else {
      return `${numValue.toFixed(6)} kg`;
    }
  };

  // Format energy value
  const formatEnergy = (value) => {
    if (value === undefined || value === null) return 'N/A';
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;
    
    if (numValue < 0.001) {
      return `${(numValue * 1000).toFixed(2)} Wh`;
    } else {
      return `${numValue.toFixed(6)} kWh`;
    }
  };

  // Get emission level color
  const getEmissionColor = (value) => {
    if (value === undefined || value === null) return 'default';
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'default';
    
    if (numValue < 0.00001) return 'success';
    if (numValue < 0.0001) return 'info';
    if (numValue < 0.001) return 'warning';
    return 'error';
  };

  // Sort function
  const descendingComparator = (a, b, orderBy) => {
    // Handle numeric fields
    if (['emissions', 'energy_consumed', 'duration'].includes(orderBy)) {
      return parseFloat(b[orderBy] || 0) - parseFloat(a[orderBy] || 0);
    }
    
    // Handle timestamp
    if (orderBy === 'timestamp') {
      return new Date(b[orderBy] || 0) - new Date(a[orderBy] || 0);
    }
    
    // Handle string fields
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  };

  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const sortedData = React.useMemo(() => {
    return [...data].sort(getComparator(order, orderBy));
  }, [data, order, orderBy]);

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - sortedData.length) : 0;

  return (
    <Paper elevation={3} sx={{ p: 2, overflow: 'hidden' }}>
      <Typography variant="h6" gutterBottom align="center">
        Detailed Emissions Data
      </Typography>
      
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="emissions data table">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'project_name'}
                  direction={orderBy === 'project_name' ? order : 'asc'}
                  onClick={() => handleRequestSort('project_name')}
                >
                  Program
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'timestamp'}
                  direction={orderBy === 'timestamp' ? order : 'asc'}
                  onClick={() => handleRequestSort('timestamp')}
                >
                  Timestamp
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'emissions'}
                  direction={orderBy === 'emissions' ? order : 'asc'}
                  onClick={() => handleRequestSort('emissions')}
                >
                  Emissions (CO₂)
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'energy_consumed'}
                  direction={orderBy === 'energy_consumed' ? order : 'asc'}
                  onClick={() => handleRequestSort('energy_consumed')}
                >
                  Energy
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'duration'}
                  direction={orderBy === 'duration' ? order : 'asc'}
                  onClick={() => handleRequestSort('duration')}
                >
                  Duration (s)
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <TableRow hover key={index}>
                  <TableCell component="th" scope="row">
                    {row.project_name || 'Unknown'}
                  </TableCell>
                  <TableCell align="right">
                    {formatTimestamp(row.timestamp)}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={`${parseFloat(row.emissions).toExponential(6)} kg CO₂`}>
                      <Chip 
                        label={formatEmissions(row.emissions)} 
                        size="small" 
                        color={getEmissionColor(row.emissions)}
                        variant="outlined"
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">
                    {formatEnergy(row.energy_consumed)}
                  </TableCell>
                  <TableCell align="right">
                    {parseFloat(row.duration).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={5} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={sortedData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default EmissionsTable;