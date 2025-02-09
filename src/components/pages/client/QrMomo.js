import React, { useState } from 'react';
import API_BASE_URL from '../../../utils/config';

import axios from 'axios';

function QrMomo() {
    const [buttonText, setButtonText] = useState('Đã chuyển');
    const [isVerified, setIsVerified] = useState(false); // Khai báo isVerified

    const handlePaymentSent = () => {
        const token = localStorage.getItem('token');
        setButtonText('Processing...');

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
                    paymentMethod: 'momo'
                }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                .then(() => {
                    axios.delete(`${API_BASE_URL}/cart/clear`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }).then(() => {
                        setButtonText('Order Placed');
                        setIsVerified(true); // Cập nhật isVerified khi thanh toán thành công
                        window.location.href = '/ThankYou'; // Điều hướng đến trang cảm ơn
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
