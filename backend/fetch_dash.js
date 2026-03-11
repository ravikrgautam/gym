require('dotenv').config();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
// token for admin
const token1 = jwt.sign({ gymId: 1, email: 'admin@mygym.com', role: 'OWNER', entityId: null, userId: 1 }, JWT_SECRET, { expiresIn: '7d' });

// token for aaditya
const token3 = jwt.sign({ gymId: 3, email: 'aadityagautam76@gmail.com', role: 'OWNER', entityId: null, userId: 2 }, JWT_SECRET, { expiresIn: '7d' });

async function check(gymId, token) {
    try {
        const r = await fetch('http://localhost:3001/api/dashboard', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!r.ok) {
            console.error(`Gym ${gymId} failed: ${r.status} ${r.statusText}`);
            console.error(await r.text());
        } else {
            console.log(`Gym ${gymId}:`, await r.json());
        }
    } catch (e) {
        console.error(`Gym ${gymId} error:`, e);
    }
}

check(1, token1).then(() => check(3, token3));
