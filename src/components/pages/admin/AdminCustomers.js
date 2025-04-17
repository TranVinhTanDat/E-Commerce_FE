import React, { useEffect, useState } from "react";
import axiosInstance from "./axiosInstance";
import Modal from "react-modal";

const API_BASE_URL = "http://localhost:8080/admin/users";

Modal.setAppElement("#root");

const AdminCustomers = () => {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ username: "", email: "", password: "", role: "USER" });
    const [editUser, setEditUser] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 9;

    // Ô tìm kiếm
    const [searchQuery, setSearchQuery] = useState("");

    const fetchUsers = async () => {
        try {
            const response = await axiosInstance.get(`${API_BASE_URL}/all`);
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
            setErrorMessage("Không thể tải danh sách khách hàng");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Lọc user theo từ khóa tìm kiếm
    const filteredUsers = users.filter(user =>
        (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Tính toán danh sách user trong trang hiện tại
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    // Chuyển trang
    const nextPage = () => {
        if (currentPage < Math.ceil(filteredUsers.length / usersPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Thêm user
    const handleAddUser = async () => {
        try {
            await axiosInstance.post(`${API_BASE_URL}/add-user`, newUser);
            setNewUser({ username: "", email: "", password: "", role: "USER" });
            setIsAddModalOpen(false);
            fetchUsers();
            alert("Thêm khách hàng thành công!");
        } catch (error) {
            console.error("Error adding user:", error);
            if (error.response) {
                setErrorMessage(error.response.data.message || "Không thể thêm khách hàng");
            } else {
                setErrorMessage("Không thể kết nối đến server");
            }
        }
    };

    // Mở modal chỉnh sửa user
    const openEditModal = (user) => {
        setEditUser({ ...user, password: "" });
        setIsEditModalOpen(true);
    };

    // Cập nhật user
    const handleEditUser = async () => {
        try {
            await axiosInstance.put(`${API_BASE_URL}/edit-user/${editUser.id}`, editUser);
            setIsEditModalOpen(false);
            fetchUsers();
            alert("Cập nhật khách hàng thành công!");
        } catch (error) {
            console.error("Error updating user:", error);
            if (error.response) {
                setErrorMessage(error.response.data.message || "Không thể cập nhật khách hàng");
            } else {
                setErrorMessage("Không thể kết nối đến server");
            }
        }
    };

    // Xóa user
    const handleDeleteUser = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
            try {
                await axiosInstance.delete(`${API_BASE_URL}/delete-user/${id}`);
                fetchUsers();
                alert("Xóa khách hàng thành công!");
            } catch (error) {
                console.error("Error deleting user:", error);
                if (error.response) {
                    setErrorMessage(error.response.data.message || "Không thể xóa khách hàng");
                } else {
                    setErrorMessage("Không thể kết nối đến server");
                }
            }
        }
    };

    return (
        <div className="admin-customers">
            <h2>Danh sách khách hàng</h2>

            {/* Hiển thị thông báo lỗi */}
            {errorMessage && (
                <div style={{ color: "red", marginBottom: "10px" }}>
                    {errorMessage}
                </div>
            )}

            {/* Ô tìm kiếm */}
            <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                    padding: "8px",
                    marginBottom: "10px",
                    width: "50%",
                    borderRadius: "5px",
                    border: "1px solid #ccc"
                }}
            />

            <button className="btn-add" onClick={() => setIsAddModalOpen(true)}>
                + Thêm
            </button>

            <table border="1">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tên đăng nhập</th>
                        <th>Email</th>
                        <th>Vai trò</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {currentUsers.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                                <button className="btn-edit" onClick={() => openEditModal(user)}>Sửa</button>
                                <button className="btn-delete" onClick={() => handleDeleteUser(user.id)}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Phân trang */}
            <div className="pagination">
                <button onClick={prevPage} disabled={currentPage === 1}>← Trước</button>
                <span>Trang {currentPage} / {Math.ceil(filteredUsers.length / usersPerPage)}</span>
                <button onClick={nextPage} disabled={currentPage === Math.ceil(filteredUsers.length / usersPerPage)}>Tiếp →</button>
            </div>

            {/* Modal Thêm User */}
            <Modal
                isOpen={isAddModalOpen}
                onRequestClose={() => setIsAddModalOpen(false)}
                style={{ overlay: modalStyles.overlay, content: modalStyles.content }}
                contentLabel="Thêm Khách Hàng"
            >
                <h3 style={modalStyles.title}>Thêm khách hàng</h3>
                <input
                    type="text"
                    placeholder="Tên đăng nhập"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    style={modalStyles.input}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    style={modalStyles.input}
                />
                <input
                    type="password"
                    placeholder="Mật khẩu"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    style={modalStyles.input}
                />
                <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    style={modalStyles.select}
                >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="EMPLOYEE">EMPLOYEE</option>
                </select>
                <div style={modalStyles.buttons}>
                    <button
                        style={modalStyles.buttonConfirm}
                        onMouseEnter={(e) => e.target.style.background = modalStyles.buttonConfirmHover.background}
                        onMouseLeave={(e) => e.target.style.background = modalStyles.buttonConfirm.background}
                        onClick={handleAddUser}
                    >
                        Thêm
                    </button>
                    <button
                        style={modalStyles.buttonCancel}
                        onMouseEnter={(e) => e.target.style.background = modalStyles.buttonCancelHover.background}
                        onMouseLeave={(e) => e.target.style.background = modalStyles.buttonCancel.background}
                        onClick={() => setIsAddModalOpen(false)}
                    >
                        Hủy
                    </button>
                </div>
            </Modal>

            {/* Modal Chỉnh Sửa User */}
            <Modal
                isOpen={isEditModalOpen}
                onRequestClose={() => setIsEditModalOpen(false)}
                style={{ overlay: modalStyles.overlay, content: modalStyles.content }}
                contentLabel="Chỉnh sửa khách hàng"
            >
                <h3 style={modalStyles.title}>Chỉnh sửa khách hàng</h3>
                {editUser && (
                    <>
                        <input
                            type="text"
                            placeholder="Tên đăng nhập"
                            value={editUser.username}
                            onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                            style={modalStyles.input}
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={editUser.email}
                            onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                            style={modalStyles.input}
                        />
                        <input
                            type="password"
                            placeholder="Mật khẩu mới (để trống nếu không đổi)"
                            value={editUser.password}
                            onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                            style={modalStyles.input}
                        />
                        <select
                            value={editUser.role}
                            onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                            style={modalStyles.select}
                        >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="EMPLOYEE">EMPLOYEE</option>
                        </select>
                        <div style={modalStyles.buttons}>
                            <button
                                style={modalStyles.buttonConfirm}
                                onMouseEnter={(e) => e.target.style.background = modalStyles.buttonConfirmHover.background}
                                onMouseLeave={(e) => e.target.style.background = modalStyles.buttonConfirm.background}
                                onClick={handleEditUser}
                            >
                                Cập nhật
                            </button>
                            <button
                                style={modalStyles.buttonCancel}
                                onMouseEnter={(e) => e.target.style.background = modalStyles.buttonCancelHover.background}
                                onMouseLeave={(e) => e.target.style.background = modalStyles.buttonCancel.background}
                                onClick={() => setIsEditModalOpen(false)}
                            >
                                Hủy
                            </button>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default AdminCustomers;

const modalStyles = {
    overlay: {
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000
    },
    content: {
        position: "relative",
        background: "white",
        padding: "20px",
        width: "400px",
        maxWidth: "90%",
        borderRadius: "10px",
        boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.2)",
        animation: "fadeIn 0.3s ease-in-out"
    },
    title: {
        textAlign: "center",
        fontSize: "22px",
        fontWeight: "bold",
        marginBottom: "15px"
    },
    input: {
        width: "100%",
        padding: "10px",
        margin: "5px 0",
        border: "1px solid #ccc",
        borderRadius: "5px",
        fontSize: "14px",
        transition: "all 0.3s ease-in-out"
    },
    inputFocus: {
        borderColor: "#4CAF50",
        boxShadow: "0 0 5px rgba(76, 175, 80, 0.5)"
    },
    select: {
        width: "100%",
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        fontSize: "14px",
        marginBottom: "10px"
    },
    buttons: {
        display: "flex",
        justifyContent: "space-between",
        marginTop: "15px"
    },
    buttonConfirm: {
        background: "#4CAF50",
        color: "white",
        padding: "10px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "14px",
        transition: "0.3s"
    },
    buttonConfirmHover: {
        background: "#388E3C"
    },
    buttonCancel: {
        background: "#d32f2f",
        color: "white",
        padding: "10px",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "14px",
        transition: "0.3s"
    },
    buttonCancelHover: {
        background: "#b71c1c"
    }
};