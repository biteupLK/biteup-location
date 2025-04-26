// server/index.js

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const PORT = 3001;

const GOOGLE_API_KEY = 'AIzaSyCVIbSbVplABKuBC_NOIOILnLYZ4yrfGvc';
const server = http.createServer(app);
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

const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);

  socket.on("send-location", (location) => {
    users.set(socket.id, location);
    io.emit("user-locations", Array.from(users.values()));
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
    users.delete(socket.id);
    io.emit("user-locations", Array.from(users.values()));
  });
});

const users = new Map();
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
