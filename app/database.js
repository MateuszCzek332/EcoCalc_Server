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

    const queries = [
        //DBfunc.isUserValid(new User("Testuser", "1234"), conn),
        //DBfunc.isUserValid(new User("Testuser", "12345"), conn),
        //DBfunc.isUserValid(new User("Testuser2", "4321"), conn),
        //DBfunc.uddUser(new User("sgvvvvfdjjfdgdggfg", "735gfgffg58"), conn)
    ];

    Promise.all(queries)
        .then(results => {
            results.forEach(res => console.log(res));
        })
        .catch(err => console.error(err))
        .finally(() => conn.end());
});

let DBfunc = {
isUserValid: (User) => {
    return new Promise((resolve, reject) => {
        // First validate input
        if (!User.username) {
            return reject(new Error("Username is empty!"));
        }

        // Create a new connection each time
        const conn = mysql.createConnection(args);

        // Connect to database
        conn.connect((err) => {
            if (err) {
                conn.end(); // Close the connection if connect fails
                return reject(err);
            }

            // Execute query
            const query = 'SELECT Password FROM Users WHERE Username LIKE ?';
            conn.query(query, [User.username], (err, results) => {
                // Always close the connection when done
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
            DBfunc.usernameExists(User).then(res => {
                if (res) reject(new Error("User already exists!"))
                let query = 'INSERT INTO Users (Username, Password) VALUES (?,?)';
                let values = [User.username, User.password];
                conn.query(query, values, (err, results) => {
                    if (err) reject(err);
                    resolve(true);
                });
            });
        });
    },
    usernameExists: (User) => {
        return new Promise((resolve, reject) => {
            if (!User.username) reject(new Error("Username is empty!"));
            let query = 'SELECT Username FROM Users WHERE Username LIKE ?';
            let values = [User.username]
            conn.query(query, values, (err, results) => {
                if (err) reject(err);
                resolve(true)
            });
        });
    }
}

module.exports = DBfunc;