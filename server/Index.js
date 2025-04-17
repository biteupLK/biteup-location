// server/index.js

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3001;

const GOOGLE_API_KEY = 'AIzaSyCVIbSbVplABKuBC_NOIOILnLYZ4yrfGvc'; // Replace with your actual API key

app.use(cors());

app.get('/distance', async (req, res) => {
  const { origin, destination } = req.query;

  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/distancematrix/json',
      {
        params: {
          origins: origin,
          destinations: destination,
          key: GOOGLE_API_KEY,
          units: 'metric',
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching distance:', error.message);
    res.status(500).json({ error: 'Failed to fetch distance data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
