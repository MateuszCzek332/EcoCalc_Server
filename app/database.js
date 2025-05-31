const mysql = require('mysql2');

const args = {
    host: '192.168.1.206',
    user: 'EcoCalc',
    password: 'admin',
    database: 'EcoCalc'
}

const conn = mysql.createConnection(args);

const User = class {
    constructor(username, password) {
        this.username = username
        this.password = password
    }
}

conn.connect((err) => {
    if (err) throw err;
    console.log("Succesfully connected to the database!");


    userExists(new User("Testuser", "1234"), conn)
        .then(exists => console.log(exists))
        .catch(err => console.error(err));
    userExists(new User("Testuser", "12345"), conn)
        .then(exists => console.log(exists))
        .catch(err => console.error(err));
    userExists(new User("Testuser2", "4321"), conn)
        .then(exists => console.log(exists))
        .catch(err => console.error(err));

    conn.end();
});

function uddUser(User, conn) {
    if (!User.username || !User.password) throw new Error("Username or password is empty!");
    let query = 'INSERT INTO Users (Username, Password) VALUES ?';
    let values = [User.username, User.password];
    conn.query(query, values, (err, results) => {
        if (err) throw err;
        console.log(results);
    });
}

function userExists(User, conn) {
    return new Promise((resolve, reject) => {
        if (!User.username || !User.password) reject(new Error("Username or password is empty!"));
        let query = 'SELECT * FROM Users WHERE Username LIKE ? AND Password LIKE ?';
        let values = [User.username, User.password]
        conn.query(query, values, (err, results) => {
            if (err) reject(err);
            resolve(results.length > 0)
        });    
    });
}