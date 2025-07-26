// server.js
const express    = require('express');
const bodyParser = require('body-parser');
const Database   = require('better-sqlite3');
const cors       = require('cors');
const fs         = require('fs');
const path       = require('path');

const app     = express();
const DB_DIR  = path.join(__dirname, 'db');
const DB_FILE = path.join(DB_DIR, 'voting.db');
const API     = '/api';

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('assets')); // serve frontend static files

// initialize database
if (process.argv.includes('--init-db')) {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR);
  const initDb = new Database(DB_FILE);
  const schema = fs.readFileSync(path.join(DB_DIR, 'schema.sql'), 'utf-8');
  initDb.exec(schema);
  console.log('✅ Database initialized at', DB_FILE);
  process.exit(0);
}

const db = new Database(DB_FILE);

// Register user
app.post(`${API}/register`, (req, res) => {
  const { username } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO users (username) VALUES (?)');
    const info = stmt.run(username);
    res.json({ userId: info.lastInsertRowid });
  } catch (e) {
    res.status(400).json({ error: 'Username already exists' });
  }
});

// Create event
app.post(`${API}/events`, (req, res) => {
  const { title, max_votes, slots } = req.body;
  const ev   = db.prepare('INSERT INTO events (title, max_votes) VALUES (?, ?)').run(title, max_votes);
  const evId = ev.lastInsertRowid;
  const tx   = db.transaction(arr => {
    const slotStmt = db.prepare('INSERT INTO slots (event_id, slot_time) VALUES (?, ?)');
    arr.forEach(time => slotStmt.run(evId, time));
  });
  tx(slots);
  res.json({ eventId: evId });
});

// Submit votes
app.post(`${API}/vote`, (req, res) => {
  const { userId, slotIds } = req.body;
  // simple max_votes check
  const max = db.prepare(
    'SELECT max_votes FROM events WHERE id = (SELECT event_id FROM slots WHERE id = ?)'
  ).get(slotIds[0]).max_votes;
  if (slotIds.length > max) {
    return res.status(400).json({ error: `You can vote up to ${max} slots` });
  }
  const tx = db.transaction(ids => {
    const st = db.prepare('INSERT OR IGNORE INTO votes (user_id, slot_id) VALUES (?, ?)');
    ids.forEach(id => st.run(userId, id));
  });
  tx(slotIds);
  res.json({ success: true });
});

// Get results
app.get(`${API}/results/:eid`, (req, res) => {
  const rows = db.prepare(`
    SELECT s.slot_time, COUNT(v.id) AS count
    FROM slots s
    LEFT JOIN votes v ON v.slot_id = s.id
    WHERE s.event_id = ?
    GROUP BY s.id
    ORDER BY s.slot_time
  `).all(req.params.eid);
  res.json({ results: rows });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
