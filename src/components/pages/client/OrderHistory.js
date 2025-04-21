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
    const [errorMessage, setErrorMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const modalRef = useRef(null);

    useEffect(() => {
        fetchOrders(statusFilter);
    }, [statusFilter]);

    const fetchOrders = (status) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setErrorMessage('Vui lòng đăng nhập để xem lịch sử đơn hàng.');
            return;
        }

        setIsLoading(true);
        let url = `${API_BASE_URL}/orders/user`;
        if (status !== "ALL") {
            url += `?status=${status}`;
        }

        axios.get(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            const sortedOrders = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(sortedOrders);
            setErrorMessage(null);
        })
        .catch(error => {
            console.error('❌ Error fetching orders!', error);
            if (error.response?.status === 401) {
                setErrorMessage('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                localStorage.removeItem('token');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                setErrorMessage(error.response?.data || 'Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
            }
        })
        .finally(() => {
            setIsLoading(false);
        });
    };

    const fetchOrderDetails = (orderId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setErrorMessage('Vui lòng đăng nhập để xem chi tiết đơn hàng.');
            return;
        }

        if (!orderId) {
            setErrorMessage('Order ID không hợp lệ.');
            return;
        }

        console.log('Fetching details for Order ID:', orderId);

        setIsLoading(true);
        axios.get(`${API_BASE_URL}/orders/details/${orderId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            console.log("Order Details:", response.data);
            setSelectedOrder(response.data);
            setErrorMessage(null);
            if (modalRef.current) {
                const modal = new window.bootstrap.Modal(modalRef.current);
                modal.show();
            }
        })
        .catch(error => {
            console.error('❌ Error fetching order details!', error);
            if (error.response?.status === 404) {
                setErrorMessage('Không tìm thấy chi tiết đơn hàng. Đang làm mới danh sách đơn hàng...');
                fetchOrders(statusFilter);
            } else if (error.response?.status === 401) {
                setErrorMessage('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                localStorage.removeItem('token');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                setErrorMessage(error.response?.data || 'Có lỗi xảy ra khi tải chi tiết đơn hàng.');
            }
        })
        .finally(() => {
            setIsLoading(false);
        });
    };

    return (
        <div className="order-history-container container my-5">
            <h1 className="mb-4 text-center" style={{marginTop:'50px'}}>📦 Lịch Sử Đơn Hàng</h1>

            {errorMessage && (
                <div className="alert alert-danger text-center" role="alert">
                    {errorMessage}
                </div>
            )}

            {isLoading ? (
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p>Đang tải đơn hàng...</p>
                </div>
            ) : (
                <>
                    <Tabs
                        id="order-status-tabs"
                        activeKey={statusFilter}
                        onSelect={(k) => setStatusFilter(k)}
                        className="mb-4 justify-content-center"
                        variant="pills"
                    >
                        <Tab eventKey="ALL" title="Tất Cả" />
                        <Tab eventKey="PENDING" title="Chờ Xử Lý" />
                        <Tab eventKey="PROCESSING" title="Đang Xử Lý" />
                        <Tab eventKey="SHIPPED" title="Đã Gửi Hàng" />
                        <Tab eventKey="DELIVERED" title="Đã Giao Hàng" />
                        <Tab eventKey="CANCELED" title="Đã Hủy" />
                        <Tab eventKey="REFUNDED" title="Đã Hoàn Tiền" />
                    </Tabs>

                    <div className="order-list">
                        <div className="row">
                            {orders.length === 0 ? (
                                <p className="text-center text-muted">Không tìm thấy đơn hàng nào với trạng thái này.</p>
                            ) : (
                                orders.map(order => (
                                    <div className="col-md-6 col-lg-4 mb-4" key={order.orderId}>
                                        <div className="order-card p-4 shadow-sm rounded bg-white d-flex align-items-center">
                                            <div className="order-info flex-grow-1">
                                                <h5 className="fw-bold">
                                                    <i className="fas fa-shopping-cart me-2"></i> Mã Đơn Hàng: <span className="text-dark">{order.orderId}</span>
                                                </h5>
                                                <p className="mb-1 text-danger fw-bold">Tổng: ${order.total.toFixed(2)}</p>
                                                <p className="mb-1">
                                                    <strong>Trạng Thái:</strong>
                                                    <span className={`badge mx-2 ${order.status === 'DELIVERED' ? 'bg-success' : order.status === 'CANCELED' || order.status === 'REFUNDED' ? 'bg-danger' : 'bg-warning'} text-dark`}>
                                                        {order.status}
                                                    </span>
                                                </p>
                                                {/* <p className="mb-1"><strong>Ngày Tạo:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</p>
                                                <p className="mb-1"><strong>Ngày Cập Nhật:</strong> {order.updatedAt ? new Date(order.updatedAt).toLocaleString() : 'N/A'}</p> */}
                                                <button
                                                    className="btn btn-primary mt-2"
                                                    onClick={() => fetchOrderDetails(order.orderId)}
                                                >
                                                    Xem Chi Tiết
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
                </>
            )}

            <div className="modal fade" ref={modalRef} id="orderDetailModal" tabIndex="-1" aria-labelledby="orderDetailModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="orderDetailModalLabel">📄 Chi Tiết Đơn Hàng</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {selectedOrder ? (
                                <>
                                    <h5>Mã Đơn Hàng: {selectedOrder.id}</h5>
                                    <p><strong>Tổng:</strong> ${selectedOrder.total.toFixed(2)}</p>
                                    <p><strong>Trạng Thái:</strong> {selectedOrder.status}</p>
                                    <p><strong>Ngày Tạo:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                                    <p><strong>Ngày Cập Nhật:</strong> {new Date(selectedOrder.updatedAt).toLocaleString()}</p>
                                    <p><strong>Khách Hàng:</strong> {selectedOrder.userName}</p>
                                    <p><strong>Email:</strong> {selectedOrder.userEmail}</p>
                                    {/* <p><strong>Địa Chỉ Giao Hàng:</strong> {selectedOrder.addressLine1}, {selectedOrder.addressLine2 || ''}</p>
                                    <p><strong>Số Điện Thoại:</strong> {selectedOrder.phone || 'N/A'}</p> */}

                                    <h6 className="mt-3">🛒 Danh Sách Sản Phẩm:</h6>
                                    <div className="list-group">
                                        {selectedOrder.items?.length > 0 ? (
                                            selectedOrder.items.map(item => (
                                                <div className="list-group-item d-flex align-items-center mb-2" key={item.id}>
                                                    <img
                                                        src={item.image || '/fallback-image.jpg'}
                                                        alt={item.productName || 'Product'}
                                                        className="rounded me-3"
                                                        style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                                                    />
                                                    <div style={{ flex: 1 }}>
                                                        <p className="mb-1"><strong>{item.productName || 'N/A'}</strong></p>
                                                        <p className="mb-1">Số Lượng: {item.quantity}</p>
                                                        <p className="mb-1 text-danger fw-bold">Giá: ${item.price.toFixed(2)}</p>
                                                    </div>
                                                    <p className="mb-0 fw-bold">
                                                        Tổng: ${(item.price * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <p>Không tìm thấy sản phẩm nào.</p>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <p>Đang tải...</p>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderHistory;    