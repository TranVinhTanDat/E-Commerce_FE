import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const NavbarEmployee = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/');
    };

    return (
        <aside className="navbar-employee">
            <div className="app-brand">
                <Link to="/admin/orderList" className="app-brand-link">
                    <span className="app-brand-text">MATERIO</span>
                </Link>
            </div>
            <nav className="navbar-links">
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
                    to="/admin/chat"
                    className={`navbar-item ${location.pathname === "/admin/chat" ? "active" : ""}`}
                >
                    💬 Chat
                </Link>

                <button onClick={handleLogout} className="navbar-item logout-button">
                    🚪 Logout
                </button>
            </nav>
        </aside>
    );
};

// CSS tương tự NavbarAdmin, chỉ đổi class để tránh xung đột
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
    .navbar-employee {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        width: 250px;
        background-color: #fff;
        box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        z-index: 1000;
    }
    .app-brand {
        padding: 20px;
        text-align: center;
        border-bottom: 1px solid #e0e0e0;
    }
    .app-brand-link {
        text-decoration: none;
    }
    .app-brand-text {
        font-size: 24px;
        font-weight: bold;
        color: #007bff;
    }
    .navbar-links {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 10px 0;
    }
    .navbar-item {
        display: flex;
        align-items: center;
        padding: 15px 20px;
        color: #333;
        text-decoration: none;
        font-size: 16px;
        transition: background 0.3s ease, color 0.3s ease;
    }
    .navbar-item:hover {
        background-color: #f8f9fa;
        color: #007bff;
    }
    .navbar-item.active {
        background-color: #e1f5fe;
        color: #007bff;
        font-weight: bold;
    }
    .logout-button {
        background: none;
        border: none;
        cursor: pointer;
        color: #d9534f;
        font-weight: bold;
        margin-top: auto;
    }
    .logout-button:hover {
        background-color: #f8f9fa;
        color: #c9302c;
    }
`;
document.head.appendChild(styleSheet);

export default NavbarEmployee;