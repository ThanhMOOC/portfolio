const express = require('express');
const cors = require('cors');
const path = require('path');
const imageRoutes = require('./routes/imageRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../client')));

// Routes
app.use('/', imageRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

