const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const axios = require('axios');

const app = express();
const port = 3000;

const RAZORPAY_WEBHOOK_SECRET = 'helloworld';
const ESP32_URL = 'http://ESP32_IP_ADDRESS/success';

app.use(bodyParser.json());

app.post('/razorpay-webhook', async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const body = JSON.stringify(req.body);
  const expectedSignature = crypto.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(400).send('Invalid signature');
  }

  if (req.body.event === 'payment_link.paid') {
    console.log('Payment successful! Notifying ESP32...');

    try {
      await axios.get(ESP32_URL);
      console.log('ESP32 notified.');
    } catch (err) {
      console.error('Failed to notify ESP32:', err.message);
    }
  }

  res.status(200).send('Webhook handled');
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
