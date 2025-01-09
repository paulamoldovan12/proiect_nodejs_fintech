const pool = require('../db');
const createEvent = async (event) => {
    const {title, description, event_date, location, max_participants} = event;
    const [result] = await pool.query('INSERT INTO events (title, description, event_date, location, max_participants) VALUES (?, ?, ?, ?, ?)',
        [title, description, event_date, location, max_participants]);
    return result.insertId;
};
const getAllEvents = async () => {
    const [rows] = await pool.query('SELECT * FROM events');
    return rows;
};
const getEventById = async (eventId) => {
    const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);
    return rows[0];
};
const updateEvent = async (eventId, updatedEvent) => {
    const {title, description, event_date, location, max_participants} = updatedEvent;
    await pool.query('UPDATE events SET title = ?, description = ?, event_date = ?, location = ?, max_participants = ? WHERE id = ?', [title, description, event_date, location, max_participants, eventId]);
    return true;
};
const deleteEvent = async (eventId) => {
    await pool.query('DELETE FROM events WHERE id = ?', [eventId]);
    return true;
};

module.exports = {createEvent, getAllEvents, getEventById, updateEvent, deleteEvent};