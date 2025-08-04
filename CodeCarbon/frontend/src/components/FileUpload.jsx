import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  CircularProgress,
  Alert,
  TextField,
  Chip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CodeIcon from '@mui/icons-material/Code';
import axios from 'axios';

const FileUpload = ({ onProgramRun }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [programType, setProgramType] = useState('');

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      
      // Try to detect program type from file extension
      const extension = selectedFile.name.split('.').pop().toLowerCase();
      switch(extension) {
        case 'py':
          setProgramType('Python');
          break;
        case 'js':
          setProgramType('JavaScript');
          break;
        case 'java':
          setProgramType('Java');
          break;
        case 'cpp':
        case 'c':
          setProgramType('C/C++');
          break;
        default:
          setProgramType('Unknown');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('program', file);
    formData.append('programType', programType);

    try {
      // Use the Vite environment variable for API URL if available
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const url = `${apiUrl}/api/run-program`;
      
      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(true);
      setLoading(false);
      
      // Notify parent component about successful run
      if (onProgramRun && response.data) {
        onProgramRun(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to run program');
      setLoading(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const droppedFile = event.dataTransfer.files[0];
      setFile(droppedFile);
      setFileName(droppedFile.name);
      
      // Detect program type
      const extension = droppedFile.name.split('.').pop().toLowerCase();
      switch(extension) {
        case 'py':
          setProgramType('Python');
          break;
        case 'js':
          setProgramType('JavaScript');
          break;
        case 'java':
          setProgramType('Java');
          break;
        case 'cpp':
        case 'c':
          setProgramType('C/C++');
          break;
        default:
          setProgramType('Unknown');
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        mb: 4,
        border: '2px dashed #ccc',
        borderRadius: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: 'primary.main',
        }
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <Typography variant="h5" gutterBottom align="center">
        Upload Your Program
      </Typography>
      
      <Box sx={{ textAlign: 'center', my: 3 }}>
        <input
          accept=".py,.js,.java,.cpp,.c"
          style={{ display: 'none' }}
          id="raised-button-file"
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="raised-button-file">
          <Button 
            variant="contained" 
            component="span"
            startIcon={<CloudUploadIcon />}
            sx={{ mb: 2 }}
          >
            Select File
          </Button>
        </label>
        
        {fileName && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <CodeIcon color="primary" />
            <Typography>{fileName}</Typography>
            {programType && <Chip label={programType} size="small" color="primary" variant="outlined" />}
          </Box>
        )}
      </Box>

      {programType === 'Unknown' && (
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Program Type"
            variant="outlined"
            placeholder="e.g., Python, JavaScript"
            value={programType}
            onChange={(e) => setProgramType(e.target.value)}
            size="small"
          />
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button 
          variant="contained" 
          color="success" 
          onClick={handleUpload}
          disabled={!file || loading}
          sx={{ minWidth: 150 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Run Program'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Program executed successfully! Check the emissions data below.
        </Alert>
      )}
    </Paper>
  );
};

export default FileUpload;