const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
  res.json({ message: 'DataTech Backend is working' });
});
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
app.post('/api/buy', (req, res) => {
  const { type, network, phone, amount } = req.body;
  res.json({ success: true, message: 'Test order received', order: { type, network, phone, amount } });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
