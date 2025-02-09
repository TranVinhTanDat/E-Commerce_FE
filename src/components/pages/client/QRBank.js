import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../../utils/config';


function QrBank() {
    const [buttonText, setButtonText] = useState('Đã chuyển');
    const [errorMessage, setErrorMessage] = useState('');

    const handlePaymentSent = () => {
        const token = localStorage.getItem('token');
        setButtonText('Processing...');
        setErrorMessage('');

        axios.get(`${API_BASE_URL}/cart/view`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            const cartItems = response.data;
            if (cartItems.length === 0) {
                alert('Your cart is empty. Please add products to your cart before placing an order.');
                setButtonText('Failed. Try Again');
                return;
            }

            axios.post(`${API_BASE_URL}/orders/place-temporary`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(response => {
                const orderId = response.data.id;
                axios.post(`${API_BASE_URL}/payments/process`, {
                    orderId: orderId,
                    paymentMethod: 'bank'
                }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                .then(() => {
                    axios.delete(`${API_BASE_URL}/cart/clear`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }).then(() => {
                        setButtonText('Order Placed');
                        window.location.href = '/ThankYou';
                    }).catch(error => {
                        console.error('Error clearing cart:', error);
                        setButtonText('Failed. Try Again');
                    });
                })
                .catch(error => {
                    console.error('Error processing payment:', error);
                    setButtonText('Failed. Try Again');
                });
            })
            .catch(error => {
                console.error('Error placing order:', error);
                setButtonText('Failed. Try Again');
                if (error.response && error.response.data) {
                    setErrorMessage(error.response.data);
                }
            });
        })
        .catch(error => {
            console.error('Error fetching cart items:', error);
            setButtonText('Failed. Try Again');
        });
    };
    
    return (
        <div className="qr-container">
            <h1>Scan QR Code to Pay with Bank Transfer</h1>
            <img src="img/QRScb.jpg" alt="Bank QR Code" className="qr-code" style={{width:'300px', height:'300px'}} />
            <button onClick={handlePaymentSent}>{buttonText}</button>
            {errorMessage && (
                <div className="error-message">
                    <p>{errorMessage}</p>
                </div>
            )}
        </div>
    );
}

export default QrBank;
