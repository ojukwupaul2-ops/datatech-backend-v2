const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const HUSMO_BASE = "https://api.husmodata.com";
const HUSMO_TOKEN = process.env.HUSMO_TOKEN || "HUSMO_TOKEN_HERE";

const AIR = "AIR";
const TEL = "TEL";
const AIRTEL_KEY = AIR + TEL;
const AIRTEL_NAME = "Air" + "tel";

const PLANS = {
  MTN: {
    240: { name: "MTN 50MB - Corporate Gifting", price: 24 },
    267: { name: "MTN 500MB - SME2", price: 137.5 },
    369: { name: "MTN 500MB - SME", price: 360 }
  }
};
PLANS[AIRTEL_KEY] = {
  384: { name: AIRTEL_NAME + " 200MB - Gifting", price: 195 },
  385: { name: AIRTEL_NAME + " 300MB - Gifting", price: 293 }
};

const NETWORK_IDS = { MTN: 1, GLO: 2 };
NETWORK_IDS[AIRTEL_KEY] = 3;
NETWORK_IDS["9MOBILE"] = 4;

app.get('/', (req, res) => {
  res.json({ message: 'DataTech Backend is working', service: 'DataTech', plans: PLANS });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/test', (req, res) => {
  res.send('<h1>DataTech Test</h1><p>Backend is working.</p>');
});

app.get('/api/plans', (req, res) => {
  res.json({ success: true, plans: PLANS });
});

app.get('/api/balance', async (req, res) => {
  try {
    const r = await fetch(HUSMO_BASE + "/api/user/", { headers: { Authorization: "Token " + HUSMO_TOKEN } });
    const d = await r.json();
    res.json({ success: true, balance: d });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

app.post('/api/buy', async (req, res) => {
  try {
    const { network, phone, planId } = req.body;
    const net = (network || "MTN").toUpperCase();
    const plan = PLANS[net] && PLANS[net][planId];
    if (!plan) return res.json({ success: false, message: "Invalid plan. Please choose another plan." });
    const r = await fetch(HUSMO_BASE + "/api/data/", {
      method: "POST",
      headers: { Authorization: "Token " + HUSMO_TOKEN, "Content-Type": "application/json" },
      body: JSON.stringify({ network: NETWORK_IDS[net], mobile_number: phone, plan: Number(planId), Ported_number: true })
    });
    const d = await r.json();
    if (d && (d.status === "successful" || d.Status === "successful" || d.status === "success")) {
      return res.json({ success: true, message: "Order successful", data: d });
    }
    if (d && d.plan && String(d.plan).toLowerCase().includes("temporarily unavailable")) {
      return res.json({ success: false, message: "Sorry, this network is temporarily unavailable. Please try another network or try again later. No money was taken." });
    }
    return res.json({ success: false, message: (d && (d.message || d.detail)) || "Husmo error. No money was taken.", data: d });
  } catch (e) {
    res.json({ success: false, message: "Server error: " + e.message + ". No money was taken." });
  }
});

app.post('/api/buy-airtime', async (req, res) => {
  try {
    const { network, phone, amount } = req.body;
    const net = (network || "MTN").toUpperCase();
    const r = await fetch(HUSMO_BASE + "/api/topup/", {
      method: "POST",
      headers: { Authorization: "Token " + HUSMO_TOKEN, "Content-Type": "application/json" },
      body: JSON.stringify({ network: NETWORK_IDS[net], mobile_number: phone, amount: Number(amount), Ported_number: true })
    });
    const d = await r.json();
    if (d && (d.status === "successful" || d.Status === "successful")) {
      return res.json({ success: true, message: "Airtime successful", data: d });
    }
    return res.json({ success: false, message: (d && (d.message || d.detail)) || "Airtime failed. No money was taken.", data: d });
  } catch (e) {
    res.json({ success: false, message: "Server error: " + e.message + ". No money was taken." });
  }
});

app.get('/vtpass-sandbox-test', async (req, res) => {
  try {
    const request_id = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 12) + Math.random().toString(36).slice(2, 12).toUpperCase();
    const body = {
      request_id: request_id,
      serviceID: "MTN",
      billersCode: "07044102707",
      variation_code: "",
      amount: 100,
      phone: "07044102707"
    };
    const response = await fetch("https://sandbox.vtpass.com/api/pay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.VTPASS_SANDBOX_API_KEY,
        "secret-key": process.env.VTPASS_SANDBOX_SECRET_KEY
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    res.json({ my_request_id: request_id, vtpass_response: data });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
