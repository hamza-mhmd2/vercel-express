// controllers/rideController.js
import mongoose from 'mongoose';
import Ride from '../models/rideSchema.js';
import User from '../models/userSchema.js';

export const createRide = async (req, res) => {
    const { driver, passenger, origin, destination, departureTime, bookedSeats, price, passengers_gender } = req.body;
  
    try {
      // Validate input
      if (!driver || !passenger || !origin || !destination || !departureTime || !bookedSeats || !price || !passengers_gender) {
        return res.status(400).json({ error: 'All fields are required' });
      }
  
      // Ensure passengers_gender length matches bookedSeats
      if (passengers_gender.length !== bookedSeats) {
        return res.status(400).json({ error: 'Number of genders provided does not match the number of booked seats' });
      }
  
      // Create the ride
      const ride = new Ride({
        driver,
        passenger,
        origin,
        destination,
        departureTime,
        bookedSeats,
        price,
        passengers_gender, // Store passenger genders
      });
  
      await ride.save();
  
      const updatedDriver = await User.findById(driver);
      if (updatedDriver) {
        updatedDriver.vehicle.available_seats -= bookedSeats;
        await updatedDriver.save();
      } else {
        console.log('Cannot find driver');
      }
  
      // Emit event to create a chat room for the ride
  
      res.status(201).json({ message: 'Ride created successfully', ride });
    } catch (error) {
      console.error('Error creating ride:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
export const searchRides = async (req, res) => {
    try {
        const { origin, destination, departureTime } = req.query;
        const query = { status: 'upcoming' };
        if (origin) query['origin.address'] = origin;
        if (destination) query['destination.address'] = destination;
        if (departureTime) query.departureTime = { $gte: new Date(departureTime) };

        const rides = await Ride.find(query).populate('driver passengers');
        res.status(200).json(rides);
    } catch (error) {
        res.status(500).json({ error: 'Failed to search rides' });
    }
};

export const joinRide = async (req, res) => {
    try {
        const { rideId } = req.body;
        const userId = req.user.id;

        if (!rideId) {
            return res.status(400).json({ error: 'Ride ID is required' });
        }

        if (!mongoose.Types.ObjectId.isValid(rideId)) {
            return res.status(400).json({ error: 'Invalid Ride ID' });
        }

        const ride = await Ride.findById(rideId);
        if (!ride) {
            return res.status(404).json({ error: 'Ride not found' });
        }

        if (ride.availableSeats > 0) {
            ride.passengers.push(userId);
            ride.availableSeats -= 1;

            await ride.save();

            await User.findByIdAndUpdate(userId, { $push: { joinedRides: rideId } });

            res.status(200).json({ message: 'Successfully joined ride', ride });
        } else {
            res.status(400).json({ error: 'No available seats' });
        }
    } catch (error) {
        console.error('Error joining ride:', error);
        res.status(500).json({ error: 'Failed to join ride' });
    }
};

export const cancelRide = async (req, res) => {
    try {
        const { rideId } = req.body;
        const ride = await Ride.findById(rideId);

        if (ride.driver.equals(req.user.id)) {
            ride.status = 'cancelled';
            await ride.save();
            res.status(200).json({ message: 'Ride cancelled' });
        } else {
            res.status(403).json({ error: 'Unauthorized' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to cancel ride' });
    }
};




export const getUserRideHistory = async (req, res) => {
    try {
        const userId = req.user.id; // Extract user ID from JWT token
        
        // Find all rides where the user is a passenger
        const rides = await Ride.find({ passenger: userId });

        if (!rides || rides.length === 0) {
            console.log('empty')
            return res.status(404).json({ error: 'No rides found for this user' });
            
        }

        res.status(200).json(rides);
        console.log(rides)
    } catch (error) {
        console.error('Error fetching ride history:', error);
        res.status(500).json({ error: 'Failed to fetch ride history' });
    }
};

export const searchFilteredDrivers = async (req, res) => {
    try {
        const { gender } = req.query;

        if (!gender) {
            return res.status(400).json({ error: 'Gender parameter is required' });
        }

        // Find rides with passengers of the specified gender
        const rides = await Ride.find({ passengers_gender: gender }).populate('driver');

        // Check for the presence of drivers in the rides
        const driverIds = rides
            .map(ride => ride.driver ? ride.driver._id.toString() : null)
            .filter(id => id !== null); // Remove null values

        if (driverIds.length === 0) {
            return res.status(404).json({ message: 'No drivers found for the specified gender' });
        }

        res.status(200).json({ driverIds });
    } catch (error) {
        console.error('Error fetching filtered drivers:', error);
        res.status(500).json({ error: 'Failed to fetch filtered drivers' });
    }
};




