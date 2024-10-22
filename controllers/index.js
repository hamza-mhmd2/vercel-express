// import express from 'express';
// import mongoose from 'mongoose';
// import userAuth from '../routes/authRoute.js';
// import rideRoutes from '../routes/rideRoutes.js';
// import cors from 'cors';
// import morgan from 'morgan';
// import dotenv from 'dotenv';
// import { createServer } from 'http';  // Import http module
// import { Server } from 'socket.io';  // Import socket.io
// import session from 'express-session';
// import passport from 'passport';
// import { Strategy as GoogleStrategy } from 'passport-google-oauth2';  // Use import for Google OAuth2 Strategy
// import googledb from '../models/googleauth.js';

// dotenv.config();

// const clientid = process.env.clientid;
// const clientsecret = process.env.clientsecret;


// // Create an instance of Express
// const app = express();

// // Create an HTTP server
// const httpServer = createServer(app);

// // Initialize socket.io
// const io = new Server(httpServer, {
//     cors: {
//         origin: "http://localhost:3000",  // Allow all origins, you can restrict this to specific domains
//         methods: ["GET", "POST"],
//         credentials: true,
//     }
// });

// // Middleware
// app.use(morgan('dev')); // Logger
// app.use(express.json()); // Parse incoming JSON requests
// app.use(cors({
//     origin: "http://localhost:3000",  // Allow all origins, you can restrict this to specific domains
//     methods: ["GET", "POST"],
//     credentials: true,
// })); // Enable CORS for all routes

// app.use(session({
//     secret: "googleuth1234",
//     resave: false,
//     saveUninitialized: true
// }));

// // Setup passport
// app.use(passport.initialize());
// app.use(passport.session());

// passport.use(
//     new GoogleStrategy({
//         clientID: clientid,
//         clientSecret: clientsecret,
//         callbackURL: "/auth/google/callback",
//         scope: ["profile", "email"]
//     },
//         async (accessToken, refreshToken, profile, done) => {
//             try {
//                 let user = await googledb.findOne({ googleId: profile.id });

//                 if (!user) {
//                     user = new googledb({
//                         googleId: profile.id,
//                         displayName: profile.displayName,
//                         email: profile.emails[0].value,
//                         image: profile.photos[0].value
//                     });

//                     await user.save();
//                 }

//                 return done(null, user);
//             } catch (error) {
//                 return done(error, null);
//             }
//         }
//     )
// );

// passport.serializeUser((user, done) => {
//     done(null, user);
// });

// passport.deserializeUser((user, done) => {
//     done(null, user);
// });

// // Initial Google OAuth login
// app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// app.get("/auth/google/callback", passport.authenticate("google", {
//     successRedirect: "http://localhost:3000/signin",
//     failureRedirect: "http://localhost:3000/register"
// }));

// // Routes
// app.use('/api/v1/rides', rideRoutes);
// app.use('/api/v1/auth', userAuth);

// // Connect to MongoDB
// mongoose.connect(process.env.MONGO_URI, {

//     useUnifiedTopology: true,

//     serverSelectionTimeoutMS: 5000,  // Adjust the server selection timeout
//     socketTimeoutMS: 45000,          // Optional: Adjust socket timeout
//     connectTimeoutMS: 10000,         // Optional: Adjust connection timeout
// }).then(() => console.log('MongoDB connected...'))
//     .catch(err => console.error('MongoDB connection error:', err));

// // Basic route
// app.get('/', (req, res) => {
//     res.send('Welcome to the Carpool Application');
// });


// app.get('/apitest', (req, res) => {
//     res.json({ success: 'Welcome to the Carpool Application' });
// });


// // Socket.io connection
// io.on('connection', (socket) => {
//     console.log('New client connected');

//     socket.on('join_room', (room) => {
//         socket.join(room);
//         console.log(`User joined room: ${room}`);
//     });

//     socket.broadcast.emit("welcome", `${socket.id} joined the server`);
//     // Listen for a driver to send their location
//     socket.on("driverLocation", (locationData) => {
//         const { driverId, lat, lng } = locationData;
//         console.log(`Driver ${driverId} is at ${lat}, ${lng}`);

//         // Broadcast the driver's location to all connected clients (or specific passenger)
//         io.emit("locationUpdate", locationData); // You may use `socket.broadcast.emit` to exclude the sender
//     });

//     socket.on('send_message', (data) => {
//         io.to(data.room).emit('receive_message', data);
//     });

//     socket.on('disconnect', () => {
//         console.log('Client disconnected');
//     });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).send('Something went wrong!');
// });

// // Set the port and start the server
// const PORT = process.env.PORT;
// httpServer.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });

// export { io };
