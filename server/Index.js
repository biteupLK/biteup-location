const express = require("express");
const axios = require("axios");
const cors = require("cors");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = 3001;
const GOOGLE_API_KEY = "AIzaSyCVIbSbVplABKuBC_NOIOILnLYZ4yrfGvc";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add /api prefix to all routes
app.use((req, res, next) => {
  if (!req.path.startsWith("/api") && req.path !== "/") {
    return res.redirect(`/api${req.path}`);
  }
  next();
});

const users = new Map();

// API Routes
app.get("/api/distance", async (req, res) => {
  const { origin, destination } = req.query;

  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/distancematrix/json",
      {
        params: {
          origins: origin,
          destinations: destination,
          key: GOOGLE_API_KEY,
          units: "metric",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching distance:", error.message);
    res.status(500).json({ error: "Failed to fetch distance data" });
  }
});

app.get("/api/nearest-delivery", async (req, res) => {
  const { restaurantLat, restaurantLng } = req.query;

  console.log("📦 Finding nearest delivery for:", restaurantLat, restaurantLng);

  if (!restaurantLat || !restaurantLng) {
    return res.status(400).json({ error: "Missing restaurant location" });
  }

  try {
    const origin = `${restaurantLat},${restaurantLng}`;
    const destinationsList = Array.from(users.values());
    
    if (destinationsList.length === 0) {
      return res.status(404).json({ error: "No delivery persons available" });
    }

    const destinations = destinationsList
      .map((loc) => `${loc.lat},${loc.lng}`)
      .join("|");

    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/distancematrix/json",
      {
        params: {
          origins: origin,
          destinations,
          key: GOOGLE_API_KEY,
          units: "metric",
        },
      }
    );

    const distances = response.data.rows[0].elements;

    let minDistance = Infinity;
    let nearestSocketId = null;

    distances.forEach((element, index) => {
      if (element.status === "OK" && element.distance.value < minDistance) {
        minDistance = element.distance.value;
        nearestSocketId = Array.from(users.keys())[index];
      }
    });

    if (nearestSocketId) {
      res.json({ socketId: nearestSocketId });
    } else {
      res.status(404).json({ error: "No available delivery persons found" });
    }
  } catch (err) {
    console.error("❌ Error in nearest-delivery:", err.message);
    res.status(500).json({ error: "Failed to find nearest delivery person" });
  }
});

// WebSocket connections
io.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);

  socket.on("send-location", (location) => {
    if (location && typeof location.lat === "number" && typeof location.lng === "number") {
      users.set(socket.id, location);
      console.log(`📍 Updated location for ${socket.id}:`, location);
      io.emit("user-locations", Array.from(users.entries()));
    }
  });

  socket.on("assign-order", ({ socketId, order }) => {
    if (users.has(socketId)) {
      io.to(socketId).emit("new-order", order);
      console.log(`📦 Order assigned to ${socketId}`);
    } else {
      console.log(`❌ Cannot assign order - delivery person ${socketId} not found`);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
    users.delete(socket.id);
    io.emit("user-locations", Array.from(users.entries()));
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    deliveryPersons: users.size,
    message: "Food delivery server is running",
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});