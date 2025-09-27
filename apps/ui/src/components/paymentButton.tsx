/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState } from 'react';
import axios from 'axios';

const PaymentButton = ({ amount }: { amount: number }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      
      const { data } = await axios.post('http://localhost:5000/api/razorpay/create-transaction', { amount });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_TEST_KEY_ID, 
        amount: data.amount,
        currency: data.currency,
        name: 'Your Company',
        description: 'Test Transaction',
        order_id: data.id,
        handler: async function (response: any) {
         
          await axios.post('http://localhost:5000/api/razorpay/verify-payment', response);
          alert('Payment Successful!');
        },
        prefill: {
          name: 'John Doe',
          email: 'john@example.com',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  return <button onClick={handlePayment} disabled={loading}>{loading ? 'Processing...' : 'Pay Now'}</button>;
};

export default PaymentButton;
