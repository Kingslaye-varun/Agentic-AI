# CodeCarbon Dashboard

A full-stack application for tracking and visualizing the carbon footprint of your code using CodeCarbon. This dashboard allows you to upload and run programs while monitoring their carbon emissions and energy consumption.

## Features

- Upload and run programs (Python, JavaScript) with carbon tracking
- Real-time visualization of carbon emissions data
- Detailed emissions statistics and comparisons
- Docker containerization for consistent environments
- React Vite frontend with Material UI components
- Express.js backend API

## Architecture

The application consists of the following components:

- **Frontend**: React Vite application with Material UI for the user interface
- **Backend**: Express.js server that handles API requests and file uploads
- **CodeCarbon Runner**: Docker container that runs Python programs with CodeCarbon tracking
- **Node CodeCarbon**: Docker container that runs JavaScript programs with CodeCarbon tracking

## Prerequisites

- Docker and Docker Compose
- Node.js (for local development)

## Getting Started

### Running with Docker Compose

1. Clone the repository
2. Navigate to the project directory
3. Build and start the containers:

```bash
docker-compose up --build
```

4. Access the dashboard at http://localhost:3000

### Development Setup

#### Backend

```bash
cd backend
npm install
npm start
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Usage

1. Upload a program file (Python or JavaScript)
2. The system will automatically detect the program type
3. Click "Run Program" to execute it with carbon tracking
4. View the emissions data in the dashboard charts and tables

## Project Structure

```
├── backend/               # Express.js backend
│   ├── routes/            # API routes
│   └── server.js          # Main server file
├── frontend/              # React Vite frontend
│   ├── public/            # Static assets
│   └── src/               # React components and styles
│       ├── components/    # UI components
│       └── App.js         # Main application component
├── node-codecarbon/       # Node.js CodeCarbon runner
├── programs/              # Example programs
├── results/               # Emissions data output
└── docker-compose.yml     # Docker Compose configuration
```

## Environment Variables

- `PORT`: Backend server port (default: 5000)
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:3000)
- `CODECARBON_OUTPUT_DIR`: Directory for emissions data (default: /app/results)

## License

MIT