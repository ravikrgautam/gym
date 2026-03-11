const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'gym_saas.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run('PRAGMA foreign_keys = ON;');

        // Initialize Tables
        db.serialize(() => {
            // Gyms Table (Multi-tenant future proofing)
            db.run(`CREATE TABLE IF NOT EXISTS gyms (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT,
                address TEXT,
                email TEXT UNIQUE NOT NULL
            )`);

            // Trainers Table
            db.run(`CREATE TABLE IF NOT EXISTS trainers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                gym_id INTEGER,
                name TEXT NOT NULL,
                phone TEXT,
                specialty TEXT,
                salary REAL DEFAULT 0,
                pay_type TEXT DEFAULT 'FIXED',
                FOREIGN KEY (gym_id) REFERENCES gyms (id) ON DELETE CASCADE
            )`);

            // Add missing columns to support legacy records
            db.all("PRAGMA table_info(trainers)", (err, columns) => {
                if (columns) {
                    const colNames = columns.map(c => c.name);
                    if (!colNames.includes('salary')) {
                        db.run("ALTER TABLE trainers ADD COLUMN salary REAL DEFAULT 0");
                    }
                    if (!colNames.includes('pay_type')) {
                        db.run("ALTER TABLE trainers ADD COLUMN pay_type TEXT DEFAULT 'FIXED'");
                    }
                }
            });

            // Members Table
            db.run(`CREATE TABLE IF NOT EXISTS members (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                gym_id INTEGER,
                name TEXT NOT NULL,
                phone TEXT,
                status TEXT DEFAULT 'ACTIVE',
                join_date TEXT DEFAULT CURRENT_TIMESTAMP,
                plan_expiry_date TEXT,
                shift TEXT,
                FOREIGN KEY (gym_id) REFERENCES gyms (id) ON DELETE CASCADE
            )`);

            // Add missing columns to support legacy records
            db.all("PRAGMA table_info(members)", (err, columns) => {
                if (columns) {
                    const colNames = columns.map(c => c.name);
                    if (!colNames.includes('plan_expiry_date')) {
                        db.run("ALTER TABLE members ADD COLUMN plan_expiry_date TEXT");
                    }
                    if (!colNames.includes('shift')) {
                        db.run("ALTER TABLE members ADD COLUMN shift TEXT");
                    }
                    if (!colNames.includes('current_plan_name')) {
                        db.run("ALTER TABLE members ADD COLUMN current_plan_name TEXT");
                    }
                    if (!colNames.includes('current_plan_fee')) {
                        db.run("ALTER TABLE members ADD COLUMN current_plan_fee REAL");
                    }
                    if (!colNames.includes('fee_status')) {
                        db.run("ALTER TABLE members ADD COLUMN fee_status TEXT DEFAULT 'Paid'");
                    }
                }
            });

            // Plans Table
            db.run(`CREATE TABLE IF NOT EXISTS plans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                gym_id INTEGER,
                name TEXT NOT NULL,
                duration_months INTEGER NOT NULL,
                price REAL NOT NULL,
                FOREIGN KEY (gym_id) REFERENCES gyms (id) ON DELETE CASCADE
            )`);

            // Member Notes (CRM Follow-ups)
            db.run(`CREATE TABLE IF NOT EXISTS member_notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                member_id INTEGER,
                note_text TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                created_by TEXT,
                FOREIGN KEY (member_id) REFERENCES members (id) ON DELETE CASCADE
            )`);

            // Subscriptions/Memberships
            db.run(`CREATE TABLE IF NOT EXISTS subscriptions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                member_id INTEGER,
                plan_id INTEGER,
                start_date TEXT NOT NULL,
                end_date TEXT NOT NULL,
                FOREIGN KEY (member_id) REFERENCES members (id) ON DELETE CASCADE,
                FOREIGN KEY (plan_id) REFERENCES plans (id) ON DELETE SET NULL
            )`);

            // Invoices
            db.run(`CREATE TABLE IF NOT EXISTS invoices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                subscription_id INTEGER,
                member_id INTEGER,
                invoice_number TEXT NOT NULL,
                order_receipt_no TEXT,
                pack_name TEXT,
                pack_validity_from TEXT,
                pack_validity_to TEXT,
                branch_name TEXT,
                mrp REAL,
                discount REAL,
                base_price REAL,
                tax_percentage REAL,
                tax_amount REAL,
                amount_paid REAL NOT NULL,
                total_payable REAL,
                payment_mode TEXT,
                buyer_name TEXT,
                buyer_phone TEXT,
                notes TEXT,
                issue_date TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (subscription_id) REFERENCES subscriptions (id) ON DELETE CASCADE,
                FOREIGN KEY (member_id) REFERENCES members (id) ON DELETE CASCADE
            )`);

            db.all("PRAGMA table_info(invoices)", (err, columns) => {
                if (columns) {
                    const colNames = columns.map(c => c.name);
                    const colsToAdd = [
                        { name: 'member_id', def: 'INTEGER' },
                        { name: 'order_receipt_no', def: 'TEXT' },
                        { name: 'pack_name', def: 'TEXT' },
                        { name: 'pack_validity_from', def: 'TEXT' },
                        { name: 'pack_validity_to', def: 'TEXT' },
                        { name: 'branch_name', def: 'TEXT' },
                        { name: 'mrp', def: 'REAL' },
                        { name: 'discount', def: 'REAL' },
                        { name: 'base_price', def: 'REAL' },
                        { name: 'tax_percentage', def: 'REAL' },
                        { name: 'tax_amount', def: 'REAL' },
                        { name: 'total_payable', def: 'REAL' },
                        { name: 'buyer_name', def: 'TEXT' },
                        { name: 'buyer_phone', def: 'TEXT' },
                        { name: 'notes', def: 'TEXT' }
                    ];
                    colsToAdd.forEach(col => {
                        if (!colNames.includes(col.name)) {
                            db.run(`ALTER TABLE invoices ADD COLUMN ${col.name} ${col.def}`);
                        }
                    });
                }
            });

            // Users (For Multi-role Auth)
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                gym_id INTEGER,
                email TEXT UNIQUE NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('OWNER', 'MANAGER', 'TRAINER', 'MEMBER')),
                entity_id INTEGER, -- Links to trainers.id or members.id
                FOREIGN KEY (gym_id) REFERENCES gyms (id) ON DELETE CASCADE
            )`);

            // Attendance
            db.run(`CREATE TABLE IF NOT EXISTS attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                gym_id INTEGER,
                member_id INTEGER,
                date TEXT NOT NULL,
                check_in_time TEXT NOT NULL,
                method TEXT DEFAULT 'MANUAL' CHECK(method IN ('QR', 'MANUAL')),
                shift TEXT,
                FOREIGN KEY (gym_id) REFERENCES gyms (id) ON DELETE CASCADE,
                FOREIGN KEY (member_id) REFERENCES members (id) ON DELETE CASCADE
            )`);

            // Attendance Migration for shift and duplicates
            db.all("PRAGMA table_info(attendance)", (err, columns) => {
                if (columns) {
                    const colNames = columns.map(c => c.name);
                    if (!colNames.includes('shift')) {
                        db.run("ALTER TABLE attendance ADD COLUMN shift TEXT DEFAULT 'Morning'", (err) => {
                            if (!err) {
                                // Once column is added, delete duplicates before enforcing unique index
                                db.run(`DELETE FROM attendance WHERE id NOT IN (
                                    SELECT MIN(id) FROM attendance GROUP BY member_id, date, shift
                                )`, (err) => {
                                    if (!err) {
                                        db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_unique ON attendance (member_id, date, shift)`);
                                    }
                                });
                            }
                        });
                    } else {
                        // Just in case index isn't created but shift is there
                        db.run(`DELETE FROM attendance WHERE id NOT IN (
                            SELECT MIN(id) FROM attendance GROUP BY member_id, date, shift
                        )`, (err) => {
                            if (!err) {
                                db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_unique ON attendance (member_id, date, shift)`);
                            }
                        });
                    }
                }
            });

            // Classes
            db.run(`CREATE TABLE IF NOT EXISTS classes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                gym_id INTEGER,
                name TEXT NOT NULL,
                trainer_id INTEGER,
                start_time TEXT NOT NULL,
                end_time TEXT NOT NULL,
                capacity INTEGER NOT NULL,
                FOREIGN KEY (gym_id) REFERENCES gyms (id) ON DELETE CASCADE,
                FOREIGN KEY (trainer_id) REFERENCES trainers (id) ON DELETE SET NULL
            )`);

            // Class Enrollments
            db.run(`CREATE TABLE IF NOT EXISTS class_enrollments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                class_id INTEGER,
                member_id INTEGER,
                FOREIGN KEY (class_id) REFERENCES classes (id) ON DELETE CASCADE,
                FOREIGN KEY (member_id) REFERENCES members (id) ON DELETE CASCADE
            )`);

            console.log('Database tables initialized securely.');
        });
    }
});

module.exports = db;
