const express = require('express');
const cors = require('cors');
const carbonRoutes = require('./routes/carbonRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/carbon', carbonRoutes);

module.exports = app;