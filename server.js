const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper: fetch with timeout
async function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// Proxy: Search Roblox users by username
app.get('/api/users/search', async (req, res) => {
  const { username } = req.query;
  if (!username || username.length < 3) {
    return res.json({ data: [] });
  }
  try {
    const response = await fetchWithTimeout(
      `https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(username)}&limit=10`,
      { headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' } },
      6000
    );
    if (!response.ok) {
      return res.status(response.status).json({ data: [], error: `Roblox API ${response.status}` });
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    const isTimeout = err.name === 'AbortError';
    res.status(isTimeout ? 504 : 500).json({
      data: [],
      error: isTimeout ? 'Search timed out' : 'Failed to fetch users',
      details: err.message
    });
  }
});

// Proxy: Get user info by userId
app.get('/api/users/:userId', async (req, res) => {
  try {
    const response = await fetchWithTimeout(
      `https://users.roblox.com/v1/users/${req.params.userId}`,
      { headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' } },
      5000
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user', details: err.message });
  }
});

// Proxy: Get MULTIPLE avatars in ONE request (batch) — much faster!
app.get('/api/avatars/batch', async (req, res) => {
  const { userIds } = req.query;
  if (!userIds) return res.json({ data: [] });
  try {
    const response = await fetchWithTimeout(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userIds}&size=420x420&format=Png&isCircular=true`,
      { headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' } },
      6000
    );
    if (!response.ok) return res.json({ data: [] });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ data: [], error: 'Failed to fetch avatars', details: err.message });
  }
});

// Proxy: Get single avatar (kept for compatibility)
app.get('/api/avatar/:userId', async (req, res) => {
  try {
    const response = await fetchWithTimeout(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${req.params.userId}&size=420x420&format=Png&isCircular=true`,
      { headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' } },
      5000
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ data: [], error: 'Failed to fetch avatar', details: err.message });
  }
});

// Proxy: Get multiple users by IDs
app.post('/api/users/batch', async (req, res) => {
  try {
    const response = await fetchWithTimeout(
      `https://users.roblox.com/v1/users`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
        body: JSON.stringify({ userIds: req.body.userIds, excludeBannedUsers: false })
      },
      5000
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users', details: err.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
