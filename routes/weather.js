const express = require('express');
const axios = require('axios');

const router = express.Router();
const OPENWEATHER_API_KEY = 'f6b77640fbe28dbf40138b899bacd175';

// GET /api/weather?lat=18.52&lon=73.86
router.get('/', async (req, res) => {
  try {
    const { lat = '18.52', lon = '73.86' } = req.query; // default: Pune
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;

    const { data } = await axios.get(url);

    res.json({
      temp: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      wind: data.wind.speed,
      cloudiness: data.clouds.all,
      rainChance: data.clouds.all > 50 ? Math.round(data.clouds.all) : 0,
      location: data.name,
      country: data.sys.country,
    });
  } catch (err) {
    console.error('Weather error', err.message);
    res.status(500).json({ message: 'Weather not available' });
  }
});

module.exports = router;

