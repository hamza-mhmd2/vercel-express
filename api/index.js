import { config } from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import userAuth from '../routes/authRoute.js';
import rideRoutes from '../routes/rideRoutes.js';
import { sql } from '@vercel/postgres'
import bodyParser from 'body-parser'
import path from 'path'
import { fileURLToPath } from 'url'
config()

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

app.get('/apitest', function (req, res) {
    return res.json({ success: true })
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

// ______________________________________ MY_ERVER ___________________________________________________________________________

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


app.listen(3000, () => console.log('Server ready on port 3000.'));

export default app;
