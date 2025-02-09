import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const NavbarAdmin = () => {
    const location = useLocation();
    const navigate = useNavigate(); // Điều hướng người dùng

    const handleLogout = () => {
        // Xóa token và role khỏi localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('role');

        // Chuyển hướng về trang login
        navigate('/');
    };

    return (
        <aside className="navbar-admin">
            <div className="app-brand">
                <Link to="/admin/dashboard" className="app-brand-link">
                    <span className="app-brand-text">MATERIO</span>
                </Link>
            </div>
            <nav className="navbar-links">
                    <Link 
                        to="/admin/dashboard" 
                        className={`navbar-item ${location.pathname === "/admin/dashboard" ? "active" : ""}`}
                    >
                        📊 Dashboard
                    </Link>

                    <Link 
                        to="/admin/productList" 
                        className={`navbar-item ${location.pathname === "/admin/productList" ? "active" : ""}`}
                    >
                        🛍️ Products
                    </Link>

                    <Link 
                        to="/admin/orderList" 
                        className={`navbar-item ${location.pathname === "/admin/orderList" ? "active" : ""}`}
                    >
                        📦 Orders
                    </Link>

                    <Link 
                        to="/admin/shipperOrderList" 
                        className={`navbar-item ${location.pathname === "/admin/shipperOrderList" ? "active" : ""}`}
                    >
                        🚚 Shipper
                    </Link>

                    <Link 
                        to="/admin/customers" 
                        className={`navbar-item ${location.pathname === "/admin/customers" ? "active" : ""}`}
                    >
                        👥 Customers
                    </Link>

                    {/* Nút Logout */}
                    <button 
                        onClick={handleLogout} 
                        className="navbar-item logout-button"
                    >
                        🚪 Logout
                    </button>
                </nav>

        </aside>
    );
};

export default NavbarAdmin;
