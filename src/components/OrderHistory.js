import React, { useEffect, useState } from 'react';
import axios from 'axios';

function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:8080/orders/user', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
        .then(response => {
            const sortedOrders = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(sortedOrders);
        })
        .catch(error => {
            console.error('There was an error fetching the orders!', error);
        });
    }, []);

    const handleViewDetails = (order) => {
        axios.get(`http://localhost:8080/orders/details/${order.id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
        .then(response => {
            setSelectedOrder(response.data);
            const modal = new window.bootstrap.Modal(document.getElementById('orderDetailModal'));
            modal.show();
        })
        .catch(error => {
            console.error('There was an error fetching the order details!', error);
        });
    };

    const handleCloseModal = () => {
        setSelectedOrder(null);
        const modalElement = document.getElementById('orderDetailModal');
        const modal = window.bootstrap.Modal.getInstance(modalElement);
        modal.hide();
    };

    if (!Array.isArray(orders) || orders.length === 0) {
        return <div className="container mt-5">No orders found.</div>;
    }

    return (
        <div className="container">
            <h1 className="mb-4">Order History</h1>
            <div className='container-cart-order'>
                <div className="row">
                    {orders.map(order => (
                        <div className="col-md-6 mb-4" key={order.id}>
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title">Order ID: {order.id}</h5>
                                    <p className="card-text"><strong>Total:</strong> ${order.total.toFixed(2)}</p>
                                    <p className="card-text"><strong>Status:</strong> {order.status}</p>
                                    <p className="card-text"><strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                                    <p className="card-text"><strong>Updated At:</strong> {new Date(order.updatedAt).toLocaleString()}</p>
                                    <button className="btn btn-primary" onClick={() => handleViewDetails(order)}>View Details</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="modal fade" id="orderDetailModal" tabIndex="-1" aria-labelledby="orderDetailModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="orderDetailModalLabel">Order Details</h5>
                                <button type="button" className="btn-close" onClick={handleCloseModal} aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                {selectedOrder && (
                                    <>
                                        <h5>Order ID: {selectedOrder.id}</h5>
                                        <p><strong>Total:</strong> ${selectedOrder.total.toFixed(2)}</p>
                                        <p><strong>Status:</strong> {selectedOrder.status}</p>
                                        <p><strong>Created At:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                                        <p><strong>Updated At:</strong> {new Date(selectedOrder.updatedAt).toLocaleString()}</p>
                                        <h6 className="mt-3">Items:</h6>
                                        <ul className="list-group list-group-flush">
                                            {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                                selectedOrder.items.map(item => (
                                                    <li className="list-group-item order-item" key={item.id}>
                                                        <img src={item.product.image} alt={item.product.name} style={{ width: '90px', height: '90px' }} />
                                                        <div className="order-item-details">
                                                            <p><strong>Product:</strong> {item.product.name}</p>
                                                            <p><strong>Quantity:</strong> {item.quantity}</p>
                                                        </div>
                                                        <div className="order-item-price">
                                                            <p><strong>Price:</strong> ${item.price.toFixed(2)}</p>
                                                        </div>
                                                        <div className="order-item-total">
                                                            <p><strong>Total:</strong> ${(item.price * item.quantity).toFixed(2)}</p>
                                                        </div>
                                                    </li>
                                                ))
                                            ) : (
                                                <p>No items available.</p>
                                            )}
                                        </ul>
                                    </>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderHistory;
