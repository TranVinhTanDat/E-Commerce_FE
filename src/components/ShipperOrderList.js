import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ShipperOrderList() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchOrders(selectedDate);
    }, [selectedDate]);

    const fetchOrders = (date) => {
        const token = localStorage.getItem('token');

        axios.get(`http://localhost:8080/orders/all-shipper?date=${date}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            console.log('Orders fetched:', response.data);
            setOrders(response.data);
        })
        .catch(error => {
            console.error('Error fetching orders:', error);
        });
    };

    const handleMarkAsProcessing = (orderId) => {
        const token = localStorage.getItem('token');
        if (!orderId) {
            console.error('Order ID is undefined');
            return;
        }

        axios.post(`http://localhost:8080/orders/mark-as-processing/${orderId}`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            console.log('Response from mark as processing:', response);
            alert('Order marked as Processing');
            setOrders(orders.map(order =>
                order.orderId === orderId ? { ...order, status: 'Processing' } : order
            ));
        })
        .catch(error => {
            console.error('Error marking order as processing:', error);
        });
    };

    const handleViewDetails = (orderId) => {
        const token = localStorage.getItem('token');
        axios.get(`http://localhost:8080/orders/details/${orderId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
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

    return (
        <div className="order-shipper-list-container container" style={{marginTop:'100px'}}>
            <h1>Order List</h1>
            <div className="mb-4">
                <label>Select Date: </label>
                <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)} 
                    className="form-control"
                />
            </div>
            <table className="table table-striped order-table">
                <thead className="thead-dark">
                    <tr>
                        <th>Order ID</th>
                        <th>User Name</th>
                        <th>Address Line 1</th>
                        <th>Address Line 2</th>
                        <th>Phone</th>
                        <th>Total</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <React.Fragment key={order.orderId}>
                            <tr>
                                <td>{order.orderId}</td>
                                <td>{order.userName}</td>
                                <td>{order.addressLine1}</td>
                                <td>{order.addressLine2}</td>
                                <td>{order.phone}</td>
                                <td>${order.total.toFixed(2)}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn btn-success me-2" onClick={() => handleMarkAsProcessing(order.orderId)}>Đã giao hàng</button>
                                        <button className="btn btn-primary" onClick={() => handleViewDetails(order.orderId)}>Detail</button>
                                    </div>
                                </td>
                            </tr>
                        </React.Fragment>
                    ))}
                </tbody>
            </table>

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
                                    <h5>Order ID: {selectedOrder.orderId}</h5>
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
    );
}

export default ShipperOrderList;
