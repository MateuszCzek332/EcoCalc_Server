const mysql = require('mysql2');

const args = {
    host: '192.168.1.206',
    user: 'EcoCalc',
    password: 'admin',
    database: 'EcoCalc'
}

const conn = mysql.createConnection(args);

conn.connect((err) => {
    if (err) throw err;
    console.log("Succesfully connected to the database!");

    conn.query('SELECT * FROM Users', (err, results, fields) => {
        if (err) throw err;
        console.log(results);
    });
    conn.end();
});