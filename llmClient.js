const axios = require('axios');
require('dotenv').config();

const PROVIDER = process.env.LLM_PROVIDER || 'openai';
const MODEL = process.env.LLM_MODEL || 'gpt-4o-mini';
const API_KEY = process.env.LLM_API_KEY;

async function callLLM(messages) {
  if (!API_KEY) throw new Error('LLM_API_KEY is not set');

  if (PROVIDER === 'openai') {
    const res = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      { model: MODEL, messages, temperature: 0.3 },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return res.data.choices[0].message.content;
  }

  // placeholders for other providers – update if you pick them
  if (PROVIDER === 'perplexity') {
    const res = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      { model: MODEL, messages, temperature: 0.3 },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return res.data.choices[0].message.content;
  }

  throw new Error(`Unknown LLM_PROVIDER: ${PROVIDER}`);
}

module.exports = { callLLM };
 