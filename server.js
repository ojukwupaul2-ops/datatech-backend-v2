const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());

// ===== CONFIG =====
const HUSMO_BASE = 'https://api.husmodata.com';
const VTPASS_SANDBOX = 'https://sandbox.vtpass.com/api';
const VTPASS_LIVE = 'https://vtpass.com/api';
const VTPASS_BASE = process.env.VTPASS_LIVE_API_KEY ? VTPASS_LIVE : VTPASS_SANDBOX;
const VTPASS_KEY = process.env.VTPASS_LIVE_API_KEY || process.env.VTPASS_API_KEY || '';
const VTPASS_PUB = process.env.VTPASS_LIVE_PUBLIC_KEY || process.env.VTPASS_PUBLIC_KEY || '';
const VTPASS_SEC = process.env.VTPASS_LIVE_SECRET_KEY || process.env.VTPASS_SECRET_KEY || '';
const HUSMO_KEY = process.env.HUSMO_API_KEY || '';
const HUSMO_USER = process.env.HUSMO_USERNAME || '';

// VTPass Data plans - verified Request IDs
const VTPASS_DATA = {
  'MTN': { serviceID:'mtn-data', variation:'mtn-10mb-100', name:'MTN 10MB - 100', price:100 },
  'AIRTEL': { serviceID:'airtel-data', variation:'airt-50', name:'Airtel 50MB - 100', price:100 },
  'GLO': { serviceID:'glo-data', variation:'glo100', name:'GLO 100MB - 200', price:200 },
  '9MOBILE': { serviceID:'etisalat-data', variation:'eti-100', name:'9mobile 100MB - 100', price:100 }
};
const VTPASS_AIRTIME = { 'MTN':'MTN', 'AIRTEL':'AIRTEL', 'GLO':'GLO', '9MOBILE':'ETISALAT' };
const HUSMO_PLANS = [
  {id:'husmo-mtn-50', network:'MTN', name:'MTN 50MB Corporate Gifting', price:24},
  {id:'husmo-mtn-500-sme2', network:'MTN', name:'MTN 500MB SME2', price:137.5},
  {id:'husmo-mtn-500-sme', network:'MTN', name:'MTN 500MB SME', price:360},
  {id:'husmo-airtel-200', network:'AIRTEL', name:'Airtel 200MB Gifting', price:195},
  {id:'husmo-airtel-300', network:'AIRTEL', name:'Airtel 300MB Gifting', price:293}
];

const ONBOARDING = `
<div id="onboard">
  <div class="topbar"><div class="logo">DATA<span>TECH</span></div><button id="skipBtn" onclick="skipOnboard()">Skip &rarr;</button></div>
  <div id="slider">
    <div class="slide s1 active"><div class="pic">📱</div><h2>1. Cheap Data Bundles</h2><p>Buy MTN, Glo, Airtel and 9mobile data at the cheapest price. Starting from &#8358;280 only.</p></div>
    <div class="slide s2"><div class="pic">🧾</div><h2>2. Utility Bill Payments</h2><p>Pay for electricity, water, cable TV, and more in seconds from your home.</p></div>
    <div class="slide s3"><div class="pic">📺</div><h2>3. Cable TV</h2><p>Renew DSTV, GOTV, and Startimes instantly. No stress, no queue.</p></div>
    <div class="slide s4"><div class="pic">💵</div><h2>4. Airtime to Cash</h2><p>Convert your excess airtime to real cash instantly. Best rate is 85%.</p></div>
  </div>
  <div class="dots"><span class="dot on"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
  <div class="nav"><button onclick="prevSlide()">&larr; Prev</button><button class="next" id="nextBtn" onclick="nextSlide()">Next &rarr;</button></div>
  <p class="hint">Auto-scroll is on. Swipe, tap Prev / Next, or tap a dot.</p>
</div>
<div id="loginBox" style="display:none">
  <div class="card"><button onclick="backToPictures()" style="border:0;background:none;color:#2563eb;font-weight:800;cursor:pointer;padding:0">&larr; Back to Pictures</button>
  <h1 style="font-size:32px;margin:14px 0 4px">Welcome Back</h1><p style="color:#666;margin:0 0 16px">Login to your DATATECH account</p>
  <label>Phone Number</label><input id="loginPhone" placeholder="e.g. 07044102707">
  <label>Password</label><input id="loginPass" type="password" placeholder="Enter your password">
  <p style="text-align:center"><a href="#" onclick="return false">Forgot Password?</a></p>
  <button class="buy" onclick="doLogin()">Login</button>
  <p style="text-align:center">Don't have an account? <a href="#" onclick="showRegister();return false">Register Here</a></p>
  <div id="loginMsg"></div></div>
  <div class="card" id="regBox" style="display:none"><h2>Register</h2><label>Full Name</label><input id="regName" placeholder="Your name"><label>Phone Number</label><input id="regPhone" placeholder="e.g. 07044102707"><label>Password</label><input id="regPass" type="password" placeholder="Create password"><button class="buy" onclick="doRegister()">Register</button><div id="regMsg"></div></div>
</div>
`

const CUSTOMER = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DataTech - Buy Data & Airtime</title><style>
*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;background:#f4f6fb;color:#111}
.topbar{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;background:#fff}.logo{font-size:26px;font-weight:900}.logo span{color:#00c853}
#skipBtn{border:1px solid #ddd;background:#fff;border-radius:999px;padding:8px 16px;font-weight:700;cursor:pointer}
#slider{position:relative;overflow:hidden;touch-action:pan-y}
.slide{display:none;padding:18px 18px 8px;text-align:center;min-height:430px}.slide.active{display:block}
.slide .pic{font-size:110px;margin:10px 0}.s1{background:#dbeafe}.s2{background:#ffedd5}.s3{background:#dbeafe}.s4{background:#ede9fe}.s5{background:#dcfce7}
.slide h2{font-size:28px;margin:10px 0}.slide p{font-size:17px;line-height:1.5;color:#333;max-width:480px;margin:0 auto}
.dots{text-align:center;padding:10px}.dot{display:inline-block;width:9px;height:9px;border-radius:50%;background:#ccc;margin:0 3px}.dot.on{background:#2563eb}
.nav{display:flex;gap:12px;padding:0 16px 6px}.nav button{flex:1;padding:14px;border:0;border-radius:12px;font-size:17px;font-weight:800;cursor:pointer;background:#e5e7eb}.nav .next{background:#2563eb;color:#fff}
.hint{text-align:center;color:#666;font-size:13px;padding:0 0 14px}
.card{background:#fff;margin:14px;border-radius:16px;padding:18px;box-shadow:0 2px 10px rgba(0,0,0,.06)}
label{font-weight:700;font-size:14px}select,input{width:100%;padding:13px;margin:6px 0 14px;border:1px solid #ddd;border-radius:10px;font-size:16px}
.buy{width:100%;padding:15px;border:0;border-radius:12px;background:#00c853;color:#fff;font-size:18px;font-weight:900;cursor:pointer}
#msg{margin-top:12px;font-weight:700;white-space:pre-wrap}.small{color:#666;font-size:13px}
</style></head><body>
${ONBOARDING}
<div id="buyBox" style="display:none">
<div class="card"><h2 style="margin:0">DataTech - Buy Data &amp; Airtime</h2><p class="small">VTPass + Husmo • Fast delivery</p>
<label>Type</label><select id="type" onchange="loadPlans()"><option value="data">Data</option><option value="airtime">Airtime</option></select>
<label>Network</label><select id="network" onchange="loadPlans()"><option>MTN</option><option>AIRTEL</option><option>GLO</option><option>9MOBILE</option></select>
<label>Phone Number</label><input id="phone" placeholder="e.g. 07044102707">
<label id="planLabel">Plan</label><select id="plan"></select>
<label id="amtLabel" style="display:none">Amount (₦)</label><input id="amount" style="display:none" value="100" type="number">
<button class="buy" onclick="buyNow()">Buy Now</button><div id="msg"></div>
<p class="small">After payment, your Data / Airtime go deliver to the phone number above.</p>
</div></div>
<script>
let cur=0; const slides=[...document.querySelectorAll('.slide')]; const dots=[...document.querySelectorAll('.dot')];
function show(i){ cur=(i+slides.length)%slides.length; slides.forEach((s,k)=>s.classList.toggle('active',k===cur)); dots.forEach((d,k)=>d.classList.toggle('on',k===cur)); document.getElementById('nextBtn').textContent = cur===slides.length-1 ? 'Get Started \\u2192' : 'Next \\u2192'; }
function nextSlide(){ if(cur===slides.length-1){ finishOnboard(); } else show(cur+1); }
function prevSlide(){ show(cur-1); }
function skipOnboard(){ finishOnboard(); }
function finishOnboard(){ document.getElementById('onboard').style.display='none'; document.getElementById('loginBox').style.display='block'; try{localStorage.setItem('datatech_onboard','done');}catch(e){} loadPlans(); }
let auto=setInterval(()=>{ if(document.getElementById('onboard').style.display!=='none') show(cur+1); },4000);
// Swipe left / right
let sx=0; const sl=document.getElementById('slider');
sl.addEventListener('touchstart',e=>{sx=e.touches[0].clientX},{passive:true});
sl.addEventListener('touchend',e=>{ let dx=e.changedTouches[0].clientX-sx; if(dx<-40) nextSlide(); if(dx>40) prevSlide(); },{passive:true});
// If user don see onboarding before, skip am
try{ if(localStorage.getItem('datatech_onboard')==='done'){ document.getElementById('onboard').style.display='none'; document.getElementById('loginBox').style.display='block'; } }catch(e){}
const VTPASS=${JSON.stringify(VTPASS_DATA)}; const HUSMO=${JSON.stringify(HUSMO_PLANS)};
function loadPlans(){ const t=document.getElementById('type').value, n=document.getElementById('network').value, p=document.getElementById('plan');
 const amt=document.getElementById('amount'), amtL=document.getElementById('amtLabel');
 p.innerHTML='';
 if(t==='airtime'){ amt.style.display='block'; amtL.style.display='block'; p.innerHTML='<option value="airtime">Airtime - Enter amount below</option>'; }
 else { amt.style.display='none'; amtL.style.display='none';
   if(VTPASS[n]) p.innerHTML+='<option value="vtpass:'+n+'">'+VTPASS[n].name+' (VTPass) - \\u20a6'+VTPASS[n].price+'</option>';
   HUSMO.filter(x=>x.network===n).forEach(x=>{ p.innerHTML+='<option value="husmo:'+x.id+'">'+x.name+' (Husmo) - \\u20a6'+x.price+'</option>'; });
 }
}
async function buyNow(){ const msg=document.getElementById('msg'); msg.textContent='Processing...';
 const body={type:document.getElementById('type').value, network:document.getElementById('network').value, phone:document.getElementById('phone').value.trim(), plan:document.getElementById('plan').value, amount:document.getElementById('amount').value};
 const r=await fetch('/api/buy',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); const j=await r.json();
 msg.textContent=j.success ? '✅ '+j.message+'\\nRequest ID: '+(j.request_id||'')+'\\nProvider: '+(j.provider||'') : '❌ '+(j.message||'Failed'); }
function backToPictures(){ document.getElementById('loginBox').style.display='none'; document.getElementById('onboard').style.display='block'; }
function showRegister(){ document.getElementById('regBox').style.display='block'; }
function doLogin(){ const ph=document.getElementById('loginPhone').value.trim(); if(!ph){document.getElementById('loginMsg').textContent='Enter phone number';return;} document.getElementById('loginBox').style.display='none'; document.getElementById('buyBox').style.display='block'; document.getElementById('phone').value=ph; loadPlans(); }
function doRegister(){ const n=document.getElementById('regName').value.trim(), ph=document.getElementById('regPhone').value.trim(); if(!n||!ph){document.getElementById('regMsg').textContent='Enter name and phone';return;} document.getElementById('regMsg').textContent='✅ Registered! Now Login.'; document.getElementById('loginPhone').value=ph; }
loadPlans();
</script></body></html>`;

const ADMIN = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DataTech Admin</title><style>body{font-family:Arial;margin:0;background:#f4f6fb} .c{max-width:700px;margin:20px auto;background:#fff;padding:20px;border-radius:14px} button{padding:12px 16px;margin:6px;border:0;border-radius:10px;background:#111;color:#fff;font-weight:700;cursor:pointer} pre{white-space:pre-wrap;background:#f8fafc;padding:12px;border-radius:10px}</style></head><body><div class="c"><h1>DataTech Admin</h1><p>Customer: <a href="/">datatech-backend-v2.onrender.com</a></p><button onclick="call('/api/plans')">View Plans</button><button onclick="call('/api/husmo-balance')">Check Husmo Balance</button><button onclick="call('/vtpass-sandbox-test')">Test VTPass Sandbox</button><pre id="out">Press a button...</pre></div><script>async function call(u){document.getElementById('out').textContent='Loading...'; const r=await fetch(u); document.getElementById('out').textContent=await r.text();}</script></body></html>`;

app.get('/', (req,res)=>res.send(CUSTOMER));
app.get('/admin', (req,res)=>res.send(ADMIN));
app.get('/health', (req,res)=>res.json({status:'ok'}));
app.get('/api/plans', (req,res)=>res.json({vtpass_data:VTPASS_DATA, husmo:HUSMO_PLANS}));
app.get('/api/husmo-balance', async (req,res)=>{ try{ const r=await fetch(HUSMO_BASE+'/api/user/',{headers:{Authorization:'Token '+HUSMO_KEY}}); res.send(await r.text()); }catch(e){ res.json({error:String(e)}); }});
app.get('/vtpass-sandbox-test', (req,res)=>res.json({base:VTPASS_BASE, has_key:!!VTPASS_KEY, has_pub:!!VTPASS_PUB, has_sec:!!VTPASS_SEC}));
async function vtpassBuy(type, network, phone, amount){
  const request_id = String(Date.now()) + Math.random().toString(36).slice(2,8).toUpperCase();
  let payload;
  if(type==='airtime') payload={request_id, serviceID:VTPASS_AIRTIME[network], amount, phone};
  else { const p=VTPASS_DATA[network]; payload={request_id, serviceID:p.serviceID, variation_code:p.variation, amount:p.price, phone}; }
  const r=await fetch(VTPASS_BASE+'/pay',{method:'POST',headers:{'Content-Type':'application/json','api-key':VTPASS_KEY,'public-key':VTPASS_PUB,'secret-key':VTPASS_SEC},body:JSON.stringify(payload)});
  const j=await r.json().catch(()=>({}));
  return {request_id, vtpass:j, ok: j.code==='000'};
}
app.post('/api/buy', async (req,res)=>{
  const {type, network, phone, plan, amount}=req.body||{};
  if(!phone) return res.json({success:false,message:'Enter phone number'});
  // Try VTPass first
  try{
    const v=await vtpassBuy(type, network, phone, Number(amount)||100);
    if(v.ok) return res.json({success:true,message:'VTPass order successful', request_id:v.request_id, provider:'VTPass', vtpass:v.vtpass});
  }catch(e){}
  // Husmo fallback
  try{
    const r=await fetch(HUSMO_BASE+'/api/data/',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Token '+HUSMO_KEY},body:JSON.stringify({network:network==='9MOBILE'?'9MOBILE':network, phone, plan:plan||'', amount:Number(amount)||100})});
    const j=await r.json().catch(()=>({}));
    return res.json({success:true,message:'Order sent via Husmo (VTPass fallback)', request_id:String(Date.now()), provider:'Husmo', husmo:j});
  }catch(e){ return res.json({success:false,message:'Both VTPass and Husmo failed. Try again.'}); }
});
const PORT=process.env.PORT||3000;
app.listen(PORT,()=>console.log('Server running on '+PORT));
