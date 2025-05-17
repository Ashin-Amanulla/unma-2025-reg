import express from 'express';
import razorpayInstance from '../utils/razorpay.js';


const router = express.Router();
import { encryptData } from '../utils/federalPayment.js';   
import { PAYMENT_GATEWAY_API_KEY, PAYMENT_GATEWAY_ENCRYPTION_KEY, PAYMENT_GATEWAY_SALT, PAYMENT_GATEWAY_BASE_URL } from '../config/config.js';




// Endpoint to create an order
router.post('/create-order', async (req, res) => {
    const { amount, currency } = req.body;

    try {
        const options = {
            amount: amount * 100, // Convert amount to smallest currency unit
            currency: currency || 'INR',
        };

        const order = await razorpayInstance.orders.create(options);
        res.status(200).json(order);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating RazorPay order');
    }
});

router.post('/verify-payment', async (req, res) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    try {
        const payment = await razorpayInstance.payments.fetch(razorpay_payment_id);
        console.log(payment);
        res.status(200).json(payment);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error verifying RazorPay payment');
    }
});

//new payment gateway


  
  router.post('/redirect-flow/create-order', async (req, res) => {
    try {
      const { amount, name, email, phone, currency } = req.body;
  
      const payload = {
        api_key: PAYMENT_GATEWAY_API_KEY,
        order_id: `UNMA_${Date.now()}`,
        amount: amount.toString(),
        currency,
        name,
        email,
        phone,
        description: "Anonymous Contribution",
        country: "IND",
        city: "Bangalore",
        zip_code: "560001",
        return_url: "https://yourdomain.com/payment/success",
        return_url_failure: "https://yourdomain.com/payment/failure",
        hash: "dummy-hash", // temporarily added, real hash to be added after encryption
      };
  
      // Replace hash later after encryption
      const hashString = `${PAYMENT_GATEWAY_SALT}|${PAYMENT_GATEWAY_API_KEY}|${payload.order_id}|${payload.amount}|${currency}`;
      const hash = crypto.createHash('sha512').update(hashString).digest('hex').toUpperCase();
      payload.hash = hash;
  
      const { encrypted_data, iv } = encryptData(payload, PAYMENT_GATEWAY_ENCRYPTION_KEY);
  
      res.json({
        pg_api_url: PAYMENT_GATEWAY_BASE_URL,
        api_key: PAYMENT_GATEWAY_API_KEY,
        encrypted_data,
        iv,
      });
    } catch (err) {
      console.error('Redirect Flow Error:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });



export default router;