import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import API_BASE_URL from '../../../utils/config';


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import API_BASE_URL from '../../../utils/config';


function OrderDetails() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/orders/details/${orderId}`);
                setOrder(response.data);
            } catch (error) {
                console.error('Error fetching order details:', error);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    const handleMarkAsProcessing = () => {
        axios.post(`${API_BASE_URL}/orders/mark-as-processing/${orderId}`)
            .then(() => {
                setOrder(prevOrder => ({ ...prevOrder, status: 'Processing' }));
            })
            .catch(error => {
                console.error('Error marking order as processing:', error);
            });
    };

    if (!order) {
        return <div>Loading...</div>;
    }


    return (
        <div className="order-details-container">
            <h1>Order Details</h1>
            <div className="order-info">
                <p><strong>Order ID:</strong> {order.id}</p>
                <p><strong>Status:</strong> {order.status}</p>
                <p><strong>Total Amount:</strong> ${order.total.toFixed(2)}</p>
            </div>
            <div className="address-info">
                <h2>Shipping Address</h2>
                <p>{order.user.addressLine1}</p>
                <p>{order.user.addressLine2}</p>
                <p>{order.user.city}, {order.user.state}, {order.user.postalCode}</p>
                <p>{order.user.country}</p>
            </div>
            <div className="items-info">
                <h2>Items</h2>
                {order.items.map(item => (
                    <div key={item.id} className="item">
                        <img src={item.product.image} alt={item.product.name} />
                        <p>{item.product.name}</p>
                        <p>Quantity: {item.quantity}</p>
                        <p>Price: ${item.price.toFixed(2)}</p>
                    </div>
                ))}
            </div>
            {order.status === 'Pending' && (
                <button onClick={handleMarkAsProcessing}>Mark as Processing</button>
            )}
        </div>
    );
}

export default OrderDetails;
