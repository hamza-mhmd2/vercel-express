// routes/rideRoutes.js
const express = require('express');
const { createRide, searchRides, joinRide, cancelRide, getUserRideHistory, searchFilteredDrivers } = require('../controllers/rideController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/create', createRide);
router.get('/search', searchRides); // Passengers search for rides
router.post('/join', joinRide);
router.post('/cancel', cancelRide); // Drivers cancel a ride
router.get('/ride-history', authMiddleware, getUserRideHistory);
router.get('/filtered-drivers', searchFilteredDrivers);
module.exports = router;
