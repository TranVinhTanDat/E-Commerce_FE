// OrderPlaced.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import OrderDetailDialog from './OrderDetailDialog'; // Một component để hiển thị chi tiết đơn hàng

function OrderPlaced() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDialog, setShowDialog] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');

        axios.get('http://localhost:8080/orders', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            setOrders(response.data);
        })
        .catch(error => {
            console.error('Error fetching orders:', error);
        });
    }, []);

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setShowDialog(true);
    };

    const handleCloseDialog = () => {
        setShowDialog(false);
        setSelectedOrder(null);
    };

    return (
        <div>
            <h1 style={{width:'1000px', height:'1000px', color:'black'}}>Your Orders</h1>
            <ul>
                {orders.map(order => (
                    <li key={order.id}>
                        <span>Order #{order.id}</span>
                        <button onClick={() => handleViewDetails(order)}>View Details</button>
                    </li>
                ))}
            </ul>
            {showDialog && <OrderDetailDialog order={selectedOrder} onClose={handleCloseDialog} />}
        </div>
    );
}

export default OrderPlaced;
