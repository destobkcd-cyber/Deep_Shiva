const express = require('express');

const router = express.Router();

// Curated 2025 agriculture events (kept lightweight and server-side)
router.get('/', async (req, res) => {
  try {
    const events = [
      {
        title: 'Indusfood Agritech 2025',
        meta: 'January 8-10 · Yashobhoomi, IICC, Dwarka, New Delhi',
        name: 'Indusfood Agritech 2025',
        dates: 'January 8-10',
        location: 'Yashobhoomi, IICC, Dwarka, New Delhi',
        description: 'Global B2B expo on agriculture, aquaculture, dairy, and poultry tech with 600+ exhibitors and 30,000 visitors.',
        type: 'Expo'
      },
      {
        title: 'Sustainable Agriculture & Food Processing Growth Summit & Expo 2025',
        meta: 'January 17-18 · Kerala Agricultural University, Thrissur, Kerala',
        name: 'Sustainable Agriculture & Food Processing Growth Summit & Expo 2025',
        dates: 'January 17-18',
        location: 'Kerala Agricultural University, Thrissur, Kerala',
        description: 'Focuses on agro-processing and FPOs with 100+ stalls and 30,000 participants.',
        type: 'Summit & Expo'
      },
      {
        title: 'Bharat Agri Tech 2025',
        meta: 'January 18-20 · College of Agriculture Ground, Indore, Madhya Pradesh',
        name: 'Bharat Agri Tech 2025',
        dates: 'January 18-20',
        location: 'College of Agriculture Ground, Indore, Madhya Pradesh',
        description: 'Highlights agri-tech, horticulture, dairy, and organics for B2B/B2C interactions.',
        type: 'Tech Expo'
      },
      {
        title: 'Agri Intex 2025',
        meta: 'July 10-14 · CODISSIA Trade Fair Complex, Coimbatore, Tamil Nadu',
        name: 'Agri Intex 2025',
        dates: 'July 10-14',
        location: 'CODISSIA Trade Fair Complex, Coimbatore, Tamil Nadu',
        description: 'Covers agriculture, horticulture, dairy, and food processing tech.',
        type: 'Trade Fair'
      },
      {
        title: 'AgriTech India 2025',
        meta: 'August 1-3 · Bangalore International Exhibition Centre (BIEC), Bangalore',
        name: 'AgriTech India 2025',
        dates: 'August 1-3',
        location: 'Bangalore International Exhibition Centre (BIEC), Bangalore',
        description: 'Premier show on farm machinery, livestock, and processing with 350+ stalls and concurrent events like DairyTech India.',
        type: 'Agritech Expo'
      },
      {
        title: 'BASAI 2025 – Future of Sustainable Agriculture',
        meta: 'September 22-23 · India Habitat Centre, New Delhi',
        name: 'BASAI 2025 – Future of Sustainable Agriculture',
        dates: 'September 22-23',
        location: 'India Habitat Centre, New Delhi',
        description: 'Explores biofertilizers, biopesticides, AI, and climate-resilient farming with expert panels.',
        type: 'Conference'
      },
      {
        title: 'Kamdhenu Gau Krishi Mahotsav (KGKM)',
        meta: 'November 6-9 · near Leisure Valley Park, Gurugram, Haryana',
        name: 'Kamdhenu Gau Krishi Mahotsav (KGKM)',
        dates: 'November 6-9',
        location: 'near Leisure Valley Park, Gurugram, Haryana',
        description: 'Promotes indigenous cow breeds and sustainable practices.',
        type: 'Mahotsav'
      },
      {
        title: 'KISAN Agri Show 2025',
        meta: 'December 10-14 · PIECC, Moshi, Pune',
        name: 'KISAN Agri Show 2025',
        dates: 'December 10-14',
        location: 'PIECC, Moshi, Pune',
        description: "India's largest agri expo with 1.5 lakh visitors showcasing farm tech innovations.",
        type: 'Agri Show'
      }
    ];

    res.json(events);
  } catch (err) {
    console.error('Events error', err.message);
    res.status(500).json({ message: 'Events not available' });
  }
});

module.exports = router;
