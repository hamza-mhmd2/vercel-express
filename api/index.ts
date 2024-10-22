require('dotenv').config();
const express = require('express');
const app = express();
const { sql } = require('@vercel/postgres');
const bodyParser = require('body-parser');
const path = require('path');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const rideRoutes = require('../routes/rideRoutes.js');


app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'components', 'home.htm'));
});

app.post('/uploadSuccessful', urlencodedParser, async (req, res) => {
    try {
        await sql`INSERT INTO Users (Id, Name, Email) VALUES (${req.body.user_id}, ${req.body.name}, ${req.body.email});`;
        res.status(200).send('<h1>User added successfully</h1>');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error adding user');
    }
});


// _________________________ MY_SERVER ______________________________________________________________________________________



app.get('/apitest', function (req, res) {
    return res.json({ success: true })
})

app.use('/api/v1/rides', rideRoutes);


const clientid = process.env.clientid;
const clientsecret = process.env.clientsecret;





app.listen(3000, () => console.log('Server ready on port 3000.'));

module.exports = app;
