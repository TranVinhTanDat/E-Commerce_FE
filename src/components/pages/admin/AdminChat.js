import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import API_BASE_URL from '../../../utils/config';

const AdminChat = () => {
  const [client, setClient] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [unreadMessages, setUnreadMessages] = useState({});
  const chatRef = useRef(null);

  const fetchUnreadMessagesCount = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${API_BASE_URL}/messages/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadMessages(response.data);
      console.log("Số tin nhắn chưa đọc từ API:", response.data);
    } catch (error) {
      console.error("🔥 Lỗi khi lấy số tin nhắn chưa đọc:", error);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Đang gửi...";
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isToday = messageDate.toDateString() === today.toDateString();
    const isYesterday = messageDate.toDateString() === yesterday.toDateString();

    if (isToday) {
      return `Hôm nay, ${messageDate.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })}`;
    } else if (isYesterday) {
      return `Hôm qua, ${messageDate.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })}`;
    } else {
      return messageDate.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("❌ Không tìm thấy JWT token!");
      return;
    }

    axios
      .get(`${API_BASE_URL}/messages/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log("Danh sách khách hàng từ API:", response.data);
        setCustomers(response.data);
      })
      .catch((error) => console.error("🔥 Lỗi khi lấy danh sách khách hàng:", error));

    fetchUnreadMessagesCount();

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      debug: (msg) => console.log("STOMP DEBUG:", msg),
      onConnect: () => {
        console.log("✅ STOMP Client connected!");

        stompClient.subscribe("/topic/messages", (message) => {
          const receivedMessage = JSON.parse(message.body);
          console.log("Tin nhắn nhận được từ /topic/messages:", receivedMessage);
          setMessages((prev) => {
            const updatedMessages = [...prev, receivedMessage];
            localStorage.setItem(`messages_admin_${selectedCustomer}`, JSON.stringify(updatedMessages));
            return updatedMessages;
          });

          setCustomers((prevCustomers) => {
            if (!prevCustomers.includes(receivedMessage.sender) && receivedMessage.sender !== "admin") {
              const newCustomers = [...prevCustomers, receivedMessage.sender];
              return newCustomers;
            }
            return prevCustomers;
          });

          if (receivedMessage.sender !== "admin" && receivedMessage.sender !== selectedCustomer) {
            fetchUnreadMessagesCount();
          }
        });

        stompClient.subscribe("/user/queue/private", (message) => {
          const receivedMessage = JSON.parse(message.body);
          console.log("📩 Tin nhắn riêng tư nhận được:", receivedMessage);

          setMessages((prev) => {
            const existingMessage = prev.find(
              (msg) =>
                msg.sender === receivedMessage.sender &&
                msg.receiver === receivedMessage.receiver &&
                msg.content === receivedMessage.content &&
                msg.timestamp === receivedMessage.timestamp
            );

            if (existingMessage) {
              const updatedMessages = prev.map((msg) =>
                msg === existingMessage ? { ...msg, timestamp: receivedMessage.timestamp } : msg
              );
              localStorage.setItem(`messages_admin_${selectedCustomer}`, JSON.stringify(updatedMessages));
              return updatedMessages;
            } else {
              const updatedMessages = [...prev, receivedMessage];
              localStorage.setItem(`messages_admin_${selectedCustomer}`, JSON.stringify(updatedMessages));
              return updatedMessages;
            }
          });
        });
      },
      onStompError: (frame) => console.error("🔥 Lỗi STOMP:", frame),
      onWebSocketClose: () => console.warn("🔴 WebSocket bị đóng, thử kết nối lại..."),
    });

    stompClient.activate();
    setClient(stompClient);

    return () => stompClient.deactivate();
  }, [selectedCustomer]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);

    const token = localStorage.getItem("token");
    axios
      .post(`${API_BASE_URL}/messages/mark-read/${customer}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setTimeout(() => {
          fetchUnreadMessagesCount();
        }, 500);
      })
      .catch((error) => console.error("🔥 Lỗi khi đánh dấu tin nhắn đã đọc:", error));

    const savedMessages = localStorage.getItem(`messages_admin_${customer}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }

    axios
      .get(`${API_BASE_URL}/messages/${customer}/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setMessages((prev) => {
          const existingMessageIds = new Set(prev.map((msg) => msg.id));
          const newMessages = response.data.filter((msg) => !existingMessageIds.has(msg.id));
          const updatedMessages = [...prev, ...newMessages];
          localStorage.setItem(`messages_admin_${customer}`, JSON.stringify(updatedMessages));
          return updatedMessages;
        });
      })
      .catch((error) => console.error("🔥 Lỗi khi lấy lịch sử tin nhắn:", error));
  };

  const sendMessage = () => {
    if (!selectedCustomer) {
      alert("Vui lòng chọn khách hàng để chat!");
      return;
    }

    if (!client || !client.connected) {
      console.error("❌ STOMP client chưa kết nối, không thể gửi tin nhắn!");
      return;
    }

    if (message.trim() !== "") {
      const msg = { 
        sender: "admin", 
        receiver: selectedCustomer, 
        content: message, 
        timestamp: new Date().toISOString()
      };
      client.publish({ destination: "/app/private-message", body: JSON.stringify(msg) });
      setMessages((prev) => {
        const updatedMessages = [...prev, msg];
        localStorage.setItem(`messages_admin_${selectedCustomer}`, JSON.stringify(updatedMessages));
        return updatedMessages;
      });
      setMessage("");
    }
  };

  return (
    <div style={styles.adminChatContainer}>
      <div style={styles.customerList}>
        <h3 style={styles.header}>📢 Khách hàng đang chat</h3>
        {customers.length === 0 ? (
          <p style={styles.noCustomers}>Không có khách hàng nào</p>
        ) : (
          customers.map((customer, index) => (
            <button
              key={index}
              style={selectedCustomer === customer ? styles.customerItemActive : styles.customerItem}
              onClick={() => handleSelectCustomer(customer)}
            >
              <span>{customer}</span>
              {unreadMessages[customer] > 0 && (
                <span style={styles.unreadBadge}>{unreadMessages[customer]}</span>
              )}
            </button>
          ))
        )}
      </div>

      <div style={styles.chatBox}>
        <h2 style={styles.chatHeader}>💬 Hỗ trợ khách hàng</h2>
        <div style={styles.chatMessages} ref={chatRef}>
          {messages
            .filter((msg) => msg.sender === selectedCustomer || msg.receiver === selectedCustomer)
            .map((msg, index) => (
              <div key={index} style={msg.sender === "admin" ? styles.adminMsg : styles.userMsg}>
                <strong>{msg.sender}:</strong> {msg.content}
                <div style={styles.timestamp}>{formatTimestamp(msg.timestamp)}</div>
              </div>
            ))}
        </div>

        <div style={styles.chatInput}>
          <input
            type="text"
            placeholder="Nhập tin nhắn..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={!selectedCustomer}
            style={styles.input}
          />
          <button onClick={sendMessage} disabled={!selectedCustomer} style={styles.sendButton}>
            🚀 Gửi
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  adminChatContainer: {
    display: "flex",
    height: "500px",
    borderRadius: "10px",
    overflow: "hidden",
    background: "#1E1E1E",
    boxShadow: "0px 4px 10px rgba(255, 255, 255, 0.1)",
  },
  customerList: {
    width: "30%",
    background: "#2C2F33",
    padding: "10px",
    overflowY: "auto",
    borderRight: "2px solid #444",
  },
  header: {
    textAlign: "center",
    marginBottom: "10px",
    color: "#ffffff",
  },
  customerItem: {
    display: "block",
    width: "100%",
    padding: "10px",
    margin: "5px 0",
    textAlign: "left",
    border: "1px solid #555",
    background: "#40444B",
    color: "#ffffff",
    fontWeight: "bold",
    cursor: "pointer",
    borderRadius: "5px",
    transition: "0.3s",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  customerItemActive: {
    display: "block",
    width: "100%",
    padding: "10px",
    margin: "5px 0",
    textAlign: "left",
    border: "1px solid #7289DA",
    background: "#7289DA",
    color: "white",
    fontWeight: "bold",
    borderRadius: "5px",
  },
  noCustomers: {
    textAlign: "center",
    color: "#bbb",
    marginTop: "20px",
  },
  chatBox: {
    width: "70%",
    display: "flex",
    flexDirection: "column",
    background: "#23272A",
  },
  chatHeader: {
    background: "#7289DA",
    color: "white",
    padding: "10px",
    textAlign: "center",
  },
  chatMessages: {
    flex: 1,
    padding: "10px",
    overflowY: "auto",
    maxHeight: "400px",
  },
  adminMsg: {
    background: "#5865F2",
    color: "white",
    alignSelf: "flex-end",
    textAlign: "right",
    padding: "10px",
    margin: "5px",
    borderRadius: "10px",
    maxWidth: "70%",
    wordWrap: "break-word",
  },
  userMsg: {
    background: "#40444B",
    color: "#FFFFFF",
    alignSelf: "flex-start",
    textAlign: "left",
    padding: "10px",
    margin: "5px",
    borderRadius: "10px",
    maxWidth: "70%",
    wordWrap: "break-word",
  },
  chatInput: {
    display: "flex",
    padding: "10px",
    borderTop: "1px solid #444",
  },
  input: {
    flex: 1,
    padding: "10px",
    background: "#40444B",
    color: "#fff",
    border: "1px solid #555",
    borderRadius: "5px",
  },
  sendButton: {
    marginLeft: "10px",
    padding: "10px 15px",
    background: "#7289DA",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  unreadBadge: {
    backgroundColor: "#FF5555",
    color: "white",
    fontSize: "12px",
    fontWeight: "bold",
    padding: "2px 6px",
    borderRadius: "10px",
    marginLeft: "8px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "20px",
  },
};

export default AdminChat;