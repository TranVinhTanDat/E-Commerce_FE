import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../../utils/config';

function ShipperOrderList() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchOrders(selectedDate);
    }, [selectedDate]);

    const fetchOrders = (date) => {
        const token = localStorage.getItem('token');

        axios.get(`${API_BASE_URL}/orders/all-shipper?date=${date}`, {
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

    // Chuyển trạng thái từ Processing -> Shipped
    const handleMarkAsShipped = (orderId) => {
        const token = localStorage.getItem('token');

        axios.post(`${API_BASE_URL}/orders/mark-as-shipped/${orderId}`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => {
                alert('Order marked as SHIPPED');
                setOrders(orders.map(order =>
                    order.orderId === orderId ? { ...order, status: 'SHIPPED' } : order
                ));
            })
            .catch(error => {
                console.error('Error marking order as shipped:', error);
            });
    };

    // Chuyển trạng thái từ Shipped -> Delivered
    const handleMarkAsDelivered = (orderId) => {
        const token = localStorage.getItem('token');

        axios.post(`${API_BASE_URL}/orders/mark-as-delivered/${orderId}`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => {
                alert('Order marked as DELIVERED');
                setOrders(orders.map(order =>
                    order.orderId === orderId ? { ...order, status: 'DELIVERED' } : order
                ));
            })
            .catch(error => {
                console.error('Error marking order as delivered:', error);
            });
    };

    const handleViewDetails = (orderId) => {
        const token = localStorage.getItem('token');
        axios.get(`${API_BASE_URL}/orders/details/${orderId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => {
                setSelectedOrder(response.data);
                const modal = new window.bootstrap.Modal(document.getElementById('orderDetailModal'));
                modal.show();
            })
            .catch(error => {
                console.error('Error fetching order details:', error);
            });
    };

    const handleCloseModal = () => {
        setSelectedOrder(null);
        const modalElement = document.getElementById('orderDetailModal');
        const modal = window.bootstrap.Modal.getInstance(modalElement);
        modal.hide();
    };

    return (
        <div className="order-shipper-list-container container" style={{ marginTop: '100px' }}>
            <h1>Shipper Order List</h1>
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
                        <th>Status</th>
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
                                <td>{order.status}</td>
                                <td>
                                    <div className="action-buttons">
                                        {/* Nếu đơn hàng đang Processing, hiện nút 'Đang giao hàng' */}
                                        {order.status === 'PROCESSING' && (
                                            <button className="btn btn-warning me-2" onClick={() => handleMarkAsShipped(order.orderId)}>Đang giao hàng</button>
                                        )}

                                        {/* Nếu đơn hàng đang Shipped, hiện nút 'Xác nhận đã giao hàng' */}
                                        {order.status === 'SHIPPED' && (
                                            <button className="btn btn-success me-2" onClick={() => handleMarkAsDelivered(order.orderId)}>Đã giao hàng</button>
                                        )}

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
                                                    <img
                                                        src={item.image || 'path/to/fallback-image.jpg'} // Sử dụng item.image và cung cấp ảnh dự phòng
                                                        alt={item.productName}
                                                        style={{ width: '90px', height: '90px' }}
                                                    />
                                                    <div className="order-item-details">
                                                        <p><strong>Product:</strong> {item.productName}</p>
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
                                            <p>Không có sản phẩm nào.</p>
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
