import { saveLocation } from "../services/locationService.js";

import { io } from "../server.js";

// UPDATE: When driver sends coordinates
export const requestLocationUpdate = async (req, res) => {
  try {
    const driverId = req.user._id;
    const { coordinates } = req.body;

    // 1. Atomic update (Prevents the "Multiple Drivers" glitch)
    const updatedRecord = await saveLocation(driverId, coordinates);

    // 2. Real-time broadcast
    io.emit('location-received', {
      driverId,
      coordinates,
      timestamp: new Date()
    });

    res.status(200).json({ message: "Position synced." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// FETCH: When Owner opens dashboard
