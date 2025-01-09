//SET UP THE MAIN EXPRESS APPLICATION AND STARTS THE SERVER

const express = require('express'); //import the express framework for building the web server
const session = require('express-session'); //import express-session for managing user sessions
const passport = require('passport'); //import passport.js for user authentication
const routes = require('./routes'); //import the routes defined in the routes folder
const app = express(); //initialize an express application
const PORT = process.env.PORT || 3000;//define the port for the server to run on (default to 3000 if not set)

require('./auth'); //ensures Passport is configured

app.set('view engine', 'ejs'); //set EJS as the view engine

app.use(express.urlencoded({extended: true})); //middleware to parse URL-encoded data from incoming requests (ex: form submission)
app.use(session({ //middleware to configure session management
    secret: 'secret', //session encryption secret key
    resave: false, //do not save session if not modified
    saveUninitialized: false //do not save uninitialized sessions
}));
app.use(passport.initialize()); //initialize passport.js middleware for handling authentication
app.use(passport.session()); //enable persistent login sessions with passport.js
app.use(express.static('public')); //serve CSS file from the public directory
app.use('/', routes); //use the imported routes for handling application routes

app.listen(PORT, () => {
    //start the server on the specified port
    console.log('Server is running on http://localhost:${PORT}'); //log a message indicating the server is running
});