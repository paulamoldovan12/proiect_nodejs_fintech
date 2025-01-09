const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const pool = require('../db');
const router = express.Router();

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

router.get('/', (req, res) => {
    res.render('index', {user: req.user});

});

router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', async (req, res) => {
    try {
        const {username, password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
        if (result.affectedRows === 1) {
            res.redirect('/login');
        } else {
            throw new Error('Registration failed.');
        }
    } catch (error) {
        console.error('Error during registration:', error);
        res.render('register', {error: 'Registration failed.'});
    }
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
}));

router.get('/logout', (req, res) => {
    req.logOut((err) => {
        if (err) {
            console.error(err);
        }
        res.redirect('/');
    });
});

router.get('/manage-events', isLoggedIn, async (req, res) => {
    try {
        const [userRows] = await pool.query('SELECT * FROM users');
        const users = userRows;
        const [eventRows] = await pool.query('SELECT * FROM events');
        const events = eventRows;

        res.render('manage-events', {users, events});
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching events and users');
    }
});

router.get('/add-event', isLoggedIn, (req, res) => {
    res.render('add-event');
});

router.post('/add-event', isLoggedIn, async (req, res) => {
    try {
        const {title, description, event_date, location, max_participants} = req.body;
        await pool.query('INSERT INTO events (title, description, event_date, location, max_participants) VALUES (?, ?, ?, ?, ?)', [title, description, event_date, location, max_participants]);
        res.redirect('/manage-events');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error adding event');
    }
});

router.get('/edit-event/:id', isLoggedIn, async (req, res) => {
    const eventId = req.params.id;
    try {
        const [eventRows] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);
        const event = eventRows[0];
        res.render('edit-event', {event});
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching event details');
    }
});

router.post('/edit-event/:id', isLoggedIn, async (req, res) => {
    const eventId = req.params.id;
    const {title, description, event_date, location, max_participants} = req.body;
    try {
        await pool.query('UPDATE events SET title = ?, description = ?, event_date = ?, location = ?, max_participants = ? WHERE id = ?', [title, description, event_date, location, max_participants, eventId]);
        res.redirect('/manage-events');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating event');
    }
});

router.get('/delete-event/:id', isLoggedIn, async (req, res) => {
    const eventId = req.params.id;
    try {
        const [eventRows] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);
        const event = eventRows[0];
        res.render('delete-event', {event});
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching event details');
    }
});

router.post('/delete-event/:id', isLoggedIn, async (req, res) => {
    const eventId = req.params.id;
    try {
        await pool.query('DELETE FROM events WHERE id = ?', [eventId]);
        res.redirect('/manage-events');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting event');
    }
});

module.exports = router;