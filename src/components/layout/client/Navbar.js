import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../../utils/config';

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [user, setUser] = useState(null);
    const [cartItemsCount, setCartItemsCount] = useState(0);
    const modalRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get(`${API_BASE_URL}/auth/user`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(response => setUser(response.data))
            .catch(error => console.error('Error fetching user data:', error));

            axios.get(`${API_BASE_URL}/cart/view`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(response => setCartItemsCount(response.data.length))
            .catch(error => console.error('Error fetching cart items:', error));
        }

        function handleClickOutside(event) {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setShowModal(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setUser(null);
        navigate('/');
    };

    return (
        <div className="container-fluid fixed-top">
            <div className="container topbar bg-primary d-none d-lg-block">
                <div className="d-flex justify-content-between">
                    <div className="top-info ps-2">
                        <small className="me-3">
                            <i className="fas fa-map-marker-alt me-2 text-secondary"></i>
                            <a href="#" className="text-white">123 Street, New York</a>
                        </small>
                        <small className="me-3">
                            <i className="fas fa-envelope me-2 text-secondary"></i>
                            <a href="#" className="text-white">Email@Example.com</a>
                        </small>
                    </div>
                    <div className="top-link pe-2">
                        <a href="#" className="text-white"><small className="mx-2">Privacy Policy</small></a>
                        <a href="#" className="text-white"><small className="mx-2">Terms of Use</small></a>
                        <a href="#" className="text-white"><small className="ms-2">Sales and Refunds</small></a>
                    </div>
                </div>
            </div>
            <div className="container px-0">
                <nav className="navbar navbar-light bg-white navbar-expand-xl">
                    <NavLink to="/" className="navbar-brand">
                        <h1 className="text-primary display-6">Fruitables</h1>
                    </NavLink>
                    <button
                        className="navbar-toggler py-2 px-3"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarCollapse"
                        aria-controls="navbarCollapse"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="fa fa-bars text-primary"></span>
                    </button>
                    <div className="collapse navbar-collapse bg-white" id="navbarCollapse">
                        <div className="navbar-nav mx-auto">
                            <NavLink to="/" className={`nav-item nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</NavLink>
                            <NavLink to="/shop" className={`nav-item nav-link ${location.pathname === '/shop' ? 'active' : ''}`}>Shop</NavLink>
                            <div className="nav-item dropdown">
                                <a href="#" className="nav-link dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">Pages</a>
                                <div className="dropdown-menu m-0 bg-secondary rounded-0">
                                    <NavLink to="/cart" className="dropdown-item">Cart</NavLink>
                                    <NavLink to="/checkout" className="dropdown-item">Checkout</NavLink>
                                    <NavLink to="/orderhistory" className="dropdown-item">Order History</NavLink>
                                    <NavLink to="/testimonial" className="dropdown-item">Testimonial</NavLink>
                                </div>
                            </div>
                            <NavLink to="/contact" className={`nav-item nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>Contact</NavLink>
                        </div>
                        <div className="d-flex m-3 me-0 position-relative">
                            <NavLink to="/cart" className="position-relative me-4 my-auto">
                                <i className="fa fa-shopping-bag fa-2x"></i>
                                <span className="position-absolute bg-secondary rounded-circle d-flex align-items-center justify-content-center text-dark px-1"
                                    style={{ top: '-5px', left: '15px', height: '20px', minWidth: '20px' }}>
                                    {cartItemsCount}
                                </span>
                            </NavLink>
                            <a href="#" className="my-auto" onClick={() => setShowModal(!showModal)}>
                                <i className="fas fa-user fa-2x"></i>
                            </a>
                            {showModal && (
                                <div ref={modalRef} style={styles.modalDropdown}>
                                <div style={styles.modalContent}>
                                    <span style={styles.closeIcon} onClick={() => setShowModal(false)}>&times;</span>
                                    {user ? (
                                        <>
                                            <img src={user.avatar} alt="Avatar" style={styles.avatar} />
                                            <p style={styles.username}>{user.username}</p>
                                            <button 
                                                onClick={() => { navigate('/address'); setShowModal(false); }} 
                                                style={styles.menuItem}
                                            >
                                                ℹ️ <span>Info</span>
                                            </button>
                                            <button 
                                                onClick={() => { navigate('/change-password'); setShowModal(false); }} 
                                                style={styles.menuItem}
                                            >
                                                🔄 <span>Change Password</span>
                                            </button>
                                            <button 
                                                onClick={handleLogout} 
                                                style={{ ...styles.menuItem, ...styles.logout }}
                                            >
                                                🚪 Logout
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button 
                                                onClick={() => { navigate('/login'); setShowModal(false); }} 
                                                style={styles.menuItem}
                                            >
                                                🔑 <span>Login</span>
                                            </button>
                                            <button 
                                                onClick={() => { navigate('/register'); setShowModal(false); }} 
                                                style={styles.menuItem}
                                            >
                                                📝 <span>Register</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            
                            )}
                        </div>
                    </div>
                </nav>
            </div>
        </div>
    );
}

const styles = {
    modalDropdown: {
        position: 'absolute',
        top: '50px',
        right: '0',
        width: '220px',
        borderRadius: '10px',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
        backgroundColor: '#fff',
        zIndex: 1000,
        padding: '10px',
        animation: 'fadeIn 0.3s ease-in-out',
    },
    modalContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
    },
    closeIcon: {
        position: 'absolute',
        top: '5px',
        right: '10px',
        cursor: 'pointer',
        fontSize: '16px',
        color: '#888',
    },
    avatar: {
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        marginBottom: '8px',
        border: '2px solid #ddd',
        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
    },
    username: {
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#333',
        textTransform: 'capitalize',
        marginBottom: '5px',
    },
    menuItem: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start', // Căn chữ sang trái
        gap: '10px',
        backgroundColor: '#f8f9fa',
        color: '#333',
        fontWeight: 'bold',
        padding: '10px 15px',
        width: '100%',
        textAlign: 'left',
        borderRadius: '5px',
        textDecoration: 'none',
        transition: 'background 0.3s ease, transform 0.2s ease',
        cursor: 'pointer',
    },
    menuItemHover: {
        backgroundColor: '#ff4d4f',
        color: 'white',
        transform: 'scale(1.05)',
    },
    logout: {
        backgroundColor: '#d9534f',
        color: 'white',
        justifyContent: 'flex-start', // 🔥 Căn trái chữ Logout luôn
    },
};
