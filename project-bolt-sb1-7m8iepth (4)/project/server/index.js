import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Google Sheets API
const sheets = google.sheets({ version: 'v4', auth: process.env.VITE_GOOGLE_API_KEY });
const spreadsheetId = process.env.VITE_GOOGLE_SHEETS_ID;

// API endpoint to fetch sheet data
app.get('/api/sheets/:sheetName', async (req, res) => {
  try {
    const { sheetName } = req.params;
    const range = `'${sheetName}'!A:Z`;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    res.json({ values: response.data.values });
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    res.status(500).json({ error: 'Failed to fetch sheet data' });
  }
});

// Create Vite server in middleware mode
const createDevServer = async () => {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);
};

const startServer = async () => {
  if (process.env.NODE_ENV !== 'production') {
    await createDevServer();
  }

  const port = process.env.PORT || 5173;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer();