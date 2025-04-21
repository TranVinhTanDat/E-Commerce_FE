import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../../utils/config';

function AdminOrderList() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const ordersPerPage = 5;
    const maxPageButtons = 5;
    const [showAllOrders, setShowAllOrders] = useState(false);

    useEffect(() => {
        if (showAllOrders) {
            fetchAllOrders();
        } else {
            fetchOrders(selectedDate);
        }
    }, [selectedDate, showAllOrders]);

    const fetchOrders = (date) => {
        const token = localStorage.getItem('token');
        axios.get(`${API_BASE_URL}/orders/all?date=${date}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            // Loại bỏ các đơn hàng trùng lặp dựa trên orderId
            const uniqueOrders = Array.from(
                new Map(response.data.map(order => [order.orderId, order])).values()
            );
            setOrders(uniqueOrders);
        })
        .catch(error => console.error('Error fetching orders:', error));
    };

    const fetchAllOrders = () => {
        const token = localStorage.getItem('token');
        axios.get(`${API_BASE_URL}/orders/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            // Loại bỏ các đơn hàng trùng lặp dựa trên orderId
            const uniqueOrders = Array.from(
                new Map(response.data.map(order => [order.orderId, order])).values()
            );
            setOrders(uniqueOrders);
        })
        .catch(error => console.error('Error fetching all orders:', error));
    };

    const handleUpdateOrderStatus = (orderId, newStatus) => {
        const token = localStorage.getItem('token');
        axios.post(`${API_BASE_URL}/orders/update-status/${orderId}?newStatus=${newStatus}`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(() => {
            alert(`Order status updated to ${newStatus}`);
            setOrders(orders.map(order => order.orderId === orderId ? { ...order, status: newStatus } : order));
        })
        .catch(error => {
            console.error(`Error updating order status to ${newStatus}:`, error);
            if (error.response?.status === 400) {
                alert(`Không thể cập nhật trạng thái đơn hàng: ${error.response.data}`);
            } else {
                alert('Có lỗi xảy ra. Vui lòng thử lại.');
            }
        });
    };

    const handleViewDetails = (orderId) => {
        console.log("Đang lấy chi tiết cho Order ID:", orderId);
        const token = localStorage.getItem('token');
        
        if (!token) {
            console.error("Không tìm thấy token trong localStorage. Chuyển hướng đến đăng nhập...");
            window.location.href = '/login';
            return;
        }
    
        axios.get(`${API_BASE_URL}/admin/orders/details/${orderId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            console.log("Phản hồi API:", response.data);
            if (response.data) {
                setSelectedOrder(response.data);
                setIsModalOpen(true);
            }
        })
        .catch(error => {
            console.error('Lỗi lấy chi tiết đơn hàng:', error);
            if (error.response) {
                console.error('Mã trạng thái:', error.response.status);
                console.error('Dữ liệu phản hồi:', error.response.data);
                if (error.response.status === 401 || error.response.status === 403) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                } else {
                    alert(`Lỗi: ${error.response.status} - ${error.response.data}`);
                }
            } else if (error.request) {
                console.error('Không nhận được phản hồi:', error.request);
                alert('Không thể kết nối tới server. Vui lòng kiểm tra backend.');
            } else {
                console.error('Lỗi thiết lập yêu cầu:', error.message);
                alert('Có lỗi bất ngờ xảy ra.');
            }
        });
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredOrders = orders.filter(order =>
        order.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.phone.includes(searchQuery) ||
        order.orderId.toString().includes(searchQuery)
    );

    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleCloseModal = () => {
        console.log("Closing modal, setting selectedOrder to null");
        setSelectedOrder(null);
        setIsModalOpen(false);
    };

    useEffect(() => {
        console.log("Selected Order:", selectedOrder);
    }, [selectedOrder]);

    return (
        <div className="admin-order-list-container">
            <style>
                {`
                    .order-table th {
                        color: black !important;
                        font-weight: bold;
                    }
                `}
            </style>
            <h1>Order List</h1>

            <div className="top-controls">
                <button className="btn btn-primary" onClick={() => setShowAllOrders(!showAllOrders)}>
                    {showAllOrders ? "Hiển thị hóa đơn theo ngày" : "Quản lý hóa đơn"}
                </button>

                <input type="text" placeholder="Tìm kiếm theo ID, tên, SĐT..."
                    value={searchQuery} onChange={handleSearch} className="form-control search-box"/>

                {!showAllOrders && (
                    <input type="date" value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)} className="form-control"/>
                )}
            </div>

            <div className="table-responsive">
                <table className="order-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>User Name</th>
                            <th>Address Line 1</th>
                            <th>Address Line 2</th>
                            <th>Phone</th>
                            <th>Payment Method</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentOrders.map(order => (
                            <tr key={order.orderId}>
                                <td>{order.orderId}</td>
                                <td>{order.userName}</td>
                                <td>{order.addressLine1}</td>
                                <td>{order.addressLine2}</td>
                                <td>{order.phone}</td>
                                <td>{order.paymentMethod}</td>
                                <td>{order.status}</td>
                                <td>
                                    <div>
                                        {order.status === 'PENDING' && (
                                            <>
                                                <button className="btn btn-success me-2" onClick={() => handleUpdateOrderStatus(order.orderId, 'PROCESSING')}>
                                                    Xác nhận
                                                </button>
                                                <button className="btn btn-danger me-2" onClick={() => handleUpdateOrderStatus(order.orderId, 'CANCELED')}>
                                                    Từ chối
                                                </button>
                                            </>
                                        )}

                                        {order.status === 'PROCESSING' && (
                                            <button className="btn btn-warning me-2" onClick={() => handleUpdateOrderStatus(order.orderId, 'SHIPPED')}>
                                                Chuyển sang Shipped
                                            </button>
                                        )}

                                        {order.status === 'SHIPPED' && (
                                            <button className="btn btn-primary me-2" onClick={() => handleUpdateOrderStatus(order.orderId, 'DELIVERED')}>
                                                Xác nhận Đã giao hàng
                                            </button>
                                        )}

                                        {order.status === 'DELIVERED' && (
                                            <button className="btn btn-info me-2" onClick={() => handleUpdateOrderStatus(order.orderId, 'REFUNDED')}>
                                                Hoàn tiền
                                            </button>
                                        )}

                                        <button className="btn btn-secondary" onClick={() => handleViewDetails(order.orderId)}>
                                            Chi tiết
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h5 className="modal-title">Order Details</h5>
                            <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                        </div>
                        <div className="modal-body">
                            {selectedOrder && (
                                <>
                                    <p><strong>Order ID:</strong> {selectedOrder.id}</p>
                                    <p><strong>Status:</strong> {selectedOrder.status}</p>
                                    <p><strong>Created At:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                                    <p><strong>Updated At:</strong> {new Date(selectedOrder.updatedAt).toLocaleString()}</p>

                                    <h6 className="mt-3">Items:</h6>
                                    <div className="order-items-container">
                                        {selectedOrder.items?.length > 0 ? (
                                            selectedOrder.items.map(item => (
                                                <div className="order-item" key={item.id}>
                                                    <img src={item.image} alt={item.productName} className="order-item-image" />
                                                    <div className="order-item-info">
                                                        <p><strong>Product:</strong> {item.productName}</p>
                                                        <p><strong>Quantity:</strong> {item.quantity}</p>
                                                        <p><strong>Price:</strong> ${item.price?.toFixed(2) ?? "N/A"}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p>No items available.</p>
                                        )}
                                    </div>

                                    <div className="order-total">
                                        <h5>Total: ${selectedOrder.total?.toFixed(2) ?? "N/A"}</h5>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="pagination">
                {currentPage > 1 && (
                    <button onClick={() => paginate(currentPage - 1)} className="page-btn">Prev</button>
                )}

                {Array.from({ length: Math.min(maxPageButtons, totalPages) }, (_, i) => {
                    const page = Math.max(1, currentPage - Math.floor(maxPageButtons / 2)) + i;
                    if (page > totalPages) return null;
                    return (
                        <button key={page} onClick={() => paginate(page)}
                            className={`page-btn ${currentPage === page ? "active" : ""}`}>
                            {page}
                        </button>
                    );
                })}

                {currentPage < totalPages && (
                    <button onClick={() => paginate(currentPage + 1)} className="page-btn">Next</button>
                )}
            </div>
        </div>
    );
}

export default AdminOrderList;