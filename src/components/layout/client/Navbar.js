import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../../utils/config';
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [user, setUser] = useState(null);
    const [cartItemsCount, setCartItemsCount] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isPagesOpen, setIsPagesOpen] = useState(false);
    const modalRef = useRef(null);
    const collapseRef = useRef(null);
    const [showChatList, setShowChatList] = useState(false);
    const [showChatBox, setShowChatBox] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [unreadMessagesFromAdmin, setUnreadMessagesFromAdmin] = useState(0);
    const chatRef = useRef(null);
    const clientRef = useRef(null);
    const chatListRef = useRef(null);

    // Toggle menu collapse
    const toggleMenu = () => {
        setIsMenuOpen(prev => {
            const newState = !prev;
            if (collapseRef.current) {
                collapseRef.current.classList.toggle('show', newState);
            }
            return newState;
        });
        setIsPagesOpen(false); // Đóng dropdown Pages khi toggle menu
    };

    // Toggle dropdown Pages trên mobile
    const togglePages = () => {
        setIsPagesOpen(prev => !prev);
    };

    // Đóng menu khi chọn mục
    const closeMenu = () => {
        setIsMenuOpen(false);
        setIsPagesOpen(false);
        if (collapseRef.current) {
            collapseRef.current.classList.remove('show');
        }
    };

    const fetchUnreadMessagesFromAdmin = async () => {
        if (!user?.username) return;
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/messages/unread-count-from-admin/${user.username}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUnreadMessagesFromAdmin(response.data);
            console.log("Số tin nhắn chưa đọc từ Admin:", response.data);
        } catch (error) {
            console.error("🔥 Lỗi khi lấy số tin nhắn chưa đọc từ Admin:", error);
        }
    };

    useEffect(() => {
        // Đóng menu khi location.pathname thay đổi
        closeMenu();
    }, [location.pathname]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get(`${API_BASE_URL}/auth/user`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(response => {
                    setUser(response.data);
                })
                .catch(error => console.error('Error fetching user data:', error));

            axios.get(`${API_BASE_URL}/cart/view`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(response => setCartItemsCount(response.data.length))
                .catch(error => console.error('Error fetching cart items:', error));
        }

        function handleClickOutside(event) {
            console.log("Clicked element:", event.target);
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setShowModal(false);
            }
            if (chatListRef.current && !chatListRef.current.contains(event.target)) {
                setShowChatList(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!user?.username) return;

        fetchUnreadMessagesFromAdmin();

        const token = localStorage.getItem("token");
        if (!token) {
            console.error("❌ Không tìm thấy JWT token!");
            return;
        }

        const socket = new SockJS(`${API_BASE_URL}/ws`);
        clientRef.current = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            reconnectDelay: 5000,
            debug: (msg) => console.log("STOMP DEBUG:", msg),
            onConnect: () => {
                console.log("✅ STOMP Client connected!");
                // Đăng ký nhận tin nhắn riêng tư
                clientRef.current.subscribe(`/user/${user.username}/queue/private`, (msg) => {
                    const newMessage = JSON.parse(msg.body);
                    console.log("📩 Tin nhắn riêng tư mới:", newMessage);
                    setMessages((prev) => {
                        const updatedMessages = [...prev, newMessage];
                        // Lưu messages vào localStorage để giữ trạng thái nếu cần
                        localStorage.setItem(`messages_${user.username}_${newMessage.receiver}`, JSON.stringify(updatedMessages));
                        return updatedMessages;
                    });
                    // Tự động mở chat box nếu tin nhắn từ admin và chat box chưa mở
                    if (newMessage.sender === "admin" && !showChatBox) {
                        setSelectedCustomer("admin");
                        setShowChatBox(true);
                        fetchUnreadMessagesFromAdmin();
                    } else if (newMessage.sender === "admin" && showChatBox && selectedCustomer === "admin") {
                        fetchUnreadMessagesFromAdmin();
                    }
                });

                // Đăng ký nhận tin nhắn broadcast (nếu cần)
                clientRef.current.subscribe("/topic/messages", (msg) => {
                    const newMessage = JSON.parse(msg.body);
                    console.log("📩 Tin nhắn từ topic:", newMessage);
                    setMessages((prev) => [...prev, newMessage]);
                });
            },
            onStompError: (frame) => console.error("🔥 Lỗi STOMP:", frame),
            onWebSocketClose: () => console.warn("🔴 WebSocket bị đóng, thử kết nối lại..."),
        });

        clientRef.current.activate();
        return () => clientRef.current.deactivate();
    }, [user]); // Chỉ phụ thuộc vào user

    const sendMessage = () => {
        if (message.trim() === "") return;

        if (clientRef.current && clientRef.current.connected) {
            const newMessage = { sender: user?.username || "user", receiver: "admin", content: message };
            clientRef.current.publish({ destination: "/app/chat", body: JSON.stringify(newMessage) });
            setMessage("");
        } else {
            console.error("STOMP client chưa kết nối, không thể gửi tin nhắn!");
        }
    };

    const fetchUserConversations = async () => {
        if (!user?.username) return;

        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/messages/conversations/${user.username}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            let conversationList = response.data;
            if (user.username !== "admin" && !conversationList.includes("admin")) {
                conversationList = [...conversationList, "admin"];
            }
            setCustomers(conversationList);
            fetchUnreadMessagesFromAdmin();
        } catch (error) {
            console.error("🔥 Lỗi khi lấy danh sách cuộc hội thoại:", error);
            if (user.username !== "admin") {
                setCustomers(["admin"]);
            }
        }
    };

    const fetchMessages = async (customer) => {
        if (!user?.username) return;

        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/messages/${user.username}/${customer}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (Array.isArray(response.data)) {
                console.log("📩 Tin nhắn nhận được từ API:", response.data);
                // Kết hợp dữ liệu từ API với messages hiện tại, loại bỏ trùng lặp
                setMessages((prev) => {
                    const existingMessageIds = new Set(prev.map((msg) => msg.id)); // Giả sử mỗi tin nhắn có id
                    const newMessages = response.data.filter((msg) => !existingMessageIds.has(msg.id));
                    const updatedMessages = [...prev, ...newMessages];
                    // Lưu vào localStorage
                    localStorage.setItem(`messages_${user.username}_${customer}`, JSON.stringify(updatedMessages));
                    return updatedMessages;
                });
            } else {
                console.error("⚠ API không trả về danh sách tin nhắn hợp lệ.");
            }
        } catch (error) {
            console.error("🔥 Lỗi khi lấy lịch sử tin nhắn:", error);
        }
    };

    useEffect(() => {
        if (!user?.username || !selectedCustomer) return;
        // Khởi tạo messages từ localStorage
        const savedMessages = localStorage.getItem(`messages_${user.username}_${selectedCustomer}`);
        if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
        }
    }, [user, selectedCustomer]);

    const openChatBox = async (customer) => {
        setSelectedCustomer(customer);
        try {
            await fetchMessages(customer);

            setTimeout(() => {
                if (chatRef.current) {
                    chatRef.current.scrollTop = chatRef.current.scrollHeight;
                }
            }, 100);

            if (customer === "admin") {
                const token = localStorage.getItem("token");
                await axios.post(`${API_BASE_URL}/messages/mark-read-from-admin/${user.username}`, null, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setTimeout(() => {
                    fetchUnreadMessagesFromAdmin();
                }, 500);
            }

            setShowChatBox(true);
        } catch (error) {
            console.error("🔥 Lỗi khi mở hộp chat:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setUser(null);
        navigate('/');
    };

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);

    const isMobile = window.innerWidth < 992;

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
                        aria-controls="navbarCollapse"
                        aria-expanded={isMenuOpen}
                        aria-label="Toggle navigation"
                        onClick={toggleMenu}
                    >
                        <span className="fa fa-bars"></span>
                    </button>
                    <div className="collapse navbar-collapse bg-white" id="navbarCollapse" ref={collapseRef}>
                        <div className="navbar-nav mx-auto">
                            <NavLink
                                to="/"
                                className={`nav-item nav-link ${location.pathname === '/' ? 'active' : ''}`}
                                onClick={closeMenu}
                            >
                                Home
                            </NavLink>
                            <NavLink
                                to="/shop"
                                className={`nav-item nav-link ${location.pathname === '/shop' ? 'active' : ''}`}
                                onClick={closeMenu}
                            >
                                Shop
                            </NavLink>
                            <div className="nav-item dropdown">
                                <button
                                    className="nav-link dropdown-toggle"
                                    onClick={isMobile ? togglePages : undefined}
                                    data-bs-toggle={isMobile ? undefined : "dropdown"}
                                    aria-expanded={isMobile ? isPagesOpen : undefined}
                                    style={{ background: 'none', border: 'none' }}
                                >
                                    Pages
                                </button>
                                <div
                                    className={isMobile ? "mobile-dropdown" : "dropdown-menu m-0 bg-secondary rounded-0"}
                                    style={isMobile ? { display: isPagesOpen ? 'block' : 'none' } : {}}
                                >
                                    <NavLink
                                        to="/cart"
                                        className={isMobile ? "mobile-dropdown-item" : "dropdown-item"}
                                        onClick={closeMenu}
                                    >
                                        Cart
                                    </NavLink>
                                    <NavLink
                                        to="/checkout"
                                        className={isMobile ? "mobile-dropdown-item" : "dropdown-item"}
                                        onClick={closeMenu}
                                    >
                                        Checkout
                                    </NavLink>
                                    <NavLink
                                        to="/orderhistory"
                                        className={isMobile ? "mobile-dropdown-item" : "dropdown-item"}
                                        onClick={closeMenu}
                                    >
                                        Order History
                                    </NavLink>
                                    <NavLink
                                        to="/testimonial"
                                        className={isMobile ? "mobile-dropdown-item" : "dropdown-item"}
                                        onClick={closeMenu}
                                    >
                                        Testimonial
                                    </NavLink>
                                </div>
                            </div>
                            <NavLink
                                to="/contact"
                                className={`nav-item nav-link ${location.pathname === '/contact' ? 'active' : ''}`}
                                onClick={closeMenu}
                            >
                                Contact
                            </NavLink>
                        </div>
                        <div className="d-flex m-3 me-0 position-relative">
                            <NavLink to="/cart" className="position-relative me-4 my-auto">
                                <i className="fa fa-shopping-bag fa-2x"></i>
                                <span
                                    className="position-absolute bg-secondary rounded-circle d-flex align-items-center justify-content-center text-dark px-1"
                                    style={{ top: '-5px', left: '15px', height: '20px', minWidth: '20px' }}
                                >
                                    {cartItemsCount}
                                </span>
                            </NavLink>
                            <NavLink
                                to="#"
                                className="position-relative me-4 my-auto"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowChatList((prev) => {
                                        const newState = !prev;
                                        if (newState) fetchUserConversations();
                                        return newState;
                                    });
                                }}
                                onTouchStart={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowChatList((prev) => {
                                        const newState = !prev;
                                        if (newState) fetchUserConversations();
                                        return newState;
                                    });
                                }}
                            >
                                <i className="fas fa-comment-dots fa-2x"></i>
                            </NavLink>

                            <a
                                href="#"
                                className="my-auto"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowModal((prev) => !prev);
                                }}
                                onTouchStart={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowModal((prev) => !prev);
                                }}
                            >
                                <i className="fas fa-user fa-2x"></i>
                            </a>
                            {showModal && (
                                <div className="modal-dropdown" ref={modalRef}>
                                    <div className="modal-content">
                                        <span className="close-icon" onClick={() => setShowModal(false)}>×</span>
                                        {user ? (
                                            <>
                                                <img src={user.avatar} alt="Avatar" className="avatar" />
                                                <p className="username">{user.username}</p>
                                                <button
                                                    onClick={() => {
                                                        navigate('/profile');
                                                        setShowModal(false);
                                                    }}
                                                    className="menu-item"
                                                >
                                                    <i className="fas fa-user me-2"></i> Profile
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        navigate('/address');
                                                        setShowModal(false);
                                                    }}
                                                    className="menu-item"
                                                >
                                                    <i className="fas fa-map-marker-alt me-2"></i> Address
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        navigate('/change-password');
                                                        setShowModal(false);
                                                    }}
                                                    className="menu-item"
                                                >
                                                    <i className="fas fa-key me-2"></i> Change Password
                                                </button>
                                                <button
                                                    onClick={handleLogout}
                                                    className="menu-item logout"
                                                >
                                                    <i className="fas fa-sign-out-alt me-2"></i> Logout
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        navigate('/login');
                                                        setShowModal(false);
                                                    }}
                                                    className="menu-item"
                                                >
                                                    <i className="fas fa-key me-2"></i> Login
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        navigate('/register');
                                                        setShowModal(false);
                                                    }}
                                                    className="menu-item"
                                                >
                                                    <i className="fas fa-file-alt me-2"></i> Register
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                            {showChatList && (
                                <div className="chat-list" ref={chatListRef}>
                                    <h4>Tin nhắn</h4>
                                    {customers.length === 0 ? (
                                        <p>Không có tin nhắn nào</p>
                                    ) : (
                                        customers.map((customer, index) => (
                                            <div
                                                key={index}
                                                className="chat-item"
                                                onClick={() => openChatBox(customer)}
                                            >
                                                {customer}
                                                {customer === "admin" && unreadMessagesFromAdmin > 0 && (
                                                    <span className="unread-badge">{unreadMessagesFromAdmin}</span>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                            {showChatBox && (
                                <div className="chat-box">
                                    <div className="chat-header">
                                        <h5>Chat với {selectedCustomer}</h5>
                                        <span
                                            className="close-icon"
                                            onClick={() => setShowChatBox(false)}
                                        >
                                            ×
                                        </span>
                                    </div>
                                    <div className="chat-body" ref={chatRef}>
                                        {messages.length === 0 ? (
                                            <p style={{ textAlign: "center", color: "#888" }}>Không có tin nhắn nào</p>
                                        ) : (
                                            messages.map((msg, index) => (
                                                <div
                                                    key={index}
                                                    className={msg.sender === user?.username ? "chat-message user" : "chat-message admin"}
                                                >
                                                    <strong>{msg.sender}:</strong> {msg.content}
                                                    <div className="timestamp">
                                                        {new Date(msg.timestamp).toLocaleString('vi-VN', {
                                                            year: 'numeric',
                                                            month: '2-digit',
                                                            day: '2-digit',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            second: '2-digit',
                                                        })}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="chat-footer">
                                        <input
                                            type="text"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && !e.shiftKey) {
                                                    e.preventDefault();
                                                    sendMessage();
                                                }
                                            }}
                                            placeholder="Nhập tin nhắn..."
                                        />
                                        <button onClick={sendMessage}>Gửi</button>
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

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideDown {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .modal-dropdown {
    position: absolute;
    top: 50px;
    right: 10px;
    width: 220px;
    max-width: 220px;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    background-color: #fff;
    z-index: 1001;
    padding: 10px;
    animation: fadeIn 0.3s ease-in-out;
    overflow: hidden;
    }

    @media (max-width: 991.98px) {
    .modal-dropdown {
        width: calc(100% - 20px); /* Chiếm toàn bộ chiều rộng trừ 10px padding mỗi bên */
        max-width: none; /* Bỏ giới hạn max-width */
        left: 10px; /* Căn trái với padding */
        right: 10px; /* Đảm bảo kéo dài đến phải */
        top: 60px; /* Điều chỉnh vị trí dọc nếu cần */
    }
    .modal-content {
        width: 100%; /* Đảm bảo nội dung sử dụng toàn bộ chiều rộng modal */
    }
    .menu-item {
        width: 100%; /* Đảm bảo các nút kéo dài toàn bộ chiều rộng */
    }
    }
    .modal-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
    }
    .close-icon {
        position: absolute;
        top: 5px;
        right: 10px;
        cursor: pointer;
        font-size: 16px;
        color: #888;
        transition: color 0.3s ease;
    }
    .close-icon:hover {
        color: #333;
    }
    .avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        margin-bottom: 8px;
        border: 2px solid #ddd;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    .username {
        font-size: 14px;
        font-weight: bold;
        color: #333;
        text-transform: capitalize;
        margin-bottom: 5px;
    }
    .menu-item {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 10px;
        background-color: #f8f9fa;
        color: #333;
        font-size: 14px;
        font-weight: bold;
        padding: 10px 15px;
        width: 100%;
        text-align: left;
        border-radius: 5px;
        text-decoration: none;
        transition: background 0.3s ease, transform 0.2s ease;
        cursor: pointer;
        border: none;
    }
    .menu-item:hover {
        background-color: #fff3cd;
        color: #007bff;
        transform: scale(1.02);
    }
    .logout {
        background-color: #d9534f;
        color: white;
    }
    .logout:hover {
        background-color: #c82333;
        color: white;
    }
    .chat-list {
        position: absolute;
        top: 50px;
        right: 10px;
        width: 250px;
        max-width: 250px;
        max-height: 300px;
        overflow-y: auto;
        background-color: #fff;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1001;
        padding: 12px;
        animation: fadeIn 0.3s ease-in-out;
        overflow: hidden;
    }
    .chat-list h4 {
        font-size: 16px;
        margin-bottom: 10px;
        color: #333;
        font-weight: 500;
    }
    .chat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        margin-bottom: 5px;
        background-color: #f8f9fa;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.3s ease, transform 0.2s ease;
    }
    .chat-item:hover {
        background-color: #e9ecef;
        transform: translateY(-1px);
    }
    .unread-badge {
        background-color: #ff5555;
        color: white;
        font-size: 12px;
        font-weight: bold;
        padding: 2px 6px;
        border-radius: 10px;
        min-width: 20px;
        text-align: center;
    }
    .chat-box {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 300px;
        height: 400px;
        background-color: #fff;
        border-radius: 14px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        border: 1px solid #e0e0e0;
    }
    .chat-header {
        background-color: #007bff;
        color: white;
        padding: 12px 15px;
        border-top-left-radius: 14px;
        border-top-right-radius: 14px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .chat-header h5 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
    }
    .chat-box .close-icon {
        cursor: pointer;
        font-size: 20px;
        transition: color 0.3s ease, transform 0.2s ease;
    }
    .chat-box .close-icon:hover {
        color: #d1e7ff;
        transform: scale(1.1);
    }
    .chat-body {
        flex: 1;
        padding: 15px;
        overflow-y: auto;
        background-color: #e8ecef;
    }
    .chat-message {
        margin-bottom: 12px;
        padding: 10px 14px;
        border-radius: 12px;
        max-width: 80%;
        word-wrap: break-word;
        font-size: 14px;
        line-height: 1.5;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.12);
        border: 1px solid transparent;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .chat-message:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
    .chat-message.user {
        background-color: #e1f5fe;
        margin-left: auto;
        text-align: left;
        border-color: #b3e5fc;
    }
    .chat-message.admin {
        background-color: #f1b6b6;
        margin-right: auto;
        text-align: left;
        border-color: #940c8d;
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
    }
    .timestamp {
        font-size: 11px;
        color: #888;
        margin-top: 4px;
        text-align: right;
        opacity: 0.8;
        font-style: italic;
    }
    .chat-footer {
        display: flex;
        padding: 10px;
        border-top: 1px solid #e0e0e0;
        background-color: #fff;
        border-bottom-left-radius: 14px;
        border-bottom-right-radius: 14px;
        box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
    }
    .chat-footer input {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 20px;
        margin-right: 10px;
        outline: none;
        font-size: 14px;
        transition: border-color 0.3s ease, box-shadow 0.3s ease;
    }
    .chat-footer input:focus {
        border-color: #007bff;
        box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
    }
    .chat-footer button {
        padding: 8px 15px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        font-size: 14px;
        transition: background-color 0.3s ease, transform 0.2s ease;
    }
    .chat-footer button:hover {
        background-color: #0056b3;
        transform: scale(1.05);
    }
    .navbar-toggler .fa-bars {
        color: #28a745;
    }
    .navbar-toggler {
        border: 1px solid #ddd;
        border-radius: 5px;
        padding: 8px;
        transition: background-color 0.2s ease;
    }
    .navbar-toggler:hover {
        background-color: #f8f9fa;
    }
    @media (max-width: 991.98px) {
        .navbar-collapse {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: #fff;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            max-height: calc(100vh - 70px);
            overflow-y: auto;
            animation: slideDown 0.3s ease-in-out;
        }
        .navbar-nav {
            padding: 10px 0;
            flex-direction: column;
            align-items: flex-start;
        }
        .nav-link {
            padding: 12px 20px;
            font-size: 16px;
            color: #333;
            width: 100%;
        }
        .nav-link:hover, .nav-link.active {
            background-color: #f8f9fa;
            color: #007bff;
        }
        .mobile-dropdown {
            background-color: #f8f9fa;
            margin-left: 63px;
            padding: 10px 0;
            width: calc(100% - 40px);
            animation: slideDown 0.3s ease-in-out;
        }
        .mobile-dropdown-item {
            padding: 10px 20px;
            font-size: 15px;
            color: #333;
            display: block;
            width: 100%; /* Đảm bảo item chiếm toàn bộ chiều rộng của container */
            min-width: 150px; /* Đặt chiều rộng tối thiểu để item dài hơn */
            text-align: left; /* Căn trái nội dung */
            box-sizing: border-box; /* Đảm bảo padding không làm tăng kích thước */
        }
        .mobile-dropdown-item:hover {
            background-color: #e9ecef;
            color: #007bff;
        }
    }
    @media (min-width: 992px) {
        .nav-link:hover, .nav-link.active {
            color: #007bff;
        }
        .dropdown-menu {
            animation: fadeIn 0.3s ease-in-out;
        }
    }
`;
document.head.appendChild(styleSheet);