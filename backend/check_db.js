const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./gym_saas.db');

db.serialize(() => {
    db.all("SELECT * FROM gyms", (err, rows) => {
        console.log("GYMS:", rows);
    });
    db.all("SELECT * FROM users", (err, rows) => {
        console.log("USERS:", rows);
    });
    db.all("SELECT * FROM members", (err, rows) => {
        console.log("MEMBERS:", rows);
    });
    db.all("SELECT * FROM trainers", (err, rows) => {
        console.log("TRAINERS:", rows);
    });
    db.all("SELECT * FROM invoices", (err, rows) => {
        console.log("INVOICES:", rows);
    });
    db.all("SELECT * FROM subscriptions", (err, rows) => {
        console.log("SUBSCRIPTIONS:", rows);
    });
});
