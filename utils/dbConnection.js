const mysql = require('mysql2');

const dbConnection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'lprn1108',
    database: 'dmrlart'
});

module.exports = dbConnection.promise();