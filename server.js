const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const HUSMO_BASE = 'https://husmodataapi.com/api';
const HUSMO_TOKEN = process.env.HUSMO_TOKEN || '';
function husmoHeaders() {
  return {
    'Authorization': `Token ${HUSMO_TOKEN}`,
    'Content-Type': 'application/json'
  };
}
app.get('/', (req, res) => {
  res.json({ message: 'DataTech Backend is working', husmo: HUSMO_TOKEN ? 'token-set' : 'token-missing' });
});
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/balance', async (req, res) => {
  if (!HUSMO_TOKEN) return res.json({ success: false, message: 'HUSMO_TOKEN not set in Render Environment' });
  try {
    const r = await fetch(`${HUSMO_BASE}/user/`, { headers: husmoHeaders() });
    const data = await r.json();
    res.json({ success: true, husmo: data });
  } catch (e) {
    res.json({ success: false, message: 'Could not reach Husmo', error: String(e) });
  }
});
app.get('/api/networks', async (req, res) => {
  if (!HUSMO_TOKEN) return res.json({ success: false, message: 'HUSMO_TOKEN not set' });
  try {
    const r = await fetch(`${HUSMO_BASE}/get/network/`, { headers: husmoHeaders() });
    const data = await r.json();
    res.json({ success: true, husmo: data });
  } catch (e) {
    res.json({ success: false, message: 'Could not reach Husmo', error: String(e) });
  }
});
app.post('/api/buy-data', async (req, res) => {
  const { network, phone, plan } = req.body;
  if (!network || !phone || !plan) {
    return res.json({ success: false, message: 'Need network, phone and plan. Example: network=network_id, phone=0803..., plan=241' });
  }
  if (!HUSMO_TOKEN) return res.json({ success: false, message: 'HUSMO_TOKEN not set in Render Environment - cannot send real data yet' });
  try {
    const r = await fetch(`${HUSMO_BASE}/data/`, {
      method: 'POST',
      headers: husmoHeaders(),
      body: JSON.stringify({ network, mobile_number: phone, plan, Ported_number: true })
    });
    const data = await r.json();
    res.json({ success: true, message: 'Sent to Husmo', husmo: data, order: { network, phone, plan } });
  } catch (e) {
    res.json({ success: false, message: 'Could not reach Husmo', error: String(e) });
  }
});
app.post('/api/buy', (req, res) => {
  const { type, network, phone, amount } = req.body;
  res.json({ success: true, message: 'Test order received - use /api/buy-data for real Husmo data', order: { type, network, phone, amount } });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
