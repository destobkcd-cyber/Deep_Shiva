// const express = require('express');

// const router = express.Router();

// // Simple demo data – replace with real API later
// router.get('/', async (req, res) => {
//   try {
//     const demoRates = [
//       { commodity: 'Wheat', modalPrice: 2500, minPrice: 2450, maxPrice: 2550, changePct: 5, unit: 'Rs/Quintal' },
//       { commodity: 'Rice', modalPrice: 2880, minPrice: 2820, maxPrice: 2950, changePct: -2, unit: 'Rs/Quintal' },
//       { commodity: 'Basmati Rice', modalPrice: 4500, minPrice: 4400, maxPrice: 4600, changePct: 2, unit: 'Rs/Quintal' },
//       { commodity: 'Maize', modalPrice: 1650, minPrice: 1620, maxPrice: 1680, changePct: 3, unit: 'Rs/Quintal' },
//       { commodity: 'Gram (Chana)', modalPrice: 5200, minPrice: 5100, maxPrice: 5300, changePct: 1, unit: 'Rs/Quintal' },
//       { commodity: 'Soybean', modalPrice: 4800, minPrice: 4700, maxPrice: 4900, changePct: -1, unit: 'Rs/Quintal' },
//       { commodity: 'Cotton', modalPrice: 6500, minPrice: 6400, maxPrice: 6600, changePct: 4, unit: 'Rs/Quintal' },
//       { commodity: 'Vegetables', modalPrice: 850, minPrice: 800, maxPrice: 900, changePct: -3, unit: 'Rs/Kg' },
//     ];
//     res.json(demoRates);
//   } catch (err) {
//     console.error('Mandi error', err.message);
//     res.status(500).json({ message: 'Mandi rates not available' });
//   }
// });

// module.exports = router;
