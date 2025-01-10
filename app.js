// configurare aplicatie express principala si pornirea serverului

const express = require('express'); // importa framework ul express pt construirea serverului web
const session = require('express-session'); // importa express-session pt gestionarea sesiunilor utilizatorilor
const passport = require('passport'); // importa Passport.js pt autentificarea utilizatorilor
const routes = require('./routes'); // importa rutele def în folderul routes
const app = express(); // initializeaza o aplicatie express
const PORT = process.env.PORT || 3000; // defi portul pe care va rula serverul (implicit 3000 daca nu este setat altfel)

require('./auth'); // se asigura ca passport este configurat

app.set('view engine', 'ejs'); // seteaza EJS ca motor de randare pentru vizualizari
app.use(express.static('styles')); // serveste fisiere statice din folderul styles

app.use(express.urlencoded({extended: true})); // middleware pt parsarea datelor codate URL din cererile primite (trimiterea formularelor)
app.use(session({ // middleware pt configurarea gestionarii sesiunilor
    secret: 'secret', // cheia secretă pentru criptarea sesiunilor
    resave: false, // nu salveaza sesiunea daca nu a fost modificata
    saveUninitialized: false // nu salveaza sesiunile neinitializate
}));
app.use(passport.initialize()); // initializeaza middleware-ul Passport.js pt gestionarea autentificarii
app.use(passport.session()); // permite utilizarea sesiunilor persistente pt autentificare cu Passport.js
app.use(express.static('public')); // serveste fisiere statice (CSS, imagini) din folderul public
app.use('/', routes); // foloseste rutele importate pt gestionarea rutelor aplicatiei

app.listen(PORT, () => {
    // porneste serverul pe portul specific
    console.log('Server is running on http://localhost:${PORT}'); // afiseaza un mesaj care indica ca serverul ruleaza
});