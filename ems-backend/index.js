require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const connectDB = require('./db/db');
const AuthController = require('./controller/AuthController');
const EventController = require('./controller/EventController');

const port = process.env.PORT || 3000;
connectDB();

const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({
    limit: '25mb'    // Limit request body size
})); // Built-in JSON parser in Express

app.use(express.urlencoded({
    extended: true, // By using this we can pass object inside object while passing data from url.
}));

app.use(bodyParser.urlencoded({ extended: true })); // Optional: for parsing form data

// Enable cookie parser
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/api/auth', AuthController);
app.use('/api/event', EventController);

app.listen(port, () => {    
    console.log(`Server is running on port ${port}`);
});