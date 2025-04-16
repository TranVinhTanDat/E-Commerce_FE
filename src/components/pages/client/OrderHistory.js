import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../../utils/config';
import { Tabs, Tab } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const modalRef = useRef(null);

    useEffect(() => {
        fetchOrders(statusFilter);
    }, [statusFilter]);

    const fetchOrders = (status) => {
        let url = `${API_BASE_URL}/orders/user`;
        if (status !== "ALL") {
            url += `?status=${status}`;
        }

        axios.get(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
        .then(response => {
            const sortedOrders = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(sortedOrders);
        })
        .catch(error => {
            console.error('❌ Error fetching orders!', error);
        });
    };

    const fetchOrderDetails = (orderId) => {
        axios.get(`${API_BASE_URL}/orders/details/${orderId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
        .then(response => {
            console.log("Order Details:", response.data); // Debug
            setSelectedOrder(response.data);
            if (modalRef.current) {
                const modal = new window.bootstrap.Modal(modalRef.current);
                modal.show();
            }
        })
        .catch(error => {
            console.error('❌ Error fetching order details!', error);
        });
    };

    return (
        <div className="order-history-container">
            <h1 className="mb-4 text-center">📦 Order History</h1>

            <Tabs 
                id="order-status-tabs" 
                activeKey={statusFilter} 
                onSelect={(k) => setStatusFilter(k)} 
                className="mb-3"
            >
                <Tab eventKey="ALL" title="All Orders" />
                <Tab eventKey="PENDING" title="Pending" />
                <Tab eventKey="PROCESSING" title="Processing" />
                <Tab eventKey="SHIPPED" title="Shipped" />
                <Tab eventKey="DELIVERED" title="Delivered" />
                <Tab eventKey="CANCELED" title="Canceled" />
                <Tab eventKey="REFUNDED" title="Refunded" />
            </Tabs>

            <div className="order-list">
                <div className="row">
                    {orders.length === 0 ? (
                        <p className="text-center text-muted">No orders found for this status.</p>
                    ) : (
                        orders.map(order => (
                            <div className="col-md-6 mb-4" key={order.id}>
                                <div className="order-card p-3 shadow-sm rounded bg-white d-flex align-items-center">
                                    <div className="order-info flex-grow-1">
                                        <h5 className="fw-bold">
                                            <i className="fas fa-shopping-cart"></i> Order ID: <span className="text-dark">{order.id}</span>
                                        </h5>
                                        <p className="mb-1 text-danger fw-bold">Total: ${order.total.toFixed(2)}</p>
                                        <p className="mb-1">
                                            <strong>Status:</strong> 
                                            <span className="badge bg-warning text-dark mx-2">{order.status}</span>
                                        </p>
                                        <p className="mb-1"><strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                                        <p className="mb-1"><strong>Updated At:</strong> {new Date(order.updatedAt).toLocaleString()}</p>

                                        <button 
                                            className="btn btn-primary mt-2" 
                                            onClick={() => fetchOrderDetails(order.id)}
                                        >
                                            View Details
                                        </button>
                                    </div>

                                    <div className="order-logo ms-3">
                                        <img 
                                            src="https://webadmin.beeart.vn/upload/image/20220425/6378647833497878085203022.png" 
                                            alt="Order Logo"
                                            className="rounded-circle"
                                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="modal fade" ref={modalRef} id="orderDetailModal" tabIndex="-1" aria-labelledby="orderDetailModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">📄 Order Details</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {selectedOrder ? (
                                <>
                                    <h5>Order ID: {selectedOrder.id}</h5>
                                    <p><strong>Total:</strong> ${selectedOrder.total.toFixed(2)}</p>
                                    <p><strong>Status:</strong> {selectedOrder.status}</p>
                                    <p><strong>Created At:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                                    <p><strong>Updated At:</strong> {new Date(selectedOrder.updatedAt).toLocaleString()}</p>
                                    <p><strong>Customer:</strong> {selectedOrder.userName}</p>
                                    <p><strong>Email:</strong> {selectedOrder.userEmail}</p>

                                    <h6 className="mt-3">🛒 Items:</h6>
                                    <div className="list-group">
                                        {selectedOrder.items?.length > 0 ? (
                                            selectedOrder.items.map(item => (
                                                <div className="list-group-item d-flex align-items-center" key={item.id}>
                                                    <img 
                                                        src={item.image || '/fallback-image.jpg'} 
                                                        alt={item.productName || 'Product'} 
                                                        className="rounded"
                                                        style={{ width: '70px', height: '70px', objectFit: 'cover' }} 
                                                    />
                                                    <div style={{ flex: 1 }}>
                                                        <p className="mb-1"><strong>{item.productName || 'N/A'}</strong></p>
                                                        <p className="mb-1">Qty: {item.quantity}</p>
                                                        <p className="mb-1 text-danger fw-bold">Price: ${item.price.toFixed(2)}</p>
                                                    </div>
                                                    <p className="mb-0 fw-bold">
                                                        Total: ${(item.price * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <p>No items found.</p>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <p>Loading...</p>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderHistory;