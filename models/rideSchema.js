// The Ride model stores information about each carpooling ride.
const mongoose = require('mongoose')
const { Schema } = mongoose;

const rideSchema = new Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  passengers_gender: [{ type: String }],
  origin: {
    address: String,
    coordinates: {
      type: [Number], // Array of numbers for coordinates
      index: '2dsphere' // Index for geospatial queries
    }
  },
  destination: {
    address: String,
    coordinates: {
      type: [Number], // Array of numbers for coordinates
      index: '2dsphere' // Index for geospatial queries
    }
  },
  departureTime: { type: Date, required: true },
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
  bookedSeats: { type: Number },
  price: { type: Number },
  createdAt: { type: Date, default: Date.now },

});

const Ride = mongoose.model('Ride', rideSchema);
module.exports = Ride;

