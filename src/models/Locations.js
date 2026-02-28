import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  driverId: { 
    type: mongoose.Schema.ObjectId,
    ref: "User" ,
    required: true ,

},
// Add this to your Location Schema
status: {
    type: String,
    enum: ['online', 'offline'],
    default: 'offline'
},
  location: {
    type: { type: String, enum: ["Point"], required: true },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  },

  timestamp: { type: Date, default: Date.now },
});

locationSchema.index({ location: "2dsphere" });

const Location = mongoose.model("Location", locationSchema);

export default Location;
