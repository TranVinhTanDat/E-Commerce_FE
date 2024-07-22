import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function Navbar() {
    const location = useLocation();
    const [showModal, setShowModal] = useState(false);
    const [user, setUser] = useState(null);
    const [cartItemsCount, setCartItemsCount] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get('http://localhost:8080/auth/user', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(response => {
                setUser(response.data);
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
            });

            axios.get('http://localhost:8080/cart/view', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(response => {
                setCartItemsCount(response.data.length);
            })
            .catch(error => {
                console.error('Error fetching cart items:', error);
            });
        }

        const handleClickOutside = (event) => {
            if (event.target.closest('.modal-content') === null) {
                setShowModal(false);
            }
        };

        if (showModal) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showModal]);

    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setUser(null);
        window.location.href = '/';
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
                        <a href="#" className="text-white">
                            <small className="text-white mx-2">Privacy Policy</small>
                        </a>
                        <a href="#" className="text-white">
                            <small className="text-white mx-2">Terms of Use</small>
                        </a>
                        <a href="#" className="text-white">
                            <small className="text-white ms-2">Sales and Refunds</small>
                        </a>
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
                                <a
                                    href="#"
                                    className="nav-link dropdown-toggle"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    Pages
                                </a>
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
                            <button
                                className="btn-search btn border border-secondary btn-md-square rounded-circle bg-white me-4"
                                data-bs-toggle="modal"
                                data-bs-target="#searchModal"
                                aria-label="Search"
                                style={{marginTop:'10px'}}
                            >
                                <i className="fas fa-search text-primary"></i>
                            </button>
                            <NavLink to="/cart" className="position-relative me-4 my-auto" aria-label="Shopping Cart">
                                <i className="fa fa-shopping-bag fa-2x"></i>
                                <span
                                    className="position-absolute bg-secondary rounded-circle d-flex align-items-center justify-content-center text-dark px-1"
                                    style={{ top: '-5px', left: '15px', height: '20px', minWidth: '20px' }}
                                >
                                    {cartItemsCount}
                                </span>
                            </NavLink>
                            <a href="#" className="my-auto" aria-label="User Account" onClick={handleShowModal}>
                                <i className="fas fa-user fa-2x"></i>
                            </a>
                            {showModal && (
                                <div className="modal" style={{ display: 'block', top: '60px', right: '0', position: 'absolute', width: '250px', height:'350px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', zIndex: 1000 }}>
                                    <div className="modal-content" style={{ padding: '20px' }}>
                                        <span className="close" onClick={handleCloseModal}>&times;</span>
                                        <div className="modal-body text-center d-flex flex-column align-items-center">
                                            {user ? (
                                                <>
                                                    <img src={user.avatar} alt="Avatar" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                                                    <p>{user.username}</p>
                                                    <button onClick={handleLogout} className="btn btn-primary btn-sm mb-2">Logout</button>
                                                    <NavLink to="/address" className="btn btn-secondary btn-sm mb-2" onClick={handleCloseModal}>Info</NavLink>
                                                    <button className="btn btn-secondary btn-sm mb-2">Change Password</button>
                                                </>
                                            ) : (
                                                <>
                                                    <NavLink to="/login" className="btn btn-primary btn-sm mb-2" onClick={handleCloseModal}>Login</NavLink>
                                                    <NavLink to="/register" className="btn btn-secondary btn-sm mb-2" onClick={handleCloseModal}>Register</NavLink>
                                                </>
                                            )}
                                        </div>
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
