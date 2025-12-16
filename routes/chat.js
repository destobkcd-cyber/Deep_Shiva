const express = require('express');
const ChatMessage = require('../models/ChatMessage');
const auth = require('../middleware/authMiddleware');
const { callLLM } = require('../llmClient');

const router = express.Router();

function buildSystemPrompt() {
  return {
    role: 'system',
    content:
      'You are an Indian agriculture assistant chatbot. ' +
      'You help farmers with crops, soil, irrigation, weather, mandi rates, and government schemes. ' +
      'Explain in simple language. If you are not sure, say you are not sure instead of guessing.',
  };
}

// GET /api/chat/history?sessionId=home&limit=40
router.get('/history', auth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '40', 10), 100);
    const filter = { user: req.user.id };
    if (req.query.sessionId) filter.sessionId = req.query.sessionId;

    const messages = await ChatMessage.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json(messages.reverse());
  } catch (err) {
    console.error('Chat history error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/chat/llm
router.post('/llm', auth, async (req, res) => {
  try {
    const { content, sessionId } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'content is required' });
    }
    const sessionKey = sessionId || 'home';

    const userMsg = await ChatMessage.create({
      user: req.user.id,
      role: 'user',
      content,
      sessionId: sessionKey,
    });

    const history = await ChatMessage.find({
      user: req.user.id,
      sessionId: sessionKey,
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const reversed = history.reverse();
    const chatMessages = [
      buildSystemPrompt(),
      ...reversed.map((m) => ({ role: m.role, content: m.content })),
    ];

    let assistantText;
    try {
      assistantText = await callLLM(chatMessages);
    } catch (apiErr) {
      console.error('LLM API error', apiErr.response?.data || apiErr.message);
      assistantText =
        'There was a problem contacting the AI model. Please try again in a moment.';
    }

    const botMsg = await ChatMessage.create({
      user: req.user.id,
      role: 'assistant',
      content: assistantText,
      sessionId: sessionKey,
    });

    res.status(201).json({ messages: [userMsg, botMsg] });
  } catch (err) {
    console.error('Chat LLM error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
