const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./db/database');
const scanRoutes = require('./routes/scan');
const badgeRoutes = require('./routes/badge');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Init database
const db = initDB();

// Routes
app.use('/api', scanRoutes(db));
app.use('/api', badgeRoutes(db));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`VibeCheck server running on port ${PORT}`);
});
