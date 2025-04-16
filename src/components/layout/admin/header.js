import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../../utils/config';

const HeaderAdmin = () => {
    const [user, setUser] = useState({});
    const [showUserDropdown, setShowUserDropdown] = useState(false); // Dropdown cho avatar
    const [showNotificationDropdown, setShowNotificationDropdown] = useState(false); // Dropdown cho thông báo
    const [newOrdersCount, setNewOrdersCount] = useState(0); // Số đơn hàng mới
    const [newOrders, setNewOrders] = useState([]); // Danh sách đơn hàng mới
    const [viewedNotifications, setViewedNotifications] = useState(
        localStorage.getItem('viewedNotifications') === 'true' // Khôi phục trạng thái từ localStorage
    ); // Trạng thái đã xem thông báo
    const navigate = useNavigate();
    const userDropdownRef = useRef(null);
    const notificationDropdownRef = useRef(null);

    // Lấy thông tin user
    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get(`${API_BASE_URL}/auth/user`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            setUser(response.data);
        })
        .catch(error => {
            console.error('Error fetching user:', error);
        });
    }, []);

    // Lấy số lượng và danh sách đơn hàng mới trong ngày
    useEffect(() => {
        const fetchNewOrdersData = async () => {
            try {
                const token = localStorage.getItem('token');
                // Lấy số lượng đơn hàng mới
                const countResponse = await axios.get(`${API_BASE_URL}/orders/new-count`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const newCount = countResponse.data;
                setNewOrdersCount(newCount);

                // Nếu có đơn hàng mới và chưa xem, reset trạng thái viewedNotifications
                if (newCount > 0 && !viewedNotifications) {
                    setViewedNotifications(false);
                    localStorage.setItem('viewedNotifications', 'false');
                }

                // Lấy danh sách đơn hàng mới
                const ordersResponse = await axios.get(`${API_BASE_URL}/orders/new`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setNewOrders(ordersResponse.data);
            } catch (error) {
                console.error('Error fetching new orders data:', error);
            }
        };

        fetchNewOrdersData();
        const interval = setInterval(fetchNewOrdersData, 300000);
        return () => clearInterval(interval);
    }, [viewedNotifications]); // Thêm viewedNotifications vào dependency để kiểm tra lại khi cần

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('viewedNotifications'); // Xóa trạng thái khi logout
        navigate('/');
    };

    // Khi bấm vào biểu tượng thông báo
    const handleNotificationClick = (e) => {
        e.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài
        setShowNotificationDropdown(!showNotificationDropdown);
        setViewedNotifications(true); // Đánh dấu đã xem, ẩn badge
        localStorage.setItem('viewedNotifications', 'true'); // Lưu trạng thái vào localStorage
    };

    // Chuyển hướng khi bấm vào item trong dropdown
    const handleOrderClick = (orderId) => {
        setShowNotificationDropdown(false); // Ẩn dropdown
        navigate(`/admin/orderList?orderId=${orderId}`); // Chuyển hướng
    };

    // Ẩn dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setShowUserDropdown(false);
            }
            if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
                setShowNotificationDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header style={styles.header}>
            <div style={styles.title}>MATERIO</div>
            <div style={styles.search}>
                <input type="text" placeholder="Search..." style={styles.searchInput} />
            </div>
            <div style={styles.icons}>
                {/* 🔔 Icon Thông báo */}
                <div style={styles.notificationDropdown} ref={notificationDropdownRef}>
                    <button style={styles.iconButton} onClick={handleNotificationClick}>
                        <i className="ri-notification-3-line"></i>
                        {!viewedNotifications && newOrdersCount > 0 && (
                            <span style={styles.badge}>{newOrdersCount}</span>
                        )}
                    </button>
                    {showNotificationDropdown && (
                        <div style={styles.dropdownMenu}>
                            {newOrders.length > 0 ? (
                                newOrders.map(order => (
                                    <button
                                        key={order.id}
                                        style={styles.dropdownItem}
                                        onClick={() => handleOrderClick(order.id)}
                                    >
                                        Bạn có đơn hàng mới hôm nay. ID: {order.id}
                                    </button>
                                ))
                            ) : (
                                <div style={styles.dropdownItem}>Không có đơn hàng mới hôm nay.</div>
                            )}
                        </div>
                    )}
                </div>

                {/* 🖼 Avatar + Dropdown */}
                <div style={styles.avatarDropdown} ref={userDropdownRef}>
                    <img
                        src={user.avatar || 'https://via.placeholder.com/50'}
                        alt="User Avatar"
                        style={styles.avatar}
                        onClick={() => setShowUserDropdown(!showUserDropdown)}
                    />
                    {showUserDropdown && (
                        <div style={styles.dropdownMenu}>
                            <button
                                style={styles.dropdownItem}
                                onClick={() => navigate('/address')}
                            >
                                📄 Info
                            </button>
                            <button
                                style={styles.dropdownItem}
                                onClick={() => navigate('/change-password')}
                            >
                                🔑 Change Password
                            </button>
                            <button
                                style={{ ...styles.dropdownItem, ...styles.logout }}
                                onClick={handleLogout}
                            >
                                🚪 Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

const styles = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 20px',
        background: '#f8f9fa',
        boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
    },
    title: {
        fontSize: '20px',
        fontWeight: 'bold',
    },
    search: {
        flexGrow: 1,
        textAlign: 'center',
    },
    searchInput: {
        padding: '8px',
        width: '200px',
        borderRadius: '5px',
        border: '1px solid #ccc',
    },
    icons: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
    },
    iconButton: {
        background: 'none',
        color:'black',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: '-5px',
        right: '-5px',
        background: '#ff4d4f',
        color: 'white',
        borderRadius: '50%',
        padding: '2px 6px',
        fontSize: '12px',
    },
    notificationDropdown: {
        position: 'relative',
        display: 'inline-block',
    },
    avatarDropdown: {
        position: 'relative',
        display: 'inline-block',
    },
    avatar: {
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        cursor: 'pointer',
        border: '2px solid #ccc',
        transition: 'border 0.3s ease',
    },
    dropdownMenu: {
        position: 'absolute',
        top: '40px',
        right: '0',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
        minWidth: '250px',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10,
    },
    dropdownItem: {
        background: 'none',
        border: 'none',
        textAlign: 'left',
        padding: '12px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'all 0.3s ease',
        whiteSpace: 'normal',
        color: '#333',
        borderRadius: '5px',
    },
    logout: {
        color: '#ff4d4f',
    },
};

export default HeaderAdmin;