'use strict';
require('dotenv').config()
const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');
const productRouter = require('./src/routes/productRoutes');

const app = express();

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', productRouter);

// Only listen locally if we are not running in AWS Lambda
if (process.env.NODE_ENV !== 'production') {
  app.listen(3000, () => {
    console.log('Local dev server running on http://localhost:3000');
  });
}

module.exports.handler = serverless(app);
