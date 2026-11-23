const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const HUSMO_BASE = 'https://husmodataapi.com/api';
const HUSMO_TOKEN = (process.env.HUSMO_TOKEN || '').trim();
function husmoHeaders() {
  return { 'Authorization': `Token ${HUSMO_TOKEN}`, 'Content-Type': 'application/json' };
}
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>DataTech - Buy Data & Airtime</title><style>*{box-sizing:border-box}body{font-family:sans-serif;background:#0f172a;color:#fff;margin:0;padding:0}header{background:#facc15;color:#000;padding:16px;text-align:center}header h1{margin:0;font-size:22px}header p{margin:4px 0 0;font-size:13px}.wrap{max-width:480px;margin:auto;padding:16px}.card{background:#1e293b;border-radius:16px;padding:16px;margin-bottom:14px}label{font-size:13px;color:#cbd5e1}input,select{width:100%;padding:14px;font-size:16px;border-radius:10px;border:1px solid #334155;background:#0f172a;color:#fff;margin:6px 0 12px}button{width:100%;padding:15px;font-size:16px;border-radius:12px;border:0;background:#facc15;font-weight:bold;color:#000}button.green{background:#22c55e}button.white{background:#fff;margin-top:10px}pre{background:#0f172a;padding:12px;border-radius:10px;white-space:pre-wrap;word-break:break-word;font-size:13px}.tabs{display:flex;gap:8px;margin-bottom:12px}.tabs button{background:#334155;color:#fff}.tabs button.active{background:#facc15;color:#000}.bal{font-size:18px;font-weight:bold}.small{font-size:12px;color:#94a3b8}</style></head><body><header><h1>DataTech</h1><p>Real Data & Airtime - Powered by Husmo</p></header><div class="wrap"><div class="card"><div>Wallet Balance (Husmo)</div><div class="bal" id="balText">Loading...</div><button class="white" onclick="loadBal()">Refresh Balance</button><div class="small" id="balNote">Balance na from Husmo directly.</div></div><div class="tabs"><button id="tabData" class="active" onclick="showTab('data')">Buy Data</button><button id="tabAir" onclick="showTab('air')">Buy Airtime</button></div><div id="dataBox" class="card"><label>Network</label><select id="dNet"><option value="1">MTN</option><option value="3">【entity-Airtel¦canonical_name=Airtel】</option><option value="2">Glo</option><option value="4">9mobile</option></select><label>Plan</label><select id="dPlan"><option value="369|360">MTN SME 500MB - N360 - ID 369</option><option value="267|137.5">MTN SME2 500MB - N137.50 - ID 267</option><option value="240|24">MTN Corporate 50MB - N24 - ID 240</option><option value="384|195">【entity-Airtel¦canonical_name=Airtel】 Gifting 200MB - N195 - ID 384</option><option value="385|293">【entity-Airtel¦canonical_name=Airtel】 Gifting 300MB - N293 - ID 385</option></select><label>Phone number</label><input id="dPhone" value="07044102707" maxlength="11"><button onclick="buyData()">Buy Data - REAL MONEY</button><p id="dStatus" class="small">Not sent yet. If Husmo gateway down, e go show error, money no go comot.</p><pre id="dOut"></pre></div><div id="airBox" class="card" style="display:none"><label>Network</label><select id="aNet"><option value="1">MTN</option><option value="3">【entity-Airtel¦canonical_name=Airtel】</option><option value="2">Glo</option><option value="4">9mobile</option></select><label>Phone number</label><input id="aPhone" value="07044102707" maxlength="11"><label>Amount (Naira)</label><input id="aAmt" type="number" value="50"><button class="green" onclick="buyAir()">Buy Airtime - REAL MONEY</button><p id="aStatus" class="small">Not sent yet. Husmo Topup dey give 500 error tonight - e fit fail until Husmo fix am.</p><pre id="aOut"></pre></div><div class="card"><div class="small">Note: MTN Gifting / SME2 / 【entity-Airtel¦canonical_name=Airtel】 Gifting don down for Husmo tonight (gateway). When Husmo fix am, same app go work. No need new code.</div></div></div><script>async function loadBal(){document.getElementById('balText').innerText='Loading...';try{const r=await fetch('/api/balance');const d=await r.json();document.getElementById('balText').innerText='N'+d.balance;}catch(e){document.getElementById('balText').innerText='Failed to load';}}function showTab(t){document.getElementById('dataBox').style.display=t==='data'?'block':'none';document.getElementById('airBox').style.display=t==='air'?'block':'none';document.getElementById('tabData').className=t==='data'?'active':'';document.getElementById('tabAir').className=t==='air'?'active':'';}async function buyData(){const net=document.getElementById('dNet').value;const phone=document.getElementById('dPhone').value;const [plan,price]=document.getElementById('dPlan').value.split('|');if(!confirm('Send REAL Data N'+price+' to '+phone+' ?'))return;document.getElementById('dStatus').innerText='Sending... wait';try{const r=await fetch('/api/buy-data',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({network:net,phone,plan})});const d=await r.json();document.getElementById('dStatus').innerText='Done - see below';document.getElementById('dOut').innerText=JSON.stringify(d,null,2);loadBal();}catch(e){document.getElementById('dStatus').innerText='Failed: '+e;}}async function buyAir(){const net=document.getElementById('aNet').value;const phone=document.getElementById('aPhone').value;const amount=Number(document.getElementById('aAmt').value);if(!confirm('Send REAL Airtime N'+amount+' to '+phone+' ?'))return;document.getElementById('aStatus').innerText='Sending... wait';try{const r=await fetch('/api/buy-airtime',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({network:net,phone,amount})});const d=await r.json();document.getElementById('aStatus').innerText='Done - see below';document.getElementById('aOut').innerText=JSON.stringify(d,null,2);loadBal();}catch(e){document.getElementById('aStatus').innerText='Failed: '+e;}}loadBal();</script></body></html>`);
});
app.get('/test', (req, res) => res.redirect('/'));
app.get('/api/balance', async (req, res) => {
  if (!HUSMO_TOKEN) return res.json({ success: false, message: 'HUSMO_TOKEN not set' });
  try {
    const r = await fetch(`${HUSMO_BASE}/user/`, { headers: husmoHeaders() });
    const data = await r.json();
    const bal = data && data.user ? data.user.Account_Balance : null;
    res.json({ success: true, balance: bal });
  } catch (e) { res.json({ success: false, message: 'Could not reach Husmo' }); }
});
app.post('/api/buy-data', async (req, res) => {
  const { network, phone, plan } = req.body;
  if (!network || !phone || !plan) return res.json({ success: false, message: 'Need network, phone and plan' });
  if (!HUSMO_TOKEN) return res.json({ success: false, message: 'HUSMO_TOKEN not set' });
  try {
    const r = await fetch(`${HUSMO_BASE}/data/`, { method: 'POST', headers: husmoHeaders(), body: JSON.stringify({ network, mobile_number: phone, plan, Ported_number: true }) });
    const data = await r.json();
    res.json({ success: true, message: 'Sent to Husmo', husmo: data, order: { network, phone, plan } });
  } catch (e) { res.json({ success: false, message: 'Could not reach Husmo' }); }
});
app.post('/api/buy-airtime', async (req, res) => {
  const { network, phone, amount } = req.body;
  if (!network || !phone || !amount) return res.json({ success: false, message: 'Need network, phone and amount' });
  if (!HUSMO_TOKEN) return res.json({ success: false, message: 'HUSMO_TOKEN not set' });
  try {
    const r = await fetch(`${HUSMO_BASE}/topup/`, { method: 'POST', headers: husmoHeaders(), body: JSON.stringify({ network: parseInt(network), mobile_number: phone, amount, Ported_number: true }) });
    const text = await r.text();
    let data; try { data = JSON.parse(text); } catch { data = { raw: text.slice(0, 1000) }; }
    res.json({ success: true, message: 'Got answer from Husmo', husmo_status: r.status, husmo: data, order: { network, phone, amount } });
  } catch (e) { res.json({ success: false, message: 'Could not reach Husmo - ' + e.message }); }
});
app.post('/api/buy', (req, res) => {
  const { type, network, phone, amount } = req.body;
  res.json({ success: true, message: 'Test order received', order: { type, network, phone, amount } });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
