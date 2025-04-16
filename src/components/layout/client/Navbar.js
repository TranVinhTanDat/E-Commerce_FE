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
    const modalRef = useRef(null);

    const [showChatList, setShowChatList] = useState(false);
    const [showChatBox, setShowChatBox] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [unreadMessagesFromAdmin, setUnreadMessagesFromAdmin] = useState(0); // Số tin nhắn chưa đọc từ Admin
    const chatRef = useRef(null);
    const clientRef = useRef(null);
    const chatListRef = useRef(null);

    // Lấy số tin nhắn chưa đọc từ Admin gửi đến user hiện tại
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

        // Lấy số tin nhắn chưa đọc ban đầu từ Admin
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

                clientRef.current.subscribe("/user/queue/private", (msg) => {
                    const newMessage = JSON.parse(msg.body);
                    console.log("📩 Tin nhắn riêng tư mới:", newMessage);
                    setMessages((prev) => [...prev, newMessage]);

                    // Cập nhật số tin nhắn chưa đọc khi nhận tin nhắn mới từ Admin
                    if (newMessage.sender === "admin" && !showChatBox) {
                        fetchUnreadMessagesFromAdmin();
                    }
                });

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
    }, [user, showChatBox]);

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
            setCustomers(response.data);
            // Sau khi lấy danh sách khách hàng, cập nhật số tin nhắn chưa đọc
            fetchUnreadMessagesFromAdmin();
        } catch (error) {
            console.error("🔥 Lỗi khi lấy danh sách cuộc hội thoại:", error);
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
                console.log("📩 Tin nhắn nhận được:", response.data);
                setMessages(response.data);
            } else {
                console.error("⚠ API không trả về danh sách tin nhắn hợp lệ.");
            }
        } catch (error) {
            console.error("🔥 Lỗi khi lấy lịch sử tin nhắn:", error);
        }
    };

    const openChatBox = async (customer) => {
        setSelectedCustomer(customer);
        try {
            await fetchMessages(customer);

            // Đợi giao diện render xong, sau đó cuộn xuống dưới cùng
            setTimeout(() => {
                if (chatRef.current) {
                    chatRef.current.scrollTop = chatRef.current.scrollHeight;
                }
            }, 100); // Đợi 100ms để đảm bảo giao diện đã render

            // Nếu mở hộp chat với Admin, đánh dấu tất cả tin nhắn từ Admin là đã đọc
            if (customer === "admin") {
                const token = localStorage.getItem("token");
                await axios.post(`${API_BASE_URL}/messages/mark-read-from-admin/${user.username}`, null, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // Cập nhật số tin nhắn chưa đọc từ Admin
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
                                <button className="nav-link dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" style={{ background: 'none', border: 'none' }}>
                                    Pages
                                </button>
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

                            <NavLink to="#" className="position-relative me-4 my-auto" onClick={(e) => {
                                e.preventDefault();
                                setShowChatList(!showChatList);
                                if (!showChatList) fetchUserConversations();
                            }}>
                                <i className="fas fa-comment-dots fa-2x"></i>
                            </NavLink>

                            <a href="#" className="my-auto" onClick={(e) => { e.preventDefault(); setShowModal(!showModal); }}>
                                <i className="fas fa-user fa-2x"></i>
                            </a>
                            {showModal && (
                                <div ref={modalRef} style={styles.modalDropdown}>
                                    <div style={styles.modalContent}>
                                        <span style={styles.closeIcon} onClick={() => setShowModal(false)}>×</span>
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

                            {showChatList && (
                                <div className="chat-list" ref={chatListRef}>
                                    <h4>Tin nhắn</h4>
                                    {customers.length === 0 ? (
                                        <p>Không có tin nhắn nào</p>
                                    ) : (
                                        customers.map((customer, index) => (
                                            <div key={index} className="chat-item" onClick={() => openChatBox(customer)}>
                                                {customer}
                                                {customer === "admin" && unreadMessagesFromAdmin > 0 && (
                                                    <span className="unread-badge">
                                                        {unreadMessagesFromAdmin}
                                                    </span>
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
                                        <span className="close-icon" onClick={() => setShowChatBox(false)}>×</span>
                                    </div>
                                    <div className="chat-body" ref={chatRef}>
                                        {messages.length === 0 ? (
                                            <p style={{ textAlign: "center", color: "#888" }}>Không có tin nhắn nào</p>
                                        ) : (
                                            messages.map((msg, index) => (
                                                <div key={index} className={msg.sender === user?.username ? "chat-message user" : "chat-message admin"}>
                                                    <strong>{msg.sender}:</strong> {msg.content}
                                                    <div className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</div>
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
        justifyContent: 'flex-start',
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
        justifyContent: 'flex-start',
    },
};

// Thêm CSS cho chat-item và badge
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
    .chat-list {
        position: absolute;
        top: 50px;
        right: 0;
        width: 250px;
        max-height: 300px;
        overflow-y: auto;
        background-color: #fff;
        border-radius: 12px;
        box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        padding: 12px;
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
        background-color: #FF5555;
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
        box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.15);
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
    .close-icon {
        cursor: pointer;
        font-size: 20px;
        transition: color 0.3s ease, transform 0.2s ease;
    }
    .close-icon:hover {
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
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
        background-color:rgb(241, 182, 182);
        margin-right: auto;
        text-align: left;
        border-color:rgb(148, 12, 141);
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
    }
    .chat-message.consecutive {
        margin-bottom: 4px;
        border-radius: 12px;
    }
    .chat-message.consecutive:first-of-type {
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
    }
    .chat-message.consecutive:last-of-type {
        border-bottom-left-radius: 12px;
        border-bottom-right-radius: 12px;
    }
    .sender-name {
        font-size: 14px;
        color: #333 !important;
        margin-bottom: 2px;
        display: block;
        font-weight: 500;
    }
    .message-content {
        font-size: 14px;
        color: #333 !important;
        min-height: 14px;
    }
    .message-content:empty::before {
        content: "[Tin nhắn trống]";
        color: #888 !important;
        font-style: italic;
    }
    .timestamp {
        font-size: 11px;
        color: #888 !important;
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
`;
document.head.appendChild(styleSheet);