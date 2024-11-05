const mysql = require('mysql2');
const { USER, PASS } = require('./config.json');
const connection = mysql.createPool({
    host: '127.0.0.1',
    user: USER,
    password: PASS,
    database: 'bot',
    waitForConnections: true,
    connectionLimit: 20,
    idleTimeout: 20000,
    queueLimit: 0
});

module.exports = connection;