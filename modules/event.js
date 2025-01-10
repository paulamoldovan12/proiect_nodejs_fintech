const pool = require('../db'); // se importa pool ul pt conexiunea la baza de date din fisierul db

// functie pt crearea unui eveniment nou
const createEvent = async (event) => {
    // se destructureaza propr necesare din obiectul 'event'
    const {title, description, event_date, location, max_participants} = event;
    // se ruleaza interogarea sql pt a insera un eveniment in tabelul events
    const [result] = await pool.query('INSERT INTO events (title, description, event_date, location, max_participants) VALUES (?, ?, ?, ?, ?)', [title, description, event_date, location, max_participants]);
    // returneaza id ul evenimentului creat
    return result.insertId;
};

// functie pt a obt toate evenimentele din tabelul events
const getAllEvents = async () => {
    // se ruleaza interogarea sql pt a selecta toate randurile
    const [rows] = await pool.query('SELECT * FROM events');
    // se returneaza randurile obt
    return rows;
};

// functie pt a obt un eveniment dupa id
const getEventById = async (eventId) => {
    // se ruleaza interogarea sql pt a selecta evenimentul cu id ul specificat
    const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);
    // se returneaza primul rand (sau undefined daca nu exista)
    return rows[0];
};

// functie pt actualizarea unui eveniment
const updateEvent = async (eventId, updatedEvent) => {
    // se destructureaza propr necesare din obiectul 'updatedEvent'
    const {title, description, event_date, location, max_participants} = updatedEvent;
    // se ruleaza interogarea sql pt a actualiza evenimentul cu id ul specificat
    await pool.query('UPDATE events SET title = ?, description = ?, event_date = ?, location = ?, max_participants = ? WHERE id = ?', [title, description, event_date, location, max_participants, eventId]);
    // indica ca a functionat actualizarea
    return true;
};

// functie pt stergerea unui eveniment
const deleteEvent = async (eventId) => {
    // se ruleaza interogarea sql pt a sterge evenimentul cu id ul specificat
    await pool.query('DELETE FROM events WHERE id = ?', [eventId]);
    // indica ca a functionat stergerea
    return true;
};

// const getEventsSortedByDate = async (order = 'ASC') => {
//     const [rows] = await pool.query(`SELECT * FROM events ORDER BY event_date ${order}`);
//     return rows;
// }

// functie pt obt evenimentelor sortate dupa data
const getEventsSortedByDate = async (order = 'ASC') => {
    // se valideaza ordinea (se accepta doar 'ASC' sau 'DESC')
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    // se ruleaza interogarea SQL pt a selecta toate evenimentele ordonate dupa data evenimentului
    const [rows] = await pool.query(`
        SELECT * FROM events 
        ORDER BY event_date ${sortOrder}
    `);
    // se returneaza randurile sortate
    return rows;
};

// se exporta fct definite pt utilizarea in alte module
module.exports = {createEvent, getAllEvents, getEventById, updateEvent, deleteEvent, getEventsSortedByDate};