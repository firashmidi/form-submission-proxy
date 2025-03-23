import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable detailed debugging
const DEBUG = true;

// Use test mode to avoid hitting the actual Power Automate endpoint during testing
const TEST_MODE = true;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Debug middleware to log all requests
app.use((req, res, next) => {
  if (DEBUG) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('Request body:', JSON.stringify(req.body, null, 2));
    }
  }
  next();
});

// Serve the HTML form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Proxy endpoint for Power Automate
app.post('/api/submit', async (req, res) => {
  try {
    console.log('Received form data:', req.body);
    
    if (TEST_MODE) {
      // Simulate a successful response in test mode
      console.log('TEST MODE: Simulating successful Power Automate response');
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return res.json({
        success: true,
        message: 'Form submitted successfully (TEST MODE)',
        data: { id: 'test-123', timestamp: new Date().toISOString() }
      });
    }
    
    // Replace with your actual Power Automate endpoint URL
    const powerAutomateUrl = 'https://prod-03.northeurope.logic.azure.com:443/workflows/9f5e7c302eaf46f796d199a196ae0607/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ErimU_C1pFNYydz2O4_Tmq3F1Hhml-kDJZzJcmbYixY';
    
    if (DEBUG) {
      console.log(`Sending request to Power Automate: ${powerAutomateUrl}`);
    }
    
    const response = await fetch(powerAutomateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Power Automate error:', errorText);
      console.error('Status:', response.status, response.statusText);
      
      return res.status(response.status).json({
        success: false,
        message: 'Error submitting to Power Automate',
        details: errorText,
        status: response.status,
        statusText: response.statusText
      });
    }
    
    const data = await response.json();
    console.log('Power Automate response:', data);
    
    res.json({
      success: true,
      message: 'Form submitted successfully',
      data
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing your request',
      error: error.message,
      stack: DEBUG ? error.stack : undefined
    });
  }
});

// Test endpoint to verify server is working
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is running correctly',
    time: new Date().toISOString(),
    env: {
      nodeVersion: process.version,
      platform: process.platform
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Debug mode: ${DEBUG ? 'ON' : 'OFF'}`);
  console.log(`Test mode: ${TEST_MODE ? 'ON' : 'OFF'}`);
});
