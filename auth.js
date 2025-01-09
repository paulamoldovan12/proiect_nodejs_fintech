//CONFIGURE PASSPORT.JS FOR AUTHENTICATION USING A LOCAL STRATEGY
//INCLUDE LOGIC FOR VALIDATING USERS, SERIALIZING USER DATA INTO SESSION AND DESERIALIZING USER DATA FROM SESSIONS

const passport = require('passport'); //import passport.js for user authentication
const LocalStrategy = require('passport-local').Strategy; //import the local authentication strategy for passport.js
const bcrypt = require('bcrypt'); //import bcrypt for hashing and comparing passwords
const pool = require("./db"); //import the database connection pool for querying the database

passport.use(new LocalStrategy(async (username, password, done) => {
    //define the passport.js local strategy for authentication
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]); //query the database for a user with the given username
        const user = rows[0]; //get the first matching user
        if (!user) {
            return done(null, false, {message: 'Incorrect username.'}); //return an error message if the user is not found
        }
        const passwordMatch = await bcrypt.compare(password, user.password); //compare the provided password with the hashed password in the database
        if (!passwordMatch) {
            return done(null, false, {message: 'Incorrect password.'}); //return an error message if the password is incorrect
        }
        return done(null, user); //if authentication is successful, return the user
    } catch (error) {
        return done(error); //handle errors
    }
}));

passport.serializeUser((user, done) => {
    //serialize the user ID into the session
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    //deserialize the user by their ID from the session
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]); //query the database to retrieve the user by their ID
        const user = rows[0]; //get the first matching user
        done(null, user); //error == null
    } catch (error) {
        done(error); //handle errors
    }
});