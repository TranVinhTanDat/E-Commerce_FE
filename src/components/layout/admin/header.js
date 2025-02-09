import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../../utils/config';

const HeaderAdmin = () => {
    const [user, setUser] = useState({});
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

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

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/');
    };

    // Ẩn dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
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
                <button style={styles.iconButton}>
                    <i className="ri-notification-3-line"></i>
                </button>

                {/* 🖼 Avatar + Dropdown */}
                <div style={styles.avatarDropdown} ref={dropdownRef}>
                    <img 
                        src={user.avatar || "https://via.placeholder.com/50"} 
                        alt="User Avatar" 
                        style={styles.avatar} 
                        onClick={() => setShowDropdown(!showDropdown)}
                    />
                    {showDropdown && (
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
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
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
        top: '60px',
        right: '0',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
        minWidth: '180px',
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
        whiteSpace: 'nowrap',
        color: '#333', // 🔹 Màu chữ chính (đậm, dễ đọc)
        fontWeight: 'bold',
        borderRadius: '5px',
    },
    dropdownItemHover: {
        background: '#ff4d4f', // 🔴 Màu nền khi hover (đỏ chuyên nghiệp)
        color: '#fff', // ⚪ Màu chữ trắng khi hover
    },

};

export default HeaderAdmin;
