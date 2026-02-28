import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import app from "./app.js";

// Services and Models
import { saveLocation } from "./services/locationService.js";
import Location from "./models/Locations.js"; // Ensure this filename matches your folder exactly

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// 1. Create HTTP Server
const server = http.createServer(app);

// 2. Initialize Socket.io
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your Vite frontend URL
    methods: ["GET", "POST"],
  },
});

// 3. Socket.io Event Handling
io.on("connection", (socket) => {
  console.log(`📡 Connection Established: ${socket.id}`);

  // When a driver starts tracking, they "Check In" to the socket
  socket.on("driver-active", async (data) => {
    // Safety check to prevent "undefined" errors
    if (!data || !data.driverId) {
      console.error("❌ driver-active received but driverId is missing!");
      return;
    }

    const { driverId } = data;
    
    // Store driverId on the socket object itself for the disconnect listener
    socket.driverId = driverId; 
    
    console.log(`🚚 Driver ${driverId} is now ONLINE`);

    try {
      // 1. Update Database Status (upsert: true creates it if it doesn't exist)
      await Location.findOneAndUpdate(
        { driverId },
        { status: "online", lastSeen: new Date() },
        { upsert: true, new: true }
      );

      // 2. Alert all Owners/Dispatchers immediately
      io.emit("status-update", { driverId, status: "online" });
    } catch (error) {
      console.error("Error setting online status:", error);
    }
  });

  // Listen for moving driver location updates
  socket.on("update-location", async (data) => {
    if (!data.driverId) return;

    try {
      // data: { driverId, coordinates: { latitude, longitude } }
      await saveLocation(data.driverId, data.coordinates);
      
      // Broadcast location to all connected clients (Owners)
      socket.broadcast.emit("location-received", data);
    } catch (error) {
      console.error("Error saving location:", error);
    }
  });

  // Handle Disconnection (Tab closed, Phone off, etc.)
  socket.on("disconnect", async () => {
    if (socket.driverId) {
      console.log(`🚫 Driver ${socket.driverId} went OFFLINE`);
      
      try {
        // 1. Update Database Status to offline
        await Location.findOneAndUpdate(
          { driverId: socket.driverId },
          { status: "offline", lastSeen: new Date() }
        );

        // 2. Alert all Owners/Dispatchers
        io.emit("status-update", { 
          driverId: socket.driverId, 
          status: "offline" 
        });
      } catch (error) {
        console.error("Error setting offline status:", error);
      }
    }
    console.log(`User Disconnected: ${socket.id}`);
  });
});

// 4. Database Connection & Server Start
const startServer = async () => {
  try {
    if (!MONGO_URI) throw new Error("MONGO_URI is missing in .env file");

    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected Successfully");

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Database Connection Failed:", error.message);
    process.exit(1); 
  }
};

startServer();