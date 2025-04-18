import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API_BASE_URL from '../../../utils/config';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        id: null,
        username: '',
        email: '',
        avatar: '',
        role: '',
        createdAt: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        avatar: '',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Vui lòng đăng nhập để xem thông tin cá nhân');
            navigate('/login');
            return;
        }

        axios
            .get(`${API_BASE_URL}/auth/user`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                setUser(response.data);
                setFormData({
                    username: response.data.username,
                    email: response.data.email,
                    avatar: response.data.avatar,
                });
            })
            .catch((error) => {
                console.error('Lỗi khi lấy thông tin người dùng:', error);
                if (error.response?.status === 401) {
                    toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                    localStorage.removeItem('token');
                    navigate('/login');
                } else {
                    toast.error('Không thể tải thông tin người dùng');
                }
            });
    }, [navigate]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.username.trim()) {
            newErrors.username = 'Tên người dùng không được để trống';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email không được để trống';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }
        if (!formData.avatar.trim()) {
            newErrors.avatar = 'URL ảnh đại diện không được để trống';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(
                `${API_BASE_URL}/users/edit-user/${user.id}`,
                {
                    username: formData.username,
                    email: formData.email,
                    avatar: formData.avatar,
                    role: user.role,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            // Cập nhật token nếu backend trả về token mới
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }

            if (formData.avatar !== user.avatar) {
                const avatarResponse = await axios.put(
                    `${API_BASE_URL}/auth/update-avatar`,
                    {
                        avatar: formData.avatar,
                    },
                    {
                        headers: { Authorization: `Bearer ${response.data.token || token}` },
                    }
                );

                // Cập nhật token nếu endpoint update-avatar trả về token mới
                if (avatarResponse.data?.token) {
                    localStorage.setItem('token', avatarResponse.data.token);
                }
            }

            // Cập nhật thông tin người dùng
            setUser((prev) => ({
                ...prev,
                username: formData.username,
                email: formData.email,
                avatar: formData.avatar,
            }));

            // Làm mới thông tin người dùng từ backend
            const newToken = localStorage.getItem('token');
            const userResponse = await axios.get(`${API_BASE_URL}/auth/user`, {
                headers: { Authorization: `Bearer ${newToken}` },
            });
            setUser(userResponse.data);

            // Hiển thị thông báo và chuyển về chế độ xem
            toast.success('Cập nhật thông tin thành công!', {
                onClose: () => setIsEditing(false),
                autoClose: 2000,
            });
        } catch (error) {
            console.error('Lỗi khi cập nhật thông tin:', error);
            if (error.response?.status === 401) {
                toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                const errorMessage =
                    error.response?.data?.message ||
                    error.response?.data ||
                    'Không thể cập nhật thông tin';
                toast.error(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleAvatarError = (e) => {
        e.target.src =
            'https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg';
    };

    return (
        <div className="profile-container">
            <div className="container">
                <h1 className="profile-title">Thông tin cá nhân</h1>
                <div className="row justify-content-center">
                    <div className="col-lg-6 col-md-8">
                        <div className="profile-card">
                            {!isEditing ? (
                                <div className="profile-view text-center">
                                    <img
                                        src={
                                            user.avatar ||
                                            'https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg'
                                        }
                                        alt="Avatar"
                                        className="profile-avatar"
                                        onError={handleAvatarError}
                                    />
                                    <h3 className="profile-username">{user.username}</h3>
                                    <p className="profile-info">
                                        <strong>Email:</strong> {user.email}
                                    </p>
                                    <p className="profile-info">
                                        <strong>Vai trò:</strong> {user.role}
                                    </p>
                                    <p className="profile-info">
                                        <strong>Ngày tạo:</strong>{' '}
                                        {user.createdAt
                                            ? new Date(user.createdAt).toLocaleDateString('vi-VN')
                                            : 'N/A'}
                                    </p>
                                    <button
                                        className="btn btn-primary profile-edit-btn"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        Chỉnh sửa thông tin
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="profile-form">
                                    <div className="mb-3">
                                        <label htmlFor="username" className="form-label">
                                            Tên người dùng
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${
                                                errors.username ? 'is-invalid' : ''
                                            }`}
                                            id="username"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            disabled={isLoading}
                                        />
                                        {errors.username && (
                                            <div className="invalid-feedback">{errors.username}</div>
                                        )}
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            className={`form-control ${
                                                errors.email ? 'is-invalid' : ''
                                            }`}
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            disabled={isLoading}
                                        />
                                        {errors.email && (
                                            <div className="invalid-feedback">{errors.email}</div>
                                        )}
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="avatar" className="form-label">
                                            URL ảnh đại diện
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${
                                                errors.avatar ? 'is-invalid' : ''
                                            }`}
                                            id="avatar"
                                            name="avatar"
                                            value={formData.avatar}
                                            onChange={handleInputChange}
                                            disabled={isLoading}
                                        />
                                        {errors.avatar && (
                                            <div className="invalid-feedback">{errors.avatar}</div>
                                        )}
                                        {formData.avatar && (
                                            <img
                                                src={formData.avatar}
                                                alt="Avatar Preview"
                                                className="avatar-preview mt-2"
                                                onError={handleAvatarError}
                                            />
                                        )}
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <button
                                            type="submit"
                                            className="btn btn-success"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => setIsEditing(false)}
                                            disabled={isLoading}
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;