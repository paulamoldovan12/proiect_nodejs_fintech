// configurare passport.js pt autentificare utiliz strategia locala
// include logica pt validarea userilor , serializarea datelor userului in sesiune si deserializarea datelor userului din sesiuni

const passport = require('passport'); // importa passport.js pt autentificarea utilizatorilor
const LocalStrategy = require('passport-local').Strategy; // importa strategia de autentificare locala pt passport.js
const bcrypt = require('bcrypt'); // importa bcrypt pt hash uirea si compararea parolelor
const pool = require("./db"); // importa conexiunea la baza de date pt efectuarea interogarilor

passport.use(new LocalStrategy(async (username, password, done) => {
    // def strategia locala a passport.js pt autentificare
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]); // interogheaza db pt a gasi un user cu username ul dat
        const user = rows[0]; // preia primul user gasit
        if (!user) {
            return done(null, false, {message: 'Incorrect username.'}); // returneaza un mesaj de eroare daca userul nu e gasit
        }
        const passwordMatch = await bcrypt.compare(password, user.password); // compara parola introdusa cu parola hash uita din db
        if (!passwordMatch) {
            return done(null, false, {message: 'Incorrect password.'}); // returneaza un mesaj de eroare daca parola e gresita
        }
        return done(null, user); // daca autentificarea e corecta, returneaza userul
    } catch (error) {
        return done(error); // gestioneaza erorile
    }
}));

passport.serializeUser((user, done) => {
    // serializeaza id ul userului in sesiune
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    // deserializeaza id ul userului in sesiune
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]); // interogheaza db pt a prelua userul dupa id
        const user = rows[0]; // preia primul user gasit
        done(null, user); // transmiterea userului (fara erori)
    } catch (error) {
        done(error); // gestioneaza erorile
    }
});