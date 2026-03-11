const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('gym_saas.db');

const gymId = 3;

const query = `
    SELECT substr(i.issue_date, 1, 7) as month, SUM(i.total_payable) as revenue
    FROM invoices i
    JOIN members m ON i.member_id = m.id
    WHERE m.gym_id = ? AND i.issue_date >= date('now', '-6 months')
    GROUP BY month
    ORDER BY month ASC
`;

db.all(query, [gymId], (err, rows) => {
    if (err) console.error("Error:", err.message);
    console.log("Revenue Trend:", rows);
});
