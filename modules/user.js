const bcrypt = require('bcrypt'); // importa biblioteca bcrypt pt hash ul parolelor
const pool = require('../db'); // merge un director mai sus
// importa pool ul pt conexiunea la db

// fct pt crearea unui nou user
const createUser = async (user) => {
    // destructureaza propr necesare din obiectul 'user'
    const {username, password} = user;
    // genereaza un hash pt parola (fol 10 runde de salt)
    const hashedPassword = await bcrypt.hash(password, 10);
    // ruleaza interogarea sql pt a insera userul in tabelul 'users'
    const [result] = await pool.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
    // returneaza id ul userului creat
    return result.insertId;
};

// fct pt a gasi un user
const findUserByUsername = async (username) => {
    // ruleaza interogarea sql pt a selecta userul cu numele specificat
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    // returneaza primul rand
    return rows[0];
};

// exporta fct def pr utilizare in alte module
module.exports = {createUser, findUserByUsername};