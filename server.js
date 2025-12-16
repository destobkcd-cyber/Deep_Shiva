const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todos');
const chatRoutes = require('./routes/chat');
const weatherRoutes = require('./routes/weather');
//const mandiRoutes = require('./routes/mandi');
const eventRoutes = require('./routes/events');


const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/login.html'));
});

// Serve static files from Frontend folder
app.use(express.static(path.join(__dirname, '../Frontend')));

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/weather', weatherRoutes);
//app.use('/api/mandi', mandiRoutes);
app.use('/api/events', eventRoutes);

const PORT = process.env.PORT || 4000;

const startServer = () => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log('MongoDB connected');
      startServer();
    })
    .catch((err) => {
      console.error('Mongo connection error', err);
      console.log('Starting server without MongoDB connection');
      startServer();
    });
} else {
  console.log('No MONGO_URI set — starting server without DB');
  startServer();
}
