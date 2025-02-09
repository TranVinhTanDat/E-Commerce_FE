import React, { useEffect, useState } from "react";
import axiosInstance from "./axiosInstance";
import Modal from "react-modal";

const API_BASE_URL = "http://localhost:8080/admin/users";

Modal.setAppElement("#root");

const AdminCustomers = () => {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ username: "", email: "", role: "USER" });
    const [editUser, setEditUser] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
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
            setNewUser({ username: "", email: "", role: "USER" });
            setIsAddModalOpen(false);
            fetchUsers();
        } catch (error) {
            console.error("Error adding user:", error);
        }
    };

    // Mở modal chỉnh sửa user
    const openEditModal = (user) => {
        setEditUser(user);
        setIsEditModalOpen(true);
    };

    // Cập nhật user
    const handleEditUser = async () => {
        try {
            await axiosInstance.put(`${API_BASE_URL}/edit-user/${editUser.id}`, editUser);
            setIsEditModalOpen(false);
            fetchUsers();
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    // Xóa user
    const handleDeleteUser = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
            try {
                await axiosInstance.delete(`${API_BASE_URL}/delete-user/${id}`);
                fetchUsers();
            } catch (error) {
                console.error("Error deleting user:", error);
            }
        }
    };

    return (
        <div className="admin-customers">
            <h2>Danh sách khách hàng</h2>

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

            <button className="btn-add" onClick={() => setIsAddModalOpen(true)}> + Thêm Khách Hàng</button>

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
            <Modal isOpen={isAddModalOpen} onRequestClose={() => setIsAddModalOpen(false)} contentLabel="Thêm Khách Hàng">
                <h3>Thêm khách hàng</h3>
                <input type="text" placeholder="Tên đăng nhập" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} />
                <input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                </select>
                <button onClick={handleAddUser}>Thêm</button>
                <button onClick={() => setIsAddModalOpen(false)}>Hủy</button>
            </Modal>

            {/* Modal Chỉnh Sửa User */}
            <Modal isOpen={isEditModalOpen} onRequestClose={() => setIsEditModalOpen(false)} contentLabel="Chỉnh sửa khách hàng">
                <h3>Chỉnh sửa khách hàng</h3>
                {editUser && (
                    <>
                        <input type="text" value={editUser.username} onChange={(e) => setEditUser({ ...editUser, username: e.target.value })} />
                        <input type="email" value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} />
                        <select value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}>
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                        </select>
                        <button onClick={handleEditUser}>Cập nhật</button>
                        <button onClick={() => setIsEditModalOpen(false)}>Hủy</button>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default AdminCustomers;
