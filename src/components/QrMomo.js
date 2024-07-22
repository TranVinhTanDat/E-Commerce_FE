import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function QrMomo() {
    const location = useLocation();
    const [isVerified, setIsVerified] = useState(false);
    const [buttonText, setButtonText] = useState('Đã chuyển');
    const navigate = useNavigate();

    const handlePaymentSent = () => {
        const token = localStorage.getItem('token');
        setButtonText('Processing...');

        axios.get('http://localhost:8080/cart/view', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            const cartItems = response.data;
            if (cartItems.length === 0) {
                alert('Your cart is empty. Please add products to your cart before placing an order.');
                setButtonText('Failed. Try Again');
                return;
            }

            axios.post('http://localhost:8080/orders/place-temporary', {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(response => {
                const orderId = response.data.id;
                axios.post('http://localhost:8080/payments/process', {
                    orderId: orderId,
                    paymentMethod: 'momo'
                }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                .then(() => {
                    axios.delete('http://localhost:8080/cart/clear', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }).then(() => {
                        setButtonText('Order Placed');
                        window.location.href = '/';
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
            });
        })
        .catch(error => {
            console.error('Error fetching cart items:', error);
            setButtonText('Failed. Try Again');
        });
    };

    return (
        <div className="qr-container">
            <h1>Scan QR Code to Pay with MoMo</h1>
            <img src="img/QRMomo.jpg" alt="MoMo QR Code" className="qr-code" />
            <button onClick={handlePaymentSent}>{buttonText}</button>
            {isVerified && (
                <div>
                    <p>Payment Verified! Order is now Pending.</p>
                </div>
            )}
        </div>
    );
}

export default QrMomo;
