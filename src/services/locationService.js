import Location from "../models/Locations.js"; // Adjust path as needed

export const saveLocation = async (driverId, coords) => {
  // We use findOneAndUpdate to ensure 1 Driver = 1 Document
  return await Location.findOneAndUpdate(
    { driverId: driverId }, 
    { 
      // Using MongoDB GeoJSON format: [longitude, latitude]
      location: {
        type: "Point",
        coordinates: [coords.longitude, coords.latitude] 
      },
      updatedAt: new Date()
    },
    { 
      upsert: true, // Create if doesn't exist
      new: true,    // Return the updated document
      setDefaultsOnInsert: true 
    }
  );
};