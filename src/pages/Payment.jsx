import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import '../assets/css/payment.css';

const stripePromise = loadStripe('pk_test_51ODucNSBUBnZdF2vvqkzN3NNnk6fVKEwo9wMv2Sf0MBzJh3Pyq962aLfPM1AG0xVP7RyooZ4V7cIvD7XY2GZXuiO00gm3QoSIW');

const Payment = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [formData, setFormData] = useState({
        amount: '',
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: ''
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: elements.getElement(CardElement),
                billing_details: {
                    name: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    address: {
                        line1: formData.address,
                        city: formData.city,
                        state: formData.state,
                        postal_code: formData.zipCode
                    }
                }
            });

            if (stripeError) {
                setError(stripeError.message);
                return;
            }

            // Here you would send the paymentMethod.id to your server
            console.log('Payment successful:', paymentMethod);
            
        } catch (err) {
            setError('An unexpected error occurred.');
            console.error('Payment error:', err);
        } finally {
            setIsProcessing(false);
        }
    };

    const cardElementOptions = {
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
    };

    return (
        <div className="container">
            <div className="content-section">
                <div className="section-header">
                    <h2 className="section-title">Payment Details</h2>
                </div>

                <form className="payment-form" onSubmit={handleSubmit}>
                    <div className="amount-section">
                        <label>Amount (USD)</label>
                        <input
                            type="number"
                            name="amount"
                            placeholder="Enter amount"
                            value={formData.amount}
                            onChange={handleInputChange}
                            min="1"
                            step="0.01"
                            required
                        />
                    </div>

                    <div className="billing-details">
                        <h3 className="billing-title">Billing Information</h3>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="John Doe"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="+1 (555) 000-0000"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    placeholder="123 Main St"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>City</label>
                                <input
                                    type="text"
                                    name="city"
                                    placeholder="New York"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>State</label>
                                <input
                                    type="text"
                                    name="state"
                                    placeholder="NY"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>ZIP Code</label>
                                <input
                                    type="text"
                                    name="zipCode"
                                    placeholder="10001"
                                    value={formData.zipCode}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card-details">
                        <h3 className="billing-title">Card Details</h3>
                        <div className="form-group">
                            <CardElement options={cardElementOptions} />
                        </div>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="submit-button"
                        disabled={!stripe || isProcessing}
                    >
                        {isProcessing ? 'Processing...' : 'Pay Now'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const App = () => {
    return (
        <Elements stripe={stripePromise}>
            <Payment />
        </Elements>
    );
};

export default App;
