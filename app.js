const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pgp = require('pg-promise')();

const app = express();
const PORT = process.env.PORT || 3000;
require('dotenv').config();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL Connection
const db = pgp({
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || 3000,
  database: process.env.PG_DATABASE || 'restaurant',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || '12345',
});

// Create Table (if not exists)
db.none(`
  CREATE TABLE IF NOT EXISTS food (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price NUMERIC NOT NULL
  );
`).then(() => {
  console.log('Table "food" is ready');
}).catch((err) => {
  console.error('Error creating table:', err);
});

// CRUD Endpoints

// Get all food
app.get('/food', async (req, res) => {
  try {
    const food = await db.any('SELECT * FROM food');
    res.json(food);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch food' });
  }
});

// Add a new food
app.post('/food', async (req, res) => {
  const { title, price } = req.body;
  try {
    const newfood = await db.one(
      'INSERT INTO food (title, price) VALUES ($1, $2) RETURNING *',
      [title, price]
    );
    res.json(newfood);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add food' });
  }
});

// Update a food
app.put('/food/:id', async (req, res) => {
  const { id } = req.params;
  const { title, price } = req.body;
  try {
    const updatedfood = await db.one(
      'UPDATE food SET title = $1, price = $2 WHERE id = $3 RETURNING *',
      [title, price, id]
    );
    res.json(updatedfood);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update food' });
  }
});

// Delete a food
app.delete('/food/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.none('DELETE FROM food WHERE id = $1', [id]);
    res.json({ message: 'food deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete food' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

