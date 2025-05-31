const mysql = require('mysql2');

const args = {
    host: '192.168.1.206',
    user: 'EcoCalc',
    password: 'admin',
    database: 'EcoCalc',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}

const pool = mysql.createPool(args);

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

            pool.getConnection((err, conn) => {
                if (err) {
                    return reject(err);
                }

                const query = 'SELECT Password FROM Users WHERE Username = ?';
                conn.query(query, [User.username], (err, results) => {
                    conn.release();

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
    addUser: (User) => {
        return new Promise((resolve, reject) => {
            if (!User.username || !User.password) {
                return false;
            }

            pool.getConnection((err, conn) => {
                if (err) {
                    return false;
                }

                DBfunc.usernameExists(User, conn)
                    .then(res => {
                        if (res) {
                            conn.release();
                            return false;
                        }

                        let query = 'INSERT INTO Users (Username, Password) VALUES (?,?)';
                        let values = [User.username, User.password];

                        conn.query(query, values, (err, results) => {
                            conn.release();

                            if (err) {
                                return false;
                            }

                            resolve(true);
                        });
                    })
                    .catch(err => {
                        conn.release();
                        reject(err);
                    });
            });
        });
    },
    usernameExists: (User, conn) => {
        return new Promise((resolve, reject) => {
            if (!User.username) return reject(new Error("Username is empty!"));

            let query = 'SELECT Username FROM Users WHERE Username = ?';
            let values = [User.username];

            conn.query(query, values, (err, results) => {
                if (err) return reject(err);
                resolve(results.length > 0);
            });
        });
    },
    saveSimpleCalc: (User, data) => {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, conn) => {
                if (err) {
                    return reject(err);
                }

                DBfunc.userHasSimple(User, conn).then(res => {
                    let query;
                    if (res) {
                        query = `UPDATE SimpleCalc sc
                                JOIN Users u ON sc.\`Userid\` = u.\`Userid\`
                                SET sc.\`Usage\` = ?, 
                                sc.\`Price\` = ?, 
                                sc.\`SolarSize\` = ?
                                WHERE u.\`Username\` = ?;`
                    } else {
                        query = `INSERT INTO SimpleCalc 
                                (\`Userid\`, \`Usage\`, \`Price\`, \`SolarSize\`)
                                SELECT u.\`Userid\`, ?, ?, ?
                                FROM Users u WHERE u.\`Username\` = ?;`;
                    }

                    let values = [data.usagePerMonth, data.pricePerKWH, data.fotoSize, User];

                    conn.query(query, values, (err, results) => {
                        conn.release();

                        if (err) {
                            return reject(err);
                        }

                        resolve(true);
                    });
                });
            })

        });
    },
    getSimpleCalc: (User) => {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, conn) => {
                if (err) {
                    return reject(err);
                }

                let query = `SELECT sc.Usage, sc.Price, sc.SolarSize FROM SimpleCalc sc
                            JOIN Users u ON sc.Userid = u.Userid
                            WHERE u.Username = ?`;

                conn.query(query, [User], (err, results) => {
                    conn.release();

                    if (err) {
                        return reject(err);
                    }
                    resolve(results);
                });
            });
        });
    }, userHasSimple: (User, conn) => {
        return new Promise((resolve, reject) => {
            let query = `SELECT * FROM SimpleCalc sc
                            JOIN Users u ON sc.Userid = u.Userid
                            WHERE u.Username = ?`;

            conn.query(query, [User], (err, results) => {
                conn.release();

                if (err) {
                    return reject(err);
                }
                console.log(results.length > 0)
                resolve(results.length > 0);
            });
        });
    }, getCategories: () => {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, conn) => {
                if (err) {
                    return reject(err);
                }

                let query = `SELECT Name FROM ProductTypes`;
                conn.query(query, (err, results) => {
                    conn.release();

                    if (err) {
                        return reject(err);
                    }
                    resolve(results);
                });
            });
        });
    },
    getProductsFromCategory: (category) => {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, conn) => {
                if (err) {
                    return reject(err);
                }

                let query = `SELECT * FROM ExampleProducts ep JOIN ProductTypes pt ON ep.Typeid = pt.Typeid WHERE pt.Name = ?`;
                conn.query(query, [category], (err, results) => {
                    conn.release();

                    if (err) {
                        return reject(err);
                    }
                    resolve(results);
                });
            });
        });
    },
    userHasAppliances: (User, conn) => {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, conn) => {
                if (err) {
                    return reject(err);
                }

                let query = `SELECT Userid FROM HouseAppliances hp JOIN Users u ON hp.Userid = u.Userid WHERE u.Username = ?`;
                conn.query(query, [User.username], (err, results) => {
                    conn.release();

                    if (err) {
                        return reject(err);
                    }
                    resolve(true);
                });
            });
        });
    },
    saveUserAppliances: (User, data) => {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, conn) => {
                if (err) {
                    return reject(err);
                }

                DBfunc.userHasAppliances(User, conn).then(res => {
                    if (res) {
                        conn.query(`DELETE ha 
                        FROM HouseAppliances ha
                        JOIN Users u ON ha.Userid = u.Userid
                        WHERE u.Username = ?;`, [User])
                    }

                    let query = `INSERT INTO HouseAppliances (Userid, Typeid, PowerUsage, Time)
                                SELECT u.Userid, pt.Typeid, ?, ?
                                FROM Users u
                                JOIN ProductTypes pt ON pt.Name = ?
                                WHERE u.Username = ?`;
                    let values = [data.usage, data.time, data.category, User];

                    conn.query(query, values, (err, results) => {
                        conn.release();

                        if (err) {
                            return reject(err);
                        }

                        resolve(true);
                    });
                });
            })
        });
    }
}

module.exports = DBfunc;