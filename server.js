const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const midtransClient = require('midtrans-client');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (frontend)
app.use(express.static(path.join(__dirname)));

// Midtrans Snap instance
const snap = new midtransClient.Snap({
  isProduction: true,
  serverKey: 'Mid-server-NJBsaX73lw3Z06xiApWnAvsA'
});

// API endpoint buat bikin transaksi
app.post('/createTransaction', async (req, res) => {
  try {
    const { orderId, grossAmount, customerDetails, itemDetails } = req.body;

    // Validasi input
    if (!orderId || !grossAmount) {
      return res.status(400).json({ error: 'orderId dan grossAmount wajib diisi' });
    }

    const parameter = {
      transaction_details: {
        order_id: orderId, // harus unik tiap transaksi
        gross_amount: grossAmount
      },
      customer_details: customerDetails || {
        first_name: "Budi",
        email: "budi@example.com",
        phone: "08123456789"
      },
      item_details: itemDetails || [
        {
          id: "item1",
          price: grossAmount,
          quantity: 1,
          name: "Default Item"
        }
      ],
      credit_card: {
        secure: true
      }
    };

    const transaction = await snap.createTransaction(parameter);
    res.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url
    });
  } catch (error) {
    console.error('Midtrans transaction error:', error.ApiResponse || error.message);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
