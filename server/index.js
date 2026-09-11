// include
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.db');
const cors = require('cors');
// init server express
const app = express();
app.use(cors());
const port = 3000;

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    count INTEGER DEFAULT 0
  )
`);


app.get('/users', (req, res) => {
    db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.json({count: rows.length, users: rows});
        }
    });
});

// get('/id') => { ... }
app.get('/:id', (req, res) => {
  const username = req.params.id;

  // Nếu chưa có: tạo mới với count = 1
  // Nếu đã có: tăng count lên 1
  const sql = `
    INSERT INTO users (id, count)
    VALUES (?, 1)
    ON CONFLICT(id) DO UPDATE SET count = users.count + 1
  `;

  db.run(sql, [username], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).send('Database error');
    }

    // Lấy count hiện tại ra để phản hồi
    db.get('SELECT count FROM users WHERE id = ?', [username], (err, row) => {
      if (err) {
        return res.status(500).send('Fetch error');
      }
        res.json({ id: username, count: row.count });
    });
  });
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
