const mysql = require('mysql2/promise'); // importa mysql2/promise pt conexiuni la baza de date folosind Promises
const pool = mysql.createPool({
    // creeaza un pool (grup) de conexiuni la baza de date
    host: 'localhost', // adresa serverului unde se afla baza de date (localhost în acest caz)
    user: 'root', // numele utilizatorului pentru conectare la baza de date
    password: '', // parola utilizatorului
    database: 'gestionare_evenimente', // numele bazei de date la care se conecteaza
    waitForConnections: true, // permite punerea conexiunilor in asteptare daca toate conexiunile disponibile sunt utilizate
    connectionLimit: 10, // numarul maxim de conexiuni care pot fi deschise simultan
    queueLimit: 0, // nu limiteaza numarul de cereri puse in coada de asteptare
});

module.exports = pool; // exportă obiectul pool pentru a fi utilizat în alte fisiere
