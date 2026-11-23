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
const PLANS = [
  { id: '369', label: 'MTN SME 500MB - N360', price: 360, net: '1' },
  { id: '267', label: 'MTN SME2 500MB - N137.50', price: 137.5, net: '1' },
  { id: '240', label: 'MTN Corporate 50MB - N24', price: 24, net: '1' },
  { id: '384', label: ' Airtel Gifting 200MB - N195', price: 195, net: '3' },
  { id: '385', label: ' Airtel Gifting 300MB - N293', price: 293, net: '3' }
];
const CUSTOMER_HTML = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>DataTech - Buy Data & Airtime</title><style>*{box-sizing:border-box}body{font-family:sans-serif;background:#0f172a;color:#fff;margin:0}header{background:#facc15;color:#000;padding:18px;text-align:center}header h1{margin:0;font-size:24px}header p{margin:4px 0 0;font-size:13px}.wrap{max-width:480px;margin:auto;padding:16px}.card{background:#1e293b;border-radius:16px;padding:16px;margin-bottom:14px}label{font-size:13px;color:#cbd5e1}input,select{width:100%;padding:14px;font-size:16px;border-radius:10px;border:1px solid #334155;background:#0f172a;color:#fff;margin:6px 0 12px}button{width:100%;padding:15px;font-size:16px;border-radius:12px;border:0;background:#facc15;font-weight:bold;color:#000}button.green{background:#22c55e}.tabs{display:flex;gap:8px;margin-bottom:12px}.tabs button{background:#334155;color:#fff}.tabs button.active{background:#facc15;color:#000}.msg{padding:12px;border-radius:10px;background:#0f172a;font-size:14px;min-height:44px}.small{font-size:12px;color:#94a3b8}</style></head><body><header><h1>DataTech</h1><p>Fast Data & Airtime</p></header><div class="wrap"><div class="tabs"><button id="tabData" class="active" onclick="showTab('data')">Buy Data</button><button id="tabAir" onclick="showTab('air')">Buy Airtime</button></div><div id="dataBox" class="card"><label>Network</label><select id="dNet" onchange="filterPlans()"><option value="1">MTN</option><option value="3"> Airtel</option><option value="2">Glo</option><option value="4">9mobile</option></select><label>Plan</label><select id="dPlan"></select><label>Phone number</label><input id="dPhone" placeholder="e.g. 07044102707" maxlength="11"><button onclick="buyData()">Buy Data</button><div class="msg" id="dMsg">Choose plan and press Buy Data.</div></div><div id="airBox" class="card" style="display:none"><label>Network</label><select id="aNet"><option value="1">MTN</option><option value="3"> Airtel</option><option value="2">Glo</option><option value="4">9mobile</option></select><label>Phone number</label><input id="aPhone" placeholder="e.g. 07044102707" maxlength="11"><label>Amount (Naira)</label><input id="aAmt" type="number" value="100"><button class="green" onclick="buyAir()">Buy Airtime</button><div class="msg" id="aMsg">Enter phone and amount, press Buy Airtime.</div></div><p class="small">Need help? Contact DataTech support. Please check your number before you pay.</p></div><script>const PLANS=${JSON.stringify(PLANS)};function filterPlans(){const net=document.getElementById('dNet').value;const sel=document.getElementById('dPlan');sel.innerHTML='';const list=PLANS.filter(p=>p.net===net);if(!list.length){sel.innerHTML='<option value="">No plan for this network yet</option>';return;}list.forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=p.label;sel.appendChild(o);});}function showTab(t){document.getElementById('dataBox').style.display=t==='data'?'block':'none';document.getElementById('airBox').style.display=t==='air'?'block':'none';document.getElementById('tabData').className=t==='data'?'active':'';document.getElementById('tabAir').className=t==='air'?'active':'';}async function buyData(){const net=document.getElementById('dNet').value;const phone=document.getElementById('dPhone').value.trim();const plan=document.getElementById('dPlan').value;const msg=document.getElementById('dMsg');if(phone.length!==11){msg.innerText='Please enter correct 11-digit phone number.';return;}if(!plan){msg.innerText='No plan for this network yet.';return;}if(!confirm('Buy this data for '+phone+' ?'))return;msg.innerText='Sending... please wait...';try{const r=await fetch('/api/customer-buy-data',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({network:net,phone,plan})});const d=await r.json();msg.innerText=d.message;}catch(e){msg.innerText='Network error, try again.';}}async function buyAir(){const net=document.getElementById('aNet').value;const phone=document.getElementById('aPhone').value.trim();const amount=Number(document.getElementById('aAmt').value);const msg=document.getElementById('aMsg');if(phone.length!==11){msg.innerText='Please enter correct 11-digit phone number.';return;}if(!amount||amount<50){msg.innerText='Amount must be at least N50.';return;}if(!confirm('Buy Airtime N'+amount+' for '+phone+' ?'))return;msg.innerText='Sending... please wait...';try{const r=await fetch('/api/customer-buy-airtime',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({network:net,phone,amount})});const d=await r.json();msg.innerText=d.message;}catch(e){msg.innerText='Network error, try again.';}}filterPlans();</script></body></html>`;
const ADMIN_HTML = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>DataTech Admin</title><style>body{font-family:sans-serif;background:#111;color:#fff;padding:16px;max-width:520px;margin:auto}input,select{width:100%;padding:12px;background:#222;color:#fff;border:1px solid #333;border-radius:10px;margin:6px 0}button{width:100%;padding:14px;background:#facc15;border:0;border-radius:12px;font-weight:bold}pre{background:#222;padding:12px;border-radius:10px;white-space:pre-wrap;word-break:break-word}</style></head><body><h2>DataTech - ADMIN ONLY</h2><p>Do not share this link with customers.</p><div><b>Wallet Balance (Husmo):</b> <span id="bal">Loading...</span></div><button onclick="loadBal()">Refresh Balance</button><hr><h3>Test Buy Data</h3><select id="dNet"><option value="1">MTN (1)</option><option value="3"> Airtel (3)</option><option value="2">Glo (2)</option><option value="4">9mobile (4)</option></select><input id="dPhone" value="07044102707"><input id="dPlan" value="369"><button onclick="buyData()">Buy Data (Admin - See Full Answer)</button><pre id="dOut"></pre><hr><h3>Test Buy Airtime</h3><input id="aPhone" value="07044102707"><input id="aAmt" type="number" value="50"><button onclick="buyAir()">Buy Airtime (Admin)</button><pre id="aOut"></pre><script>async function loadBal(){try{const r=await fetch('/api/balance');const d=await r.json();document.getElementById('bal').innerText='N'+d.balance;}catch(e){document.getElementById('bal').innerText='Failed';}}async function buyData(){const r=await fetch('/api/buy-data',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({network:document.getElementById('dNet').value,phone:document.getElementById('dPhone').value,plan:document.getElementById('dPlan').value})});const d=await r.json();document.getElementById('dOut').innerText=JSON.stringify(d,null,2);loadBal();}async function buyAir(){const r=await fetch('/api/buy-airtime',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({network:'1',phone:document.getElementById('aPhone').value,amount:Number(document.getElementById('aAmt').value)})});const d=await r.json();document.getElementById('aOut').innerText=JSON.stringify(d,null,2);loadBal();}loadBal();</script></body></html>`;
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/', (req, res) => res.send(CUSTOMER_HTML));
app.get('/admin', (req, res) => res.send(ADMIN_HTML));
app.get('/test', (req, res) => res.redirect('/admin'));
app.get('/api/balance', async (req, res) => {
  if (!HUSMO_TOKEN) return res.json({ success: false, message: 'HUSMO_TOKEN not set' });
  try {
    const r = await fetch(`${HUSMO_BASE}/user/`, { headers: husmoHeaders() });
    const data = await r.json();
    const bal = data && data.user ? data.user.Account_Balance : null;
    res.json({ success: true, balance: bal });
  } catch (e) { res.json({ success: false, message: 'Could not reach Husmo' }); }
});
function customerMessage(husmo, type) {
  const txt = JSON.stringify(husmo || {}).toLowerCase();
  if (txt.includes('not available') || txt.includes('no site gateway')) return 'Sorry, this network is temporarily unavailable. Please try another network or try again later. No money was taken.';
  if (txt.includes('insufficient')) return 'Sorry, we are out of stock for this plan right now. Please try another plan.';
  if (husmo && (husmo.Status === 'successful' || husmo.success === true || husmo.status === 'successful')) return type === 'data' ? 'Success! Data has been sent to your phone. Please check your balance.' : 'Success! Airtime has been sent to your phone.';
  if (husmo && husmo.error) return 'Sorry, this purchase failed. No money was taken. Please try again or try another network.';
  return 'Your request was sent. Please check your phone. If it did not arrive, contact support.';
}
app.post('/api/customer-buy-data', async (req, res) => {
  const { network, phone, plan } = req.body;
  if (!network || !phone || !plan) return res.json({ success: false, message: 'Please enter network, phone and plan.' });
  try {
    const r = await fetch(`${HUSMO_BASE}/data/`, { method: 'POST', headers: husmoHeaders(), body: JSON.stringify({ network, mobile_number: phone, plan, Ported_number: true }) });
    const data = await r.json();
    res.json({ success: true, message: customerMessage(data, 'data') });
  } catch (e) { res.json({ success: false, message: 'Network error, please try again.' }); }
});
app.post('/api/customer-buy-airtime', async (req, res) => {
  const { network, phone, amount } = req.body;
  if (!network || !phone || !amount) return res.json({ success: false, message: 'Please enter network, phone and amount.' });
  try {
    const r = await fetch(`${HUSMO_BASE}/topup/`, { method: 'POST', headers: husmoHeaders(), body: JSON.stringify({ network: parseInt(network), mobile_number: phone, amount, Ported_number: true }) });
    const text = await r.text();
    let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }
    res.json({ success: true, message: customerMessage(data, 'airtime') });
  } catch (e) { res.json({ success: false, message: 'Network error, please try again.' }); }
});
app.post('/api/buy-data', async (req, res) => {
  const { network, phone, plan } = req.body;
  try {
    const r = await fetch(`${HUSMO_BASE}/data/`, { method: 'POST', headers: husmoHeaders(), body: JSON.stringify({ network, mobile_number: phone, plan, Ported_number: true }) });
    const data = await r.json();
    res.json({ success: true, message: 'Sent to Husmo', husmo: data, order: { network, phone, plan } });
  } catch (e) { res.json({ success: false, message: 'Could not reach Husmo' }); }
});
app.post('/api/buy-airtime', async (req, res) => {
  const { network, phone, amount } = req.body;
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
