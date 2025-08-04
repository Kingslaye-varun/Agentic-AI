// Simple script to run the Vite development server
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Vite development server...');

// Run npm run dev
const viteProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.resolve(__dirname),
  stdio: 'inherit',
  shell: true
});

viteProcess.on('error', (error) => {
  console.error(`Error starting Vite server: ${error.message}`);
  process.exit(1);
});

viteProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`Vite server exited with code ${code}`);
    process.exit(code);
  }
});

// Handle termination signals
process.on('SIGINT', () => {
  console.log('\nShutting down Vite server...');
  viteProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\nShutting down Vite server...');
  viteProcess.kill('SIGTERM');
});