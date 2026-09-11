const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');

const app = express();
app.use(cors());

const DB_FILE = path.join(__dirname, 'db.json');

// Hàm đọc dữ liệu từ file db.json
async function readData() {
  try {
    const content = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    // Nếu file chưa tồn tại, khởi tạo mặc định
    return { users: {} };
  }
}

// Hàm ghi dữ liệu vào file db.json
async function writeData(data) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}


// Route lấy toàn bộ danh sách users: GET /users
app.get('/users', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// Route tăng view cho user: GET /:id
app.get('/:id', async (req, res) => {
  const { id } = req.params;

  // Bỏ qua request tự động favicon
  if (id === 'favicon.ico') {
    return res.status(204).end();
  }

  try {
    const data = await readData();
    data.users[id] = (data.users[id] || 0) + 1;
    await writeData(data);

    res.json({ id, count: data.users[id] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));