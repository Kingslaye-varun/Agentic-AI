const express = require('express');
// Create a mock multer implementation if the real one fails to load
let multer;
try {
  multer = require('multer');
} catch (error) {
  console.error('Error loading multer:', error);
  // Create a fallback implementation that mimics the multer API
  multer = function() {
    return {
      single: () => (req, res, next) => next(),
      array: () => (req, res, next) => next()
    };
  };
  multer.diskStorage = (opts) => ({
    getFilename: opts.filename,
    getDestination: opts.destination
  });
}
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { createLogger, format, transports } = require('winston');

const router = express.Router();

// Logger configuration
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/program-execution.log' })
  ]
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with timestamp
    const timestamp = Date.now();
    const originalName = file.originalname;
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    cb(null, `${baseName}_${timestamp}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only certain file types
    const allowedExtensions = ['.py', '.js', '.java', '.cpp', '.c'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only .py, .js, .java, .cpp, and .c files are allowed.'));
    }
  }
});

// Route to handle program upload and execution
router.post('/run-program', upload.single('program'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileName = req.file.filename;
    const programType = req.body.programType || 'Unknown';
    const projectName = path.basename(fileName, path.extname(fileName));

    logger.info(`Received file: ${fileName}, type: ${programType}`);

    // Create a Docker command based on file type
    let dockerCommand;
    const fileExtension = path.extname(fileName).toLowerCase();

    switch (fileExtension) {
      case '.py':
        dockerCommand = `docker run --rm -v "${process.cwd()}/uploads:/app/uploads" -v "${process.cwd()}/results:/app/results" codecarbon-runner python -m codecarbon.run_program --program_name="${projectName}" --output_file="/app/results/emissions.csv" --program_path="/app/uploads/${fileName}"`;
        break;
      case '.js':
        dockerCommand = `docker run --rm -v "${process.cwd()}/uploads:/app/uploads" -v "${process.cwd()}/results:/app/results" -e CODECARBON_OUTPUT_DIR=/app/results node-codecarbon node /app/uploads/${fileName}`;
        break;
      case '.java':
      case '.cpp':
      case '.c':
        // For compiled languages, we'd need more complex handling
        return res.status(400).json({ 
          message: `${fileExtension.substring(1)} files require compilation. Currently only Python and JavaScript are fully supported.` 
        });
      default:
        return res.status(400).json({ message: 'Unsupported file type' });
    }

    logger.info(`Executing command: ${dockerCommand}`);

    // Execute the Docker command
    exec(dockerCommand, (error, stdout, stderr) => {
      if (error) {
        logger.error(`Execution error: ${error.message}`);
        return res.status(500).json({ 
          message: 'Error executing program', 
          error: error.message,
          stderr
        });
      }

      if (stderr) {
        logger.warn(`Program stderr: ${stderr}`);
      }

      logger.info(`Program stdout: ${stdout}`);

      // Read the latest emissions data
      const emissionsFilePath = path.join(process.cwd(), 'results', 'emissions.csv');
      if (fs.existsSync(emissionsFilePath)) {
        // Return success with the command output
        res.status(200).json({ 
          message: 'Program executed successfully',
          output: stdout,
          fileName,
          programType
        });
      } else {
        res.status(404).json({ message: 'Emissions data not found after execution' });
      }
    });
  } catch (error) {
    logger.error(`Server error: ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;