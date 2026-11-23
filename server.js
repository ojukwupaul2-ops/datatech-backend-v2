const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const HUSMO_BASE = 'https://husmodataapi.com/api';
const HUSMO_TOKEN = (process.env.HUSMO_TOKEN || '').trim();
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
app.get('/test', (req, res) => {
  res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>DataTech Real Test</title><style>body{font-family:sans-serif;padding:20px;background:#111;color:#fff;max-width:480px;margin:auto}input{width:100%;padding:14px;font-size:18px;border-radius:10px;border:1px solid #333;background:#222;color:#fff;margin:10px 0}button{width:100%;padding:16px;font-size:18px;border-radius:12px;border:0;background:#facc15;font-weight:bold}pre{background:#222;padding:14px;border-radius:10px;white-space:pre-wrap;word-break:break-word}</style></head><body><h2>DataTech - Real Test</h2><p>MTN 75MB - N74 - Plan 394 - Network 1<br>REAL MONEY - Balance was N368</p><label>Your MTN number</label><input id="phone" value="07044102707" maxlength="11"><button onclick="buy()">Send REAL 75MB - N74</button><p id="status">Not sent yet</p><pre id="out"></pre><button onclick="bal()" style="background:#fff;margin-top:10px">Check my new balance</button><pre id="bal"></pre><script>async function buy(){const phone=document.getElementById('phone').value;document.getElementById('status').innerText='Sending to Husmo... please wait';try{const r=await fetch('/api/buy-data',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({network:'1',phone,plan:'394'})});const d=await r.json();document.getElementById('status').innerText='Done - see below';document.getElementById('out').innerText=JSON.stringify(d,null,2);}catch(e){document.getElementById('status').innerText='Failed to fetch: '+e;}}async function bal(){try{const r=await fetch('/api/balance');const d=await r.json();const b=d.husmo&&d.husmo.user?d.husmo.user.Account_Balance:'?';document.getElementById('bal').innerText='Balance: N'+b+'\\nFull: '+JSON.stringify(d).slice(0,500);}catch(e){document.getElementById('bal').innerText='Failed: '+e;}}</script></body></html>`);
});
app.get('/api/balance', async (req, res) => {
  if (!HUSMO_TOKEN) return res.json({ success: false, message: 'HUSMO_TOKEN not set in Render Environment' });
  try {
    const r = await fetch(`${HUSMO_BASE}/user/`, { headers: husmoHeaders() });
    const data = await r.json();
    res.json({ success: true, husmo: data });
  } catch (e) {
    res.json({ success: false, message: 'Could not reach Husmo' });
  }
});
app.get('/api/networks', async (req, res) => {
  if (!HUSMO_TOKEN) return res.json({ success: false, message: 'HUSMO_TOKEN not set' });
  try {
    const r = await fetch(`${HUSMO_BASE}/get/network/`, { headers: husmoHeaders() });
    const data = await r.json();
    res.json({ success: true, husmo: data });
  } catch (e) {
    res.json({ success: false, message: 'Could not reach Husmo' });
  }
});
app.post('/api/buy-data', async (req, res) => {
  const { network, phone, plan } = req.body;
  if (!network || !phone || !plan) {
    return res.json({ success: false, message: 'Need network, phone and plan' });
  }
  if (!HUSMO_TOKEN) return res.json({ success: false, message: 'HUSMO_TOKEN not set in Render Environment' });
  try {
    const r = await fetch(`${HUSMO_BASE}/data/`, {
      method: 'POST',
      headers: husmoHeaders(),
      body: JSON.stringify({ network, mobile_number: phone, plan, Ported_number: true })
    });
    const data = await r.json();
    res.json({ success: true, message: 'Sent to Husmo', husmo: data, order: { network, phone, plan } });
  } catch (e) {
    res.json({ success: false, message: 'Could not reach Husmo' });
  }
});
app.post('/api/buy', (req, res) => {
  const { type, network, phone, amount } = req.body;
  res.json({ success: true, message: 'Test order received', order: { type, network, phone, amount } });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
