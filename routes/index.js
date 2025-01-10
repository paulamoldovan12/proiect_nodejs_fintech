// importa modulele necesare
const express = require('express');
const bcrypt = require('bcrypt'); // pt hashul parolelor
const passport = require('passport'); // pt autentificare
const pool = require('../db'); // conexiunea la db
const router = express.Router();
const {getEventsSortedByDate} = require('../modules/event'); // functia de sortare dupa data

// middleware pt verificarea autentificarii userului
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next(); // permite accesul daca userul e autentificat
    }
    res.redirect('/login'); // daca nu, il redirectioneaza la pag de login
}

// ruta principala, afiseaza pag de start
router.get('/', (req, res) => {
    res.render('index', {user: req.user}); // reda pag index cu info userului autentificat

});

// ruta pt afisarea formularului de inreg
router.get('/register', (req, res) => {
    res.render('register'); // reda pag de inreg
});

// rupta pt procesarea inreg unui user
router.post('/register', async (req, res) => {
    try {
        const {username, password} = req.body; // preia datele din formular
        const hashedPassword = await bcrypt.hash(password, 10); // hash uieste parola
        const [result] = await pool.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
        if (result.affectedRows === 1) {
            res.redirect('/login'); // redirect la login daca a mers
        } else {
            throw new Error('Registration failed.');
        }
    } catch (error) {
        console.error('Error during registration:', error); // logheaza erorile
        res.render('register', {error: 'Registration failed.'}); // reafiseaza formularul cu un mesaj de eroare
    }
});

// ruta pt afisarea pag de login
router.get('/login', (req, res) => {
    res.render('login'); // reda pag de login
});

// ruta pt procesarea autentif userului
router.post('/login', passport.authenticate('local', {
    successRedirect: '/', // redirect la pag principala daca a reusit
    failureRedirect: '/login', // redirect la login daca nu
}));

// ruta pt logout
router.get('/logout', (req, res) => {
    req.logOut((err) => {
        if (err) {
            console.error(err); // logheaza erorile, daca exista
        }
        res.redirect('/'); // redirect la pag principala dupa logout
    });
});

// ruta pt gestionarea evenimentelor (dupa autentif)
router.get('/manage-events', isLoggedIn, async (req, res) => {
    try {
        // obt lista de useri si evenimente din db
        const [userRows] = await pool.query('SELECT * FROM users');
        const users = userRows;
        const [eventRows] = await pool.query('SELECT * FROM events');
        const events = eventRows;

        // reda pg manage-events cu userii si evenimentele
        res.render('manage-events', {users, events});
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching events and users');
    }
});

// ruta pt afisarea formularului de adaugare a unui event
router.get('/add-event', isLoggedIn, (req, res) => {
    res.render('add-event'); // reda pag pt adaugarea unui event
});

// ruta pt procesarea adaugarii unui event
router.post('/add-event', isLoggedIn, async (req, res) => {
    try {
        // preia datele din formular
        const {title, description, event_date, location, max_participants} = req.body;
        await pool.query('INSERT INTO events (title, description, event_date, location, max_participants) VALUES (?, ?, ?, ?, ?)', [title, description, event_date, location, max_participants]);
        res.redirect('/manage-events');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error adding event');
    }
});

// ruta pt afisarea formularului de editare
router.get('/edit-event/:id', isLoggedIn, async (req, res) => {
    const eventId = req.params.id; // preia id ul event
    try {
        const [eventRows] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);
        const event = eventRows[0]; // obt eventul specificat
        res.render('edit-event', {event});
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching event details');
    }
});

// ruta pt procesarea editarii unui event
router.post('/edit-event/:id', isLoggedIn, async (req, res) => {
    const eventId = req.params.id; // preia id ul event
    const {title, description, event_date, location, max_participants} = req.body; // preia datele actalizate din form
    try {
        await pool.query('UPDATE events SET title = ?, description = ?, event_date = ?, location = ?, max_participants = ? WHERE id = ?', [title, description, event_date, location, max_participants, eventId]);
        res.redirect('/manage-events');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating event');
    }
});

// ruta pt afisarea pag de confirmare a stergerii unui event
router.get('/delete-event/:id', isLoggedIn, async (req, res) => {
    const eventId = req.params.id; // preia id ul event
    try {
        const [eventRows] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);
        const event = eventRows[0]; // obt detaliile event
        res.render('delete-event', {event}); // reda pag de confirmare
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching event details');
    }
});

// ruta pt procesarea stergerii unui event
router.post('/delete-event/:id', isLoggedIn, async (req, res) => {
    const eventId = req.params.id; // preia id ul event
    try {
        await pool.query('DELETE FROM events WHERE id = ?', [eventId]); // sterge din db event
        res.redirect('/manage-events');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting event');
    }
});

// ruta pt afisarea event dupa sortare data
router.get('/events/sort', async (req, res) => {
    try {
        const {order} = req.query; // preia ordinea de sortare din query ('ASC' sau 'DESC')
        // sorteaza event, implicit in ordine cresc
        const sortedEvents = await getEventsSortedByDate(order || 'ASC');
        // reda pag cu event sortate
        res.render('manage-events', { events: sortedEvents });
    } catch (error) {
        console.error(error); // logheaza erorile
        res.status(500).send('Failed to fetch events');
    }
});

// ruta pt afisarea detaliilor unui event
router.get('/view-event/:id', isLoggedIn, async (req, res) => {
    const eventId = req.params.id; // prea id ul event
    try {
        // obt detaliile event
        const [eventRows] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);
        const event = eventRows[0]; // preia primul rezultat
        // reda pag cu detaliile event
        res.render('view-event', { event });
    } catch (error) {
        console.error('Error fetching event details:', error); // logheaza erorile
        res.status(500).send('An error occurred while fetching the event details.');
    }
});

// exporta router ul pt utilizare in aplicatie
module.exports = router;