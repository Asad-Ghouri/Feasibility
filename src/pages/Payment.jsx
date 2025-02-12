import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import '../assets/css/payment.css';

const stripePromise = loadStripe('pk_test_51Oo1OvCHBkwAjDwQDCp4EwRTAnDlzvXl7obKllBYH7VsBfNaEM6k5PkRhlk0AFw8d9yhJFWhY7izcIMrDDNTij2T00iJAdjzhQ');

const PaymentForm = () => {
    const [amount, setAmount] = useState('');
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);
        setError(null);

        try {
            // Get token from localStorage
            const token = localStorage.getItem('token');

            // Create Payment Intent
            const response = await fetch('http://localhost:5000/api/payments/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount: Number(amount) * 100 }) // Convert to cents
            });

            const { clientSecret, paymentIntentId } = await response.json();

            // Confirm Card Payment
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: 'Anonymous User'
                    }
                }
            });

            if (result.error) {
                setError(result.error.message);
                setProcessing(false);
            } else {
                // Payment successful, confirm with backend
                const confirmResponse = await fetch('http://localhost:5000/api/payments/confirm-payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ paymentIntentId: result.paymentIntent.id })
                });

                const confirmData = await confirmResponse.json();

                if (confirmData.success) {
                    setSuccess(true);
                    setProcessing(false);
                } else {
                    setError('Payment confirmation failed');
                    setProcessing(false);
                }
            }
        } catch (err) {
            setError(err.message);
            setProcessing(false);
        }
    };

    return (
        <div className="payment-container">
            <form onSubmit={handleSubmit} className="payment-form">
                <h2>Payment Details</h2>
                
                <div className="form-group">
                    <label>Amount (USD)</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                        min="0.50"
                        step="0.01"
                        required
                        disabled={processing}
                    />
                </div>

                <div className="form-group">
                    <label>Card Details</label>
                    <CardElement 
                        options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#424770',
                                    '::placeholder': {
                                        color: '#aab7c4',
                                    },
                                },
                                invalid: {
                                    color: '#9e2146',
                                },
                            },
                        }}
                    />
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">Payment Successful!</div>}

                <button 
                    type="submit" 
                    disabled={!stripe || processing || success}
                    className="submit-button"
                >
                    {processing ? 'Processing...' : 'Pay Now'}
                </button>
            </form>
        </div>
    );
};

const Payment = () => {
    return (
        <Elements stripe={stripePromise}>
            <PaymentForm />
        </Elements>
    );
};

export default Payment;
