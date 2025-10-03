import axios from 'axios';

const FLW_BASE = process.env.FLUTTERWAVE_BASE_URL || 'https://api.flutterwave.com/v3';
const SECRET = process.env.FLUTTERWAVE_SECRET_KEY || '';

const client = axios.create({
  baseURL: FLW_BASE,
  headers: {
    Authorization: `Bearer ${SECRET}`,
    'Content-Type': 'application/json',
  },
});

export const flutterwaveService = {
  async initializePayment(payload: {
    tx_ref: string;
    amount: number;
    currency?: string;
    redirect_url?: string;
    customer: { email: string; name?: string; phonenumber?: string };
    meta?: Record<string, any>;
    payment_options?: string;
  }) {
    const res = await client.post('/payments', {
      ...payload,
      currency: payload.currency || 'NGN',
    });
    return res.data;
  },

  async verifyTransaction(transactionId: string) {
    const res = await client.get(`/transactions/${transactionId}/verify`);
    return res.data;
  },
};

export default flutterwaveService;


