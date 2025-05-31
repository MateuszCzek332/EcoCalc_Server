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

let DBfunc = {
    isUserValid: (User) => {
        return new Promise((resolve, reject) => {
            if (!User.username) {
                return reject(new Error("Username is empty!"));
            }

            const conn = mysql.createConnection(args);
            conn.connect((err) => {
                if (err) {
                    conn.end();
                    return reject(err);
                }
                console.log("Successfully connected to database!");

                const query = 'SELECT Password FROM Users WHERE Username = ?';
                conn.query(query, [User.username], (err, results) => {
                    conn.end();

                    if (err) {
                        return reject(err);
                    }
                    if (results.length === 0) {
                        return reject(new Error("User not found"));
                    }

                    resolve(results[0]);
                });
            });
        });
    },
    uddUser: (User) => {
        return new Promise((resolve, reject) => {
            if (!User.username) {
                return reject(new Error("Username is empty!"));
            }

            const conn = mysql.createConnection(args);
            conn.connect((err) => {
                if (err) {
                    conn.end();
                    return reject(err);
                }
                console.log("Successfully connected to database!");
                DBfunc.usernameExists(User, conn).then(res => {                    
                    if (res) return false;

                    let query = 'INSERT INTO Users (Username, Password) VALUES (?,?)';
                    let values = [User.username, User.password];

                    conn.query(query, values, (err, results) => {
                        conn.end();

                        if (err) {
                            return reject(err);
                        }

                        resolve(true);
                    });
                });
            })
        });
    },
    usernameExists: (User, conn) => {
        return new Promise((resolve, reject) => {
            if (!User.username) reject(new Error("Username is empty!"));
            let query = 'SELECT Username FROM Users WHERE Username = ?';
            let values = [User.username]
            conn.query(query, values, (err, results) => {
                if (err) reject(err);
                resolve(results.length > 0)
            });
        });
    }
}

module.exports = DBfunc;