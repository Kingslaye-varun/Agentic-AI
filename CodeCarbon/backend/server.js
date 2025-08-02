import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { createLogger, format, transports } from 'winston';
import csv from 'csv-parser';

// Initialize Express
const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logger configuration
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ]
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/emissions', async (req, res) => {
  try {
    const results = [];
    const filePath = path.join(process.cwd(), 'results', 'emissions.csv');
    
    if (!fs.existsSync(filePath)) {
      logger.error('Emissions file not found');
      return res.status(404).json({ error: 'Data not available yet' });
    }

    // Read and parse CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    logger.info(`Successfully served ${results.length} emissions records`);
    res.json(results);
  } catch (error) {
    logger.error(`Error processing emissions data: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message}`);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error'
    }
  });
});

// Server startup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`API server listening on port ${PORT}`);
});