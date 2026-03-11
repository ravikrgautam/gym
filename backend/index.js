require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

const otpStore = new Map();
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Middleware for auth
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error("JWT Error:", err.message);
            return res.status(403).json({ error: 'Session Expired or Invalid. Please sign out and sign in again.' });
        }
        req.user = user;
        next();
    });
};

/* --- AUTH (Real Email OTP & Role Based) --- */
app.post('/api/auth/request-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const otp = '123456'; // Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins
    otpStore.set(email, { otp, expiresAt });

    /* 
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Gym SaaS Login OTP',
            text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
            html: `<h3>Your OTP is: <strong>${otp}</strong></h3><p>It will expire in 5 minutes.</p>`
        });
        console.log(`Real OTP sent to ${email} via email.`);
    } catch (err) {
        console.error("Failed to send OTP email:", err.message);
    }
    */
    console.log(`Fallback: Simulated OTP for ${email} is: ${otp}`);

    db.get('SELECT id FROM gyms WHERE email = ?', [email], (err, row) => {
        if (!row) {
            db.run('INSERT INTO gyms (name, email) VALUES (?, ?)', ['My Gym', email], function (err) {
                const gymId = this.lastID;
                db.run('INSERT INTO users (gym_id, email, role) VALUES (?, ?, ?)', [gymId, email, 'OWNER'], function (err) {
                    res.json({ message: 'OTP Sent! (For testing, use 123456)', gymId: gymId });
                });
            });
        } else {
            db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
                if (!user) {
                    db.run('INSERT INTO users (gym_id, email, role) VALUES (?, ?, ?)', [row.id, email, 'OWNER'], function (err) {
                        res.json({ message: 'OTP Sent! (For testing, use 123456)', gymId: row.id });
                    });
                } else {
                    res.json({ message: 'OTP Sent! (For testing, use 123456)', gymId: row.id });
                }
            });
        }
    });
});

app.post('/api/auth/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    const stored = otpStore.get(email);

    if (!stored || stored.otp !== otp || Date.now() > stored.expiresAt) {
        return res.status(401).json({ error: 'Invalid or Expired OTP' });
    }

    otpStore.delete(email);

    db.get('SELECT u.id as user_id, u.role, u.entity_id, g.id as gym_id, g.name FROM users u JOIN gyms g ON u.gym_id = g.id WHERE u.email = ?', [email], (err, user) => {
        if (err || !user) return res.status(401).json({ error: 'User not found or Invalid Gym' });
        const token = jwt.sign({ gymId: user.gym_id, email: email, role: user.role, entityId: user.entity_id, userId: user.user_id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { gymId: user.gym_id, name: user.name, role: user.role, email: email } });
    });
});

/* --- MEMBERS --- */
app.get('/api/members', authenticateToken, (req, res) => {
    const query = `
      SELECT m.*, s.end_date, s.start_date, s.plan_id, p.name as plan_name, p.duration_months 
      FROM members m 
      LEFT JOIN subscriptions s ON m.id = s.member_id 
      LEFT JOIN plans p ON s.plan_id = p.id
      WHERE m.gym_id = ?
    `;
    db.all(query, [req.user.gymId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/members', authenticateToken, (req, res) => {
    const { name, phone, status, join_date, plan_id, plan_expiry_date, shift } = req.body;
    db.run('INSERT INTO members (gym_id, name, phone, status, join_date, plan_expiry_date, shift) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [req.user.gymId, name, phone, status || 'ACTIVE', join_date || new Date().toISOString().split('T')[0], plan_expiry_date || null, shift || null], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            const memberId = this.lastID;
            const resData = { id: memberId, name, phone, status: status || 'ACTIVE', join_date: join_date || new Date().toISOString().split('T')[0], plan_expiry_date, shift };

            if (plan_id) {
                db.get('SELECT duration_months FROM plans WHERE id = ?', [plan_id], (err, plan) => {
                    if (plan) {
                        const startDate = resData.join_date;
                        const endDate = new Date(startDate);
                        endDate.setMonth(endDate.getMonth() + plan.duration_months);
                        db.run('INSERT INTO subscriptions (member_id, plan_id, start_date, end_date) VALUES (?, ?, ?, ?)',
                            [memberId, plan_id, startDate, endDate.toISOString().split('T')[0]]);
                    }
                    res.json(resData);
                });
            } else {
                res.json(resData);
            }
        });
});

app.put('/api/members/:id', authenticateToken, (req, res) => {
    const { name, phone, status, join_date, plan_id, plan_expiry_date, shift } = req.body;
    const memberId = req.params.id;
    db.run('UPDATE members SET name = ?, phone = ?, status = ?, join_date = ?, plan_expiry_date = ?, shift = ? WHERE id = ? AND gym_id = ?',
        [name, phone, status, join_date, plan_expiry_date || null, shift || null, memberId, req.user.gymId], function (err) {
            if (err) return res.status(500).json({ error: err.message });

            if (plan_id) {
                db.run('DELETE FROM subscriptions WHERE member_id = ?', [memberId], () => {
                    db.get('SELECT duration_months FROM plans WHERE id = ?', [plan_id], (err, plan) => {
                        if (plan) {
                            const startDate = join_date || new Date().toISOString().split('T')[0];
                            const endDate = new Date(startDate);
                            endDate.setMonth(endDate.getMonth() + plan.duration_months);
                            db.run('INSERT INTO subscriptions (member_id, plan_id, start_date, end_date) VALUES (?, ?, ?, ?)',
                                [memberId, plan_id, startDate, endDate.toISOString().split('T')[0]]);
                        }
                        res.json({ success: true, changes: this.changes });
                    });
                });
            } else {
                db.run('DELETE FROM subscriptions WHERE member_id = ?', [memberId], () => {
                    res.json({ success: true, changes: this.changes });
                });
            }
        });
});

app.delete('/api/members/:id', authenticateToken, (req, res) => {
    db.run('DELETE FROM members WHERE id = ? AND gym_id = ?', [req.params.id, req.user.gymId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, changes: this.changes });
    });
});

/* --- QR CODE SYSTEM --- */
const QR_SECRET = process.env.QR_SECRET || 'gym_qr_secure_default';

app.get('/api/members/:id/qr', authenticateToken, (req, res) => {
    db.get('SELECT id FROM members WHERE id = ? AND gym_id = ?', [req.params.id, req.user.gymId], (err, member) => {
        if (err || !member) return res.status(404).json({ error: 'Member not found' });

        const qrToken = jwt.sign({ memberId: member.id, gymId: req.user.gymId }, QR_SECRET, { expiresIn: '24h' });
        res.json({ token: qrToken });
    });
});

app.post('/api/attendance/qr', authenticateToken, (req, res) => {
    const { token, shift } = req.body;
    if (!token || !shift) return res.status(400).json({ error: 'Token and shift are required' });

    jwt.verify(token, QR_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Invalid or expired QR code' });

        const { memberId, gymId } = decoded;
        if (gymId !== req.user.gymId) return res.status(403).json({ error: 'QR code belongs to a different gym' });

        const today = new Date().toISOString().split('T')[0];
        const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

        db.get('SELECT id FROM attendance WHERE member_id = ? AND date = ? AND shift = ?', [memberId, today, shift], (err, existing) => {
            if (err) return res.status(500).json({ error: err.message });
            if (existing) {
                return res.status(409).json({ error: 'QR Check-in already recorded for this shift today.' });
            }

            db.run('INSERT INTO attendance (member_id, date, check_in_time, status, method, shift) VALUES (?, ?, ?, ?, ?, ?)',
                [memberId, today, currentTime, 'Present', 'QR', shift], function (err) {
                    if (err) return res.status(500).json({ error: err.message });

                    db.get('SELECT name FROM members WHERE id = ?', [memberId], (err, m) => {
                        res.json({ success: true, id: this.lastID, memberId, memberName: m ? m.name : 'Member', message: 'QR Check-in successful' });
                    });
                });
        });
    });
});

/* --- CRM NOTES --- */
app.get('/api/members/:id/notes', authenticateToken, (req, res) => {
    db.get('SELECT id FROM members WHERE id = ? AND gym_id = ?', [req.params.id, req.user.gymId], (err, member) => {
        if (err || !member) return res.status(404).json({ error: 'Member not found' });
        db.all('SELECT * FROM member_notes WHERE member_id = ? ORDER BY created_at DESC', [req.params.id], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });
});

app.post('/api/members/:id/notes', authenticateToken, (req, res) => {
    const { note_text } = req.body;
    db.get('SELECT id FROM members WHERE id = ? AND gym_id = ?', [req.params.id, req.user.gymId], (err, member) => {
        if (err || !member) return res.status(404).json({ error: 'Member not found' });
        db.run('INSERT INTO member_notes (member_id, note_text, created_by) VALUES (?, ?, ?)',
            [req.params.id, note_text, req.user.name || req.user.email || 'Admin'], function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ id: this.lastID, note_text, created_at: new Date().toISOString() });
            });
    });
});

/* --- INVOICES --- */
// Get invoices for a specific member
app.get('/api/members/:id/invoices', authenticateToken, (req, res) => {
    // Verify member belongs to this gym
    db.get('SELECT id FROM members WHERE id = ? AND gym_id = ?', [req.params.id, req.user.gymId], (err, member) => {
        if (err || !member) return res.status(404).json({ error: 'Member not found' });

        db.all('SELECT * FROM invoices WHERE member_id = ? ORDER BY issue_date DESC, id DESC', [req.params.id], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });
});

// Create a new invoice/payment record for a member
app.post('/api/members/:id/invoices', authenticateToken, (req, res) => {
    const memberId = req.params.id;
    // Verify member belongs to gym
    db.get('SELECT id FROM members WHERE id = ? AND gym_id = ?', [memberId, req.user.gymId], (err, member) => {
        if (err || !member) return res.status(404).json({ error: 'Member not found' });

        const {
            invoice_date, invoice_number, order_receipt_no, pack_name,
            pack_validity_from, pack_validity_to, branch_name,
            mrp, discount, base_price, tax_percentage, tax_amount,
            total_payable, payment_mode, buyer_name, buyer_phone, notes
        } = req.body;

        db.run(`INSERT INTO invoices (
            member_id, issue_date, invoice_number, order_receipt_no, pack_name,
            pack_validity_from, pack_validity_to, branch_name, mrp, discount,
            base_price, tax_percentage, tax_amount, amount_paid, total_payable,
            payment_mode, buyer_name, buyer_phone, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            memberId, invoice_date || new Date().toISOString().split('T')[0], invoice_number, order_receipt_no || null, pack_name || null,
            pack_validity_from || null, pack_validity_to || null, branch_name || null, mrp || 0, discount || 0,
            base_price || 0, tax_percentage || 0, tax_amount || 0, total_payable || 0, total_payable || 0, // amount_paid = total_payable typically
            payment_mode || 'Cash', buyer_name || '', buyer_phone || '', notes || ''
        ], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            const invoiceId = this.lastID;

            if (pack_validity_to) {
                db.run('UPDATE members SET plan_expiry_date = ?, current_plan_name = ?, current_plan_fee = ?, fee_status = ? WHERE id = ?',
                    [pack_validity_to, pack_name || null, total_payable || 0, 'Paid', memberId], (err) => {
                        res.json({ id: invoiceId, success: true });
                    });
            } else {
                res.json({ id: invoiceId, success: true });
            }
        });
    });
});

/* --- TRAINERS & PAYROLL --- */
app.get('/api/trainers', authenticateToken, (req, res) => {
    db.all('SELECT * FROM trainers WHERE gym_id = ?', [req.user.gymId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/trainers', authenticateToken, (req, res) => {
    const { name, phone, specialty, salary, pay_type } = req.body;
    db.run('INSERT INTO trainers (gym_id, name, phone, specialty, salary, pay_type) VALUES (?, ?, ?, ?, ?, ?)',
        [req.user.gymId, name, phone, specialty, salary || 0, pay_type || 'FIXED'], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, name, phone, specialty, salary, pay_type });
        });
});

app.put('/api/trainers/:id', authenticateToken, (req, res) => {
    const { name, phone, specialty, salary, pay_type } = req.body;
    db.run('UPDATE trainers SET name = ?, phone = ?, specialty = ?, salary = ?, pay_type = ? WHERE id = ? AND gym_id = ?',
        [name, phone, specialty, salary || 0, pay_type || 'FIXED', req.params.id, req.user.gymId], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, changes: this.changes });
        });
});

app.delete('/api/trainers/:id', authenticateToken, (req, res) => {
    db.run('DELETE FROM trainers WHERE id = ? AND gym_id = ?', [req.params.id, req.user.gymId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, changes: this.changes });
    });
});

app.post('/api/trainers/:id/salary', authenticateToken, (req, res) => {
    const { salary, pay_type } = req.body;
    db.run('UPDATE trainers SET salary = ?, pay_type = ? WHERE id = ? AND gym_id = ?',
        [salary, pay_type, req.params.id, req.user.gymId], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
});

app.get('/api/trainers/:id/payroll', authenticateToken, (req, res) => {
    const { month } = req.query; // YYYY-MM
    if (!month) return res.status(400).json({ error: 'Month (YYYY-MM) is required' });

    db.get('SELECT * FROM trainers WHERE id = ? AND gym_id = ?', [req.params.id, req.user.gymId], (err, trainer) => {
        if (err || !trainer) return res.status(404).json({ error: 'Trainer not found' });

        if (trainer.pay_type === 'FIXED') {
            res.json({ trainer, month, payable: trainer.salary, attendance_days: null });
        } else {
            // For ATTENDANCE: count distinct attendance days for members assigned to classes taught by this trainer
            const query = `
                SELECT COUNT(DISTINCT a.date) as days
                FROM attendance a
                JOIN class_enrollments ce ON a.member_id = ce.member_id
                JOIN classes c ON ce.class_id = c.id
                WHERE c.trainer_id = ? AND substr(a.date, 1, 7) = ?
             `;
            db.get(query, [trainer.id, month], (err, row) => {
                if (err) return res.status(500).json({ error: err.message });
                const days = row ? row.days : 0;
                const payable = parseFloat(((trainer.salary / 26) * days).toFixed(2));
                res.json({ trainer, month, attendance_days: days, payable });
            });
        }
    });
});

app.get('/api/payroll/report', authenticateToken, (req, res) => {
    const { month } = req.query;
    if (!month) return res.status(400).json({ error: 'Month (YYYY-MM) is required' });

    db.all('SELECT * FROM trainers WHERE gym_id = ?', [req.user.gymId], (err, trainers) => {
        if (err) return res.status(500).json({ error: err.message });

        let report = [];
        let completed = 0;
        if (trainers.length === 0) return res.json(report);

        trainers.forEach(trainer => {
            if (trainer.pay_type === 'FIXED') {
                report.push({ trainer: trainer.name, type: 'FIXED', payable: trainer.salary, days: null });
                completed++;
                if (completed === trainers.length) res.json(report);
            } else {
                const query = `
                    SELECT COUNT(DISTINCT a.date) as days
                    FROM attendance a
                    JOIN class_enrollments ce ON a.member_id = ce.member_id
                    JOIN classes c ON ce.class_id = c.id
                    WHERE c.trainer_id = ? AND substr(a.date, 1, 7) = ?
                 `;
                db.get(query, [trainer.id, month], (err, row) => {
                    const days = row && row.days ? row.days : 0;
                    const payable = parseFloat(((trainer.salary / 26) * days).toFixed(2));
                    report.push({ trainer: trainer.name, type: 'ATTENDANCE', payable, days });
                    completed++;
                    if (completed === trainers.length) res.json(report);
                });
            }
        });
    });
});

/* --- PLANS --- */
app.get('/api/plans', authenticateToken, (req, res) => {
    db.all('SELECT * FROM plans WHERE gym_id = ?', [req.user.gymId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/plans', authenticateToken, (req, res) => {
    const { name, duration_months, price } = req.body;
    db.run('INSERT INTO plans (gym_id, name, duration_months, price) VALUES (?, ?, ?, ?)',
        [req.user.gymId, name, duration_months, price], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        });
});

app.delete('/api/plans/:id', authenticateToken, (req, res) => {
    db.run('DELETE FROM plans WHERE id = ? AND gym_id = ?', [req.params.id, req.user.gymId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, changes: this.changes });
    });
});

app.put('/api/plans/:id', authenticateToken, (req, res) => {
    const { name, duration_months, price } = req.body;
    db.run('UPDATE plans SET name = ?, duration_months = ?, price = ? WHERE id = ? AND gym_id = ?',
        [name, duration_months, price, req.params.id, req.user.gymId], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, changes: this.changes });
        });
});

/* --- TRAINERS --- */
app.get('/api/trainers', authenticateToken, (req, res) => {
    db.all('SELECT * FROM trainers WHERE gym_id = ?', [req.user.gymId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/trainers', authenticateToken, (req, res) => {
    const { name, phone, specialty } = req.body;
    db.run('INSERT INTO trainers (gym_id, name, phone, specialty) VALUES (?, ?, ?, ?)',
        [req.user.gymId, name, phone, specialty], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, name, phone, specialty });
        });
});

app.delete('/api/trainers/:id', authenticateToken, (req, res) => {
    db.run('DELETE FROM trainers WHERE id = ? AND gym_id = ?', [req.params.id, req.user.gymId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, changes: this.changes });
    });
});

/* --- ATTENDANCE --- */
app.get('/api/attendance', authenticateToken, (req, res) => {
    const { date, month, member_name, shift } = req.query;
    let query = `
      SELECT a.*, m.name as member_name 
      FROM attendance a 
      JOIN members m ON a.member_id = m.id 
      WHERE a.gym_id = ?
    `;
    const params = [req.user.gymId];

    if (date) {
        query += ` AND a.date = ?`;
        params.push(date);
    }
    if (month) {
        query += ` AND a.date LIKE ?`;
        params.push(`${month}%`);
    }
    if (member_name) {
        query += ` AND m.name LIKE ?`;
        params.push(`%${member_name}%`);
    }
    if (shift && shift !== 'All') {
        query += ` AND a.shift = ?`;
        params.push(shift);
    }
    query += ` ORDER BY a.date DESC, a.check_in_time DESC`;

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/attendance', authenticateToken, (req, res) => {
    const { member_id, method, shift, date: reqDate, check_in_time: reqTime } = req.body;
    const now = new Date();
    // Offset for local time without timezone libraries
    const localNow = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
    const date = reqDate || localNow.toISOString().split('T')[0];
    const check_in_time = reqTime || localNow.toISOString().split('T')[1].substring(0, 5);

    if (!shift) {
        return res.status(400).json({ error: 'Shift is required (Morning/Evening)' });
    }

    // Server-side validation for duplicate
    db.get('SELECT * FROM attendance WHERE member_id = ? AND date = ? AND shift = ?', [member_id, date, shift], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) {
            db.get('SELECT name FROM members WHERE id = ?', [member_id], (err, member) => {
                const name = member ? member.name : 'Member';
                return res.status(400).json({ error: `${name} is already checked in for the ${shift} shift today. Edit the existing entry instead.` });
            });
        } else {
            db.run('INSERT INTO attendance (gym_id, member_id, date, check_in_time, method, shift) VALUES (?, ?, ?, ?, ?, ?)',
                [req.user.gymId, member_id, date, check_in_time, method || 'MANUAL', shift], function (err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ id: this.lastID, member_id, date, check_in_time, method: method || 'MANUAL', shift });
                });
        }
    });
});

app.put('/api/attendance/:id', authenticateToken, (req, res) => {
    const { check_in_time, method, shift, date } = req.body;
    db.run('UPDATE attendance SET check_in_time = ?, method = ?, shift = ?, date = ? WHERE id = ? AND gym_id = ?',
        [check_in_time, method, shift, date, req.params.id, req.user.gymId], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'Duplicate attendance record exists for this shift and date.' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true });
        });
});

app.delete('/api/attendance/:id', authenticateToken, (req, res) => {
    db.run('DELETE FROM attendance WHERE id = ? AND gym_id = ?', [req.params.id, req.user.gymId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

/* --- CLASSES --- */
app.get('/api/classes', authenticateToken, (req, res) => {
    const query = `
      SELECT c.*, t.name as trainer_name, 
      (SELECT COUNT(*) FROM class_enrollments ce WHERE ce.class_id = c.id) as enrolled_count
      FROM classes c
      LEFT JOIN trainers t ON c.trainer_id = t.id
      WHERE c.gym_id = ?
    `;
    db.all(query, [req.user.gymId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/classes', authenticateToken, (req, res) => {
    const { name, trainer_id, start_time, end_time, capacity } = req.body;
    db.run('INSERT INTO classes (gym_id, name, trainer_id, start_time, end_time, capacity) VALUES (?, ?, ?, ?, ?, ?)',
        [req.user.gymId, name, trainer_id, start_time, end_time, capacity], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, name, trainer_id, start_time, end_time, capacity });
        });
});

app.put('/api/classes/:id', authenticateToken, (req, res) => {
    const { name, trainer_id, start_time, end_time, capacity } = req.body;
    db.run('UPDATE classes SET name = ?, trainer_id = ?, start_time = ?, end_time = ?, capacity = ? WHERE id = ? AND gym_id = ?',
        [name, trainer_id, start_time, end_time, capacity, req.params.id, req.user.gymId], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, changes: this.changes });
        });
});

app.post('/api/classes/:id/enroll', authenticateToken, (req, res) => {
    const { member_id } = req.body;
    // Basic check for capacity could be added here
    db.run('INSERT INTO class_enrollments (class_id, member_id) VALUES (?, ?)',
        [req.params.id, member_id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, enrollment_id: this.lastID });
        });
});

/* --- DASHBOARD ANALYTICS --- */
app.get('/api/dashboard', authenticateToken, (req, res) => {
    if (req.user.role !== 'OWNER' && req.user.role !== 'MANAGER') {
        return res.status(403).json({ error: 'Access Denied: Owner or Manager role required.' });
    }
    const dashboardData = {};

    db.serialize(() => {
        db.get('SELECT COUNT(*) as activeMembers FROM members WHERE gym_id = ? AND UPPER(status) = ?', [req.user.gymId, 'ACTIVE'], (err, row) => {
            dashboardData.activeMembers = row ? row.activeMembers : 0;

            db.get(`SELECT COUNT(*) as expiredMembers FROM members WHERE gym_id = ? AND plan_expiry_date < date('now')`, [req.user.gymId], (err, row) => {
                dashboardData.expiredMembers = row ? row.expiredMembers : 0;

                db.get(`SELECT COUNT(*) as expiringSoon FROM members WHERE gym_id = ? AND plan_expiry_date BETWEEN date('now') AND date('now', '+7 days')`, [req.user.gymId], (err, row) => {
                    dashboardData.expiringSoon = row ? row.expiringSoon : 0;

                    db.get(`SELECT IFNULL(SUM(total_payable), 0) as totalRevenue FROM invoices i JOIN members m ON i.member_id = m.id WHERE m.gym_id = ?`, [req.user.gymId], (err, row) => {
                        dashboardData.totalRevenue = row ? row.totalRevenue : 0;

                        db.get('SELECT COUNT(*) as trainersCount FROM trainers WHERE gym_id = ?', [req.user.gymId], (err, row) => {
                            dashboardData.trainersCount = row ? row.trainersCount : 0;

                            db.all(`SELECT i.*, m.name as member_name 
                                    FROM invoices i 
                                    JOIN members m ON i.member_id = m.id 
                                    WHERE m.gym_id = ? 
                                    ORDER BY i.issue_date DESC, i.id DESC LIMIT 5`, [req.user.gymId], (err, rows) => {
                                dashboardData.recentInvoices = rows || [];
                                res.json(dashboardData);
                            });
                        });
                    });
                });
            });
        });
    });
});

app.get('/api/dashboard/revenue-trend', authenticateToken, (req, res) => {
    if (req.user.role !== 'OWNER' && req.user.role !== 'MANAGER') {
        return res.status(403).json({ error: 'Access Denied: Owner or Manager role required.' });
    }

    const query = `
        SELECT substr(i.issue_date, 1, 7) as month, SUM(i.total_payable) as revenue
        FROM invoices i
        JOIN members m ON i.member_id = m.id
        WHERE m.gym_id = ? AND i.issue_date >= date('now', '-6 months')
        GROUP BY month
        ORDER BY month ASC
    `;

    db.all(query, [req.user.gymId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`SaaS Backend running on port ${PORT}`);
});
