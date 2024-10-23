import { config } from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import userAuth from '../routes/authRoute.js';
import rideRoutes from '../routes/rideRoutes.js';
import { sql } from '@vercel/postgres'
import bodyParser from 'body-parser'
import path from 'path'
import { fileURLToPath } from 'url'
import morgan from 'morgan';
import cors from 'cors';
import { createServer } from 'http';  // Import http module
import { Server } from 'socket.io';  // Import socket.io
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';  // Use import for Google OAuth2 Strategy
import googledb from '../models/googleauth.js';

config()

const clientid = process.env.clientid;
const clientsecret = process.env.clientsecret;

const __filenameNew = fileURLToPath(import.meta.url)

const __dirname = path.dirname(__filenameNew)

// Create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false });

const app = express();
app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'components', 'home.htm'));
});

app.get('/about', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'components', 'about.htm'));
});

app.get('/uploadUser', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'components', 'user_upload_form.htm'));
});

app.get('/api/version', function (req, res) {
    return res.json({ version: 3 })
})

app.post('/uploadSuccessful', urlencodedParser, async (req, res) => {
    try {
        await sql`INSERT INTO Users (Id, Name, Email) VALUES (${req.body.user_id}, ${req.body.name}, ${req.body.email});`;
        res.status(200).send('<h1>User added successfully</h1>');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error adding user');
    }
});

// ______________________________________ MY_SERVER ___________________________________________________________________________

app.use('/api/v1/rides', rideRoutes);
app.use('/api/v1/auth', userAuth);



// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,  // Adjust the server selection timeout
    socketTimeoutMS: 45000,          // Optional: Adjust socket timeout
    connectTimeoutMS: 10000,         // Optional: Adjust connection timeout
}).then(() => console.log('MongoDB connected...'))
    .catch(err => console.error('MongoDB connection error:', err));

// _______________________________________   Websockets | Pasport ________________________________________________________________

// Create an HTTP server
const httpServer = createServer(app);

// Initialize socket.io
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",  // Allow all origins, you can restrict this to specific domains
        methods: ["GET", "POST"],
        credentials: true,
    }
});




// Middleware
app.use(morgan('dev')); // Logger
app.use(express.json()); // Parse incoming JSON requests
app.use(cors({
    origin: "http://localhost:3000",  // Allow all origins, you can restrict this to specific domains
    methods: ["GET", "POST"],
    credentials: true,
})); // Enable CORS for all routes

app.use(session({
    secret: "googleuth1234",
    resave: false,
    saveUninitialized: true
}));

// Setup passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new GoogleStrategy({
        clientID: clientid,
        clientSecret: clientsecret,
        callbackURL: "/auth/google/callback",
        scope: ["profile", "email"]
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await googledb.findOne({ googleId: profile.id });

                if (!user) {
                    user = new googledb({
                        googleId: profile.id,
                        displayName: profile.displayName,
                        email: profile.emails[0].value,
                        image: profile.photos[0].value
                    });

                    await user.save();
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);



passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Initial Google OAuth login
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback", passport.authenticate("google", {
    successRedirect: "http://localhost:3000/signin",
    failureRedirect: "http://localhost:3000/register"
}));

// ______________________________________ Websockets | Chat _______________________________________________________


// Socket.io connection
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
    });

    socket.broadcast.emit("welcome", `${socket.id} joined the server`);
    // Listen for a driver to send their location
    socket.on("driverLocation", (locationData) => {
        const { driverId, lat, lng } = locationData;
        console.log(`Driver ${driverId} is at ${lat}, ${lng}`);

        // Broadcast the driver's location to all connected clients (or specific passenger)
        io.emit("locationUpdate", locationData); // You may use `socket.broadcast.emit` to exclude the sender
    });

    socket.on('send_message', (data) => {
        io.to(data.room).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});



app.listen(3000, () => console.log('Server ready on port 3000.'));

export { io }
export default app;
