import React, { useState, useEffect } from 'react';
import axiosInstance from '../admin/axiosInstance'; // Điều chỉnh đường dẫn
import API_BASE_URL from '../../../utils/config';

// CSS tùy chỉnh để làm giao diện đẹp hơn
const customStyles = `
    /* Địa chỉ mặc định */
    .address-section h3 {
        font-weight: 600;
        font-size: 1.5rem;
        color: #333;
        margin-bottom: 1.5rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .address-details .receiver-name {
        font-weight: 600;
        font-size: 1.1rem;
        color: #1a73e8;
        margin-bottom: 0.75rem; /* Giữ khoảng cách với dòng dưới */
    }

    .address-details:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    }

    .address-details p {
        margin-bottom: 0.75rem;
        font-size: 1rem;
        line-height: 1.5;
        color: #444;
    }

    .address-details .receiver-name {
        font-weight: 600;
        font-size: 1.1rem;
        color: #1a73e8;
        display: flex; /* Thay vì inline-block để căn chỉnh icon và text */
        align-items: center;
        gap: 0.5rem;
    }
    .address-details .address-info {
        font-size: 0.95rem;
        color: #555;
        display: block;
        margin-bottom: 0.5rem;
    }

    .address-details .phone-email {
        font-size: 0.9rem;
        color: #777;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .address-details .phone-email::before {
        font-family: 'Font Awesome 5 Free';
        font-weight: 900;
        font-size: 0.85rem;
        color: #1a73e8;
    }

    .address-details .phone-email.phone::before {
        content: '\\f095'; /* Icon phone */
    }

    .address-details .phone-email.email::before {
        content: '\\f0e0'; /* Icon email */
    }

    .btn-view-addresses {
        margin-top: 1rem;
        padding: 0.5rem 1.25rem;
        font-size: 0.9rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-radius: 8px;
        border: 2px solid #28a745;
        color: #28a745;
        background-color: transparent;
        transition: all 0.3s ease;
    }

    .btn-view-addresses:hover {
        background-color: #28a745;
        color: #fff;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
    }

    /* Avatar */
    .avatar-section img {
        width: 150px;
        height: 150px;
        object-fit: cover;
        border: 3px solid #e0e0e0;
        transition: border-color 0.3s ease;
    }

    .avatar-section img:hover {
        border-color: #1a73e8;
    }

    .btn-edit-avatar {
        padding: 0.5rem 1.25rem;
        font-size: 0.9rem;
        font-weight: 500;
        border-radius: 8px;
        background-color: #6c757d;
        border: none;
        color: #fff;
        transition: all 0.3s ease;
    }

    .btn-edit-avatar:hover {
        background-color: #5a6268;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
    }

    /* Modal danh sách địa chỉ */
    .modal-dialog {
        max-width: 90%;
        margin: 1.75rem auto;
    }

    @media (min-width: 576px) {
        .modal-dialog {
            max-width: 600px;
        }
    }

    @media (min-width: 768px) {
        .modal-dialog {
            max-width: 700px;
        }
    }

    .modal-content {
        border-radius: 12px;
        max-height: 85vh;
        overflow-y: auto;
        border: none;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .modal-header {
        border-bottom: 1px solid #e0e0e0;
        padding: 1.25rem;
        background-color: #f8f9fa;
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
    }

    .modal-body {
        padding: 1.5rem;
        background-color: #fff;
    }

    .modal-footer {
        border-top: 1px solid #e0e0e0;
        padding: 1rem;
        background-color: #f8f9fa;
        border-bottom-left-radius: 12px;
        border-bottom-right-radius: 12px;
    }

    /* Danh sách địa chỉ trong modal */
    .modal-body .address-item {
        padding: 1rem;
        border-radius: 10px;
        margin-bottom: 1rem;
        background-color: #fff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        border: 1px solid #e0e0e0;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .modal-body .address-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }

    .modal-body .address-item.default {
        border: 2px solid #1a73e8;
        background-color: #f0f7ff;
    }

    .modal-body .address-item p {
        margin-bottom: 0.5rem;
        font-size: 0.95rem;
        color: #444;
    }

    .modal-body .address-item .receiver-name {
        font-weight: 600;
        color: #1a73e8;
    }

    .modal-body .address-item .default-label {
        font-size: 0.85rem;
        color: #d32f2f;
        font-weight: 500;
    }

    .modal-body .btn-action {
        font-size: 0.85rem;
        padding: 0.3rem 0.75rem;
        border-radius: 6px;
        transition: all 0.3s ease;
        margin-left: 0.5rem;
    }

    .modal-body .btn-action.btn-primary {
        background-color: #1a73e8;
        border-color: #1a73e8;
    }

    .modal-body .btn-action.btn-primary:hover {
        background-color: #1557b0;
        transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(26, 115, 232, 0.3);
    }

    .modal-body .btn-action.btn-danger {
        background-color: #d32f2f;
        border-color: #d32f2f;
    }

    .modal-body .btn-action.btn-danger:hover {
        background-color: #b71c1c;
        transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(211, 47, 47, 0.3);
    }

    .modal-body .btn-action.btn-outline-primary {
        border-color: #1a73e8;
        color: #1a73e8;
    }

    .modal-body .btn-action.btn-outline-primary:hover {
        background-color: #1a73e8;
        color: #fff;
        transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(26, 115, 232, 0.3);
    }

    @media (max-width: 576px) {
        .modal-body .address-item {
            flex-direction: column;
            align-items: flex-start;
            padding: 0.75rem;
        }

        .modal-body .address-item .btn-action {
            margin-top: 0.5rem;
            margin-left: 0;
            margin-right: 0.5rem;
        }
    }

    /* Nút thêm địa chỉ mới */
    .modal-body .btn-add-new {
        border: 2px dashed #1a73e8;
        color: #1a73e8;
        background-color: transparent;
        width: 100%;
        padding: 0.75rem;
        border-radius: 8px;
        font-size: 0.95rem;
        font-weight: 500;
        transition: all 0.3s ease;
    }

    .modal-body .btn-add-new:hover {
        background-color: #f0f7ff;
        border-color: #1557b0;
        color: #1557b0;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(26, 115, 232, 0.2);
    }

    /* Form thêm/sửa địa chỉ */
    .modal-body .form-item {
        margin-bottom: 1rem;
        position: relative;
    }

    .modal-body .form-item label {
        font-size: 0.95rem;
        font-weight: 500;
        color: #333;
        margin-bottom: 0.5rem;
        display: block;
    }

    .modal-body .form-item label sup {
        color: #d32f2f;
        font-size: 0.9rem;
    }

    .modal-body .form-item input {
        font-size: 0.95rem;
        padding: 0.75rem;
        border-radius: 8px;
        border: 1px solid #ced4da;
        transition: all 0.3s ease;
    }

    .modal-body .form-item input:focus {
        border-color: #1a73e8;
        box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
    }

    .modal-body .form-item .invalid-feedback {
        font-size: 0.8rem;
        color: #d32f2f;
    }

    .modal-body .form-item .checkbox-label {
        display: flex;
        align-items: center;
        font-size: 0.95rem;
        color: #333;
    }

    .modal-body .form-item .checkbox-label input {
        margin-right: 0.5rem;
    }

    @media (max-width: 576px) {
        .modal-body .form-item input {
            font-size: 0.9rem;
            padding: 0.6rem;
        }
    }

    /* Nút trong modal footer */
    .modal-footer .btn-primary {
        background-color: #1a73e8;
        border-color: #1a73e8;
        font-size: 0.95rem;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        transition: all 0.3s ease;
    }

    .modal-footer .btn-primary:hover {
        background-color: #1557b0;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(26, 115, 232, 0.3);
    }

    .modal-footer .btn-secondary {
        background-color: #6c757d;
        border-color: #6c757d;
        font-size: 0.95rem;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        transition: all 0.3s ease;
    }

    .modal-footer .btn-secondary:hover {
        background-color: #5a6268;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
    }

    /* Responsive cho toàn bộ */
    @media (max-width: 576px) {
        .address-details {
            padding: 1rem;
        }

        .address-section h3 {
            font-size: 1.25rem;
        }

        .address-details p {
            font-size: 0.9rem;
        }

        .address-details .receiver-name {
            font-size: 1rem;
        }

        .btn-view-addresses {
            font-size: 0.8rem;
            padding: 0.4rem 1rem;
        }

        .avatar-section img {
            width: 120px;
            height: 120px;
        }

        .btn-edit-avatar {
            font-size: 0.8rem;
            padding: 0.4rem 1rem;
        }
    }
`;

function Address() {
    const [addresses, setAddresses] = useState([]); // Danh sách tất cả địa chỉ
    const [defaultAddress, setDefaultAddress] = useState(null); // Địa chỉ mặc định
    const [user, setUser] = useState({});
    const [avatarUrl, setAvatarUrl] = useState('');
    const [newAddress, setNewAddress] = useState({
        receiverName: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        phone: '',
        email: '',
        isDefault: false
    });
    const [editingAddress, setEditingAddress] = useState(null); // Địa chỉ đang chỉnh sửa
    const [showAddAddressForm, setShowAddAddressForm] = useState(false); // Hiển thị form thêm địa chỉ
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Vui lòng đăng nhập để xem thông tin địa chỉ');
            return;
        }

        const fetchData = async () => {
            try {
                const [userRes, addressRes, defaultAddressRes] = await Promise.all([
                    axiosInstance.get('/auth/user'),
                    axiosInstance.get('/addresses/view'),
                    axiosInstance.get('/addresses/default')
                ]);

                setUser(userRes.data);
                setAddresses(addressRes.data);

                if (defaultAddressRes.data) {
                    setDefaultAddress(defaultAddressRes.data);
                    setNewAddress({
                        receiverName: defaultAddressRes.data.receiverName || '',
                        addressLine1: defaultAddressRes.data.addressLine1 || '',
                        addressLine2: defaultAddressRes.data.addressLine2 || '',
                        city: defaultAddressRes.data.city || '',
                        state: defaultAddressRes.data.state || '',
                        postalCode: defaultAddressRes.data.postalCode || '',
                        country: defaultAddressRes.data.country || '',
                        phone: defaultAddressRes.data.phone || '',
                        email: defaultAddressRes.data.email || userRes.data.email || '',
                        isDefault: true
                    });
                } else if (addressRes.data.length > 0) {
                    setNewAddress({
                        receiverName: addressRes.data[0].receiverName || '',
                        addressLine1: addressRes.data[0].addressLine1 || '',
                        addressLine2: addressRes.data[0].addressLine2 || '',
                        city: addressRes.data[0].city || '',
                        state: addressRes.data[0].state || '',
                        postalCode: addressRes.data[0].postalCode || '',
                        country: addressRes.data[0].country || '',
                        phone: addressRes.data[0].phone || '',
                        email: addressRes.data[0].email || userRes.data.email || '',
                        isDefault: false
                    });
                } else {
                    setNewAddress((prev) => ({ ...prev, email: userRes.data.email || '' }));
                }
            } catch (error) {
                console.error('Error fetching data:', error.response?.status, error.response?.data);
                alert('Lỗi tải dữ liệu. Vui lòng thử lại.');
            }
        };

        fetchData();
    }, []);

    const validateForm = () => {
        const newErrors = {};
        if (!newAddress.receiverName.trim()) newErrors.receiverName = 'Tên người nhận không được để trống';
        if (!newAddress.addressLine1.trim()) newErrors.addressLine1 = 'Address Line 1 không được để trống';
        if (!newAddress.city.trim()) newErrors.city = 'City không được để trống';
        if (!newAddress.postalCode.trim()) newErrors.postalCode = 'Postal Code không được để trống';
        if (!newAddress.country.trim()) newErrors.country = 'Country không được để trống';
        if (!newAddress.phone.trim()) newErrors.phone = 'Phone không được để trống';
        if (!newAddress.email.trim()) {
            newErrors.email = 'Email không được để trống';
        } else if (!/\S+@\S+\.\S+/.test(newAddress.email)) {
            newErrors.email = 'Email không hợp lệ';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewAddress((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleCreate = async () => {
        if (!validateForm()) return;

        try {
            const response = await axiosInstance.post('/addresses/create', newAddress);
            const savedAddress = response.data;
            setAddresses([...addresses, savedAddress]);
            if (savedAddress.isDefault) {
                setDefaultAddress(savedAddress);
                setAddresses(addresses.map((addr) =>
                    addr.id === savedAddress.id ? savedAddress : { ...addr, isDefault: false }
                ));
            }
            setShowAddAddressForm(false);
            setNewAddress({
                receiverName: '',
                addressLine1: '',
                addressLine2: '',
                city: '',
                state: '',
                postalCode: '',
                country: '',
                phone: '',
                email: user.email || '',
                isDefault: false
            });
            alert('Address created successfully!');
        } catch (error) {
            console.error('Error creating address:', error.response?.status, error.response?.data);
            alert('Không thể tạo địa chỉ. Vui lòng thử lại.');
        }
    };

    const handleUpdate = async () => {
        if (!validateForm()) return;

        try {
            const response = await axiosInstance.put(`/addresses/${editingAddress.id}`, newAddress);
            const updatedAddress = response.data;
            setAddresses(addresses.map((addr) =>
                addr.id === updatedAddress.id ? updatedAddress : addr
            ));
            if (updatedAddress.isDefault) {
                setDefaultAddress(updatedAddress);
                setAddresses(addresses.map((addr) =>
                    addr.id === updatedAddress.id ? updatedAddress : { ...addr, isDefault: false }
                ));
            }
            setEditingAddress(null);
            setShowAddAddressForm(false);
            setNewAddress({
                receiverName: '',
                addressLine1: '',
                addressLine2: '',
                city: '',
                state: '',
                postalCode: '',
                country: '',
                phone: '',
                email: user.email || '',
                isDefault: false
            });
            alert('Address updated successfully!');
        } catch (error) {
            console.error('Error updating address:', error.response?.status, error.response?.data);
            alert('Không thể cập nhật địa chỉ. Vui lòng thử lại.');
        }
    };

    const handleDelete = async (addressId) => {
        if (!window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;

        try {
            await axiosInstance.delete(`/addresses/${addressId}`);
            setAddresses(addresses.filter((addr) => addr.id !== addressId));
            if (defaultAddress && defaultAddress.id === addressId) {
                setDefaultAddress(null);
            }
            alert('Address deleted successfully!');
        } catch (error) {
            console.error('Error deleting address:', error.response?.status, error.response?.data);
            alert('Không thể xóa địa chỉ. Vui lòng thử lại.');
        }
    };

    const handleSetDefault = async (addressId) => {
        try {
            const response = await axiosInstance.post(`/addresses/set-default/${addressId}`);
            const updatedAddress = response.data;
            setDefaultAddress(updatedAddress);
            setAddresses(addresses.map((addr) =>
                addr.id === updatedAddress.id ? updatedAddress : { ...addr, isDefault: false }
            ));
            alert('Địa chỉ mặc định đã được cập nhật!');
        } catch (error) {
            console.error('Error setting default address:', error.response?.status, error.response?.data);
            alert('Không thể đặt địa chỉ mặc định. Vui lòng thử lại.');
        }
    };

    const handleEdit = (addr) => {
        setEditingAddress(addr);
        setNewAddress({
            receiverName: addr.receiverName || '',
            addressLine1: addr.addressLine1 || '',
            addressLine2: addr.addressLine2 || '',
            city: addr.city || '',
            state: addr.state || '',
            postalCode: addr.postalCode || '',
            country: addr.country || '',
            phone: addr.phone || '',
            email: addr.email || '',
            isDefault: addr.isDefault || false
        });
        setShowAddAddressForm(true);
    };

    const handleAvatarChange = () => {
        axiosInstance.put('/auth/update-avatar', { avatar: avatarUrl })
            .then(response => {
                setUser({ ...user, avatar: avatarUrl });
                const modalElement = document.getElementById('avatarModal');
                const modal = window.bootstrap.Modal.getInstance(modalElement);
                modal.hide();
            })
            .catch(error => {
                console.error('Error updating avatar:', error.response?.status, error.response?.data);
                alert('Lỗi cập nhật avatar. Vui lòng thử lại.');
            });
    };

    return (
        <div className="container py-5" style={{ marginTop: '140px' }}>
            {/* Thêm CSS tùy chỉnh */}
            <style>{customStyles}</style>

            <div className="row">
                <div className="col-md-3">
                    {user.avatar && (
                        <div className="avatar-section">
                            <img src={user.avatar} alt="Avatar" className="img-fluid rounded-circle mb-4" />
                            <button
                                type="button"
                                className="btn btn-edit-avatar"
                                onClick={() => {
                                    const modal = new window.bootstrap.Modal(document.getElementById('avatarModal'));
                                    modal.show();
                                }}
                            >
                                Edit Avatar
                            </button>
                        </div>
                    )}
                </div>
                <div className="col-md-9">
                    <h1 className="mb-4">Address Information</h1>
                    {/* Hiển thị địa chỉ mặc định */}
                    <div className="address-section">
                        <h3>Địa chỉ mặc định</h3>
                        {defaultAddress ? (
                            <div className="address-details">
                                <p className="receiver-name">
                                    <i style={{color:'red', marginLeft:'20px'}}>Địa chỉ:</i> {defaultAddress.addressLine1}
                                    {defaultAddress.addressLine2 && `, ${defaultAddress.addressLine2}`}, {defaultAddress.city}, {defaultAddress.state}, {defaultAddress.postalCode}, {defaultAddress.country}
                                </p>
                                <p className="phone-email phone">
                                    Phone: {defaultAddress.phone}
                                </p>
                                <p className="phone-email email">
                                    Email: {defaultAddress.email}
                                </p>
                                <button
                                    type="button"
                                    className="btn btn-view-addresses"
                                    data-bs-toggle="modal"
                                    data-bs-target="#addressModal"
                                >
                                    Xem danh sách địa chỉ
                                </button>
                            </div>
                        ) : (
                            <div className="address-details">
                                <p>Chưa có địa chỉ mặc định. Vui lòng thêm địa chỉ mới.</p>
                                <button
                                    type="button"
                                    className="btn btn-view-addresses"
                                    data-bs-toggle="modal"
                                    data-bs-target="#addressModal"
                                >
                                    Thêm địa chỉ
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal danh sách địa chỉ */}
            <div className="modal fade" id="addressModal" tabIndex="-1" aria-labelledby="addressModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="addressModalLabel">Danh sách địa chỉ</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {/* Danh sách địa chỉ */}
                            {addresses.length === 0 ? (
                                <p>Chưa có địa chỉ nào. Vui lòng thêm địa chỉ mới.</p>
                            ) : (
                                <div>
                                    {addresses.map((addr) => (
                                        <div
                                            key={addr.id}
                                            className={`address-item d-flex justify-content-between align-items-center mb-3 ${addr.isDefault ? 'default' : ''
                                                }`}
                                        >
                                            <div>
                                                <p className="mb-1">
                                                    <span className="receiver-name">{addr.receiverName || 'Người dùng'}</span>, {addr.addressLine1}
                                                    {addr.addressLine2 && `, ${addr.addressLine2}`}, {addr.city}, {addr.state}, {addr.postalCode}, {addr.country}
                                                </p>
                                                <p className="mb-1">Phone: {addr.phone}</p>
                                                <p className="mb-1">Email: {addr.email}</p>
                                                {addr.isDefault && <p className="default-label mb-0">Mặc định</p>}
                                            </div>
                                            <div>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-action me-2"
                                                    onClick={() => handleEdit(addr)}
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-action me-2"
                                                    onClick={() => handleDelete(addr.id)}
                                                >
                                                    Xóa
                                                </button>
                                                {!addr.isDefault && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-primary btn-action"
                                                        onClick={() => handleSetDefault(addr.id)}
                                                    >
                                                        Đặt làm mặc định
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Nút thêm địa chỉ mới */}
                            <button
                                type="button"
                                className="btn btn-add-new mb-3"
                                onClick={() => {
                                    setShowAddAddressForm(!showAddAddressForm);
                                    setEditingAddress(null);
                                    setNewAddress({
                                        receiverName: '',
                                        addressLine1: '',
                                        addressLine2: '',
                                        city: '',
                                        state: '',
                                        postalCode: '',
                                        country: '',
                                        phone: '',
                                        email: user.email || '',
                                        isDefault: false
                                    });
                                }}
                            >
                                <i className="fas fa-plus me-2"></i> Thêm địa chỉ mới
                            </button>

                            {/* Form thêm/sửa địa chỉ */}
                            {showAddAddressForm && (
                                <div className="mt-4">
                                    <div className="form-item w-100">
                                        <label className="form-label">Tên người nhận<sup>*</sup></label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.receiverName ? 'is-invalid' : ''}`}
                                            name="receiverName"
                                            value={newAddress.receiverName}
                                            onChange={handleChange}
                                        />
                                        {errors.receiverName && <div className="invalid-feedback">{errors.receiverName}</div>}
                                    </div>
                                    <div className="form-item w-100">
                                        <label className="form-label">Address Line 1<sup>*</sup></label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.addressLine1 ? 'is-invalid' : ''}`}
                                            name="addressLine1"
                                            value={newAddress.addressLine1}
                                            onChange={handleChange}
                                        />
                                        {errors.addressLine1 && <div className="invalid-feedback">{errors.addressLine1}</div>}
                                    </div>
                                    <div className="form-item w-100">
                                        <label className="form-label">Address Line 2</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="addressLine2"
                                            value={newAddress.addressLine2}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-item w-100">
                                        <label className="form-label">City<sup>*</sup></label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                                            name="city"
                                            value={newAddress.city}
                                            onChange={handleChange}
                                        />
                                        {errors.city && <div className="invalid-feedback">{errors.city}</div>}
                                    </div>
                                    <div className="form-item w-100">
                                        <label className="form-label">State</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="state"
                                            value={newAddress.state}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-item w-100">
                                        <label className="form-label">Postal Code<sup>*</sup></label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.postalCode ? 'is-invalid' : ''}`}
                                            name="postalCode"
                                            value={newAddress.postalCode}
                                            onChange={handleChange}
                                        />
                                        {errors.postalCode && <div className="invalid-feedback">{errors.postalCode}</div>}
                                    </div>
                                    <div className="form-item w-100">
                                        <label className="form-label">Country<sup>*</sup></label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.country ? 'is-invalid' : ''}`}
                                            name="country"
                                            value={newAddress.country}
                                            onChange={handleChange}
                                        />
                                        {errors.country && <div className="invalid-feedback">{errors.country}</div>}
                                    </div>
                                    <div className="form-item w-100">
                                        <label className="form-label">Phone<sup>*</sup></label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                            name="phone"
                                            value={newAddress.phone}
                                            onChange={handleChange}
                                        />
                                        {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                                    </div>
                                    <div className="form-item w-100">
                                        <label className="form-label">Email<sup>*</sup></label>
                                        <input
                                            type="email"
                                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                            name="email"
                                            value={newAddress.email}
                                            onChange={handleChange}
                                        />
                                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                    </div>
                                    <div className="form-item">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                name="isDefault"
                                                checked={newAddress.isDefault}
                                                onChange={handleChange}
                                                className="me-2"
                                            />
                                            Đặt làm địa chỉ mặc định
                                        </label>
                                    </div>
                                    <div className="row g-4 text-center align-items-center justify-content-center pt-4">
                                        {editingAddress ? (
                                            <button
                                                type="button"
                                                className="btn btn-primary py-3 px-4 text-uppercase w-100"
                                                onClick={handleUpdate}
                                            >
                                                Cập nhật địa chỉ
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                className="btn btn-primary py-3 px-4 text-uppercase w-100"
                                                onClick={handleCreate}
                                            >
                                                Lưu địa chỉ
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal cập nhật avatar */}
            <div className="modal fade" id="avatarModal" tabIndex="-1" aria-labelledby="avatarModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="avatarModalLabel">Sửa Avatar            </h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter new avatar URL"
                                value={avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                            />
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                                Close
                            </button>
                            <button type="button" className="btn btn-primary" onClick={handleAvatarChange}>
                                Save changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Address; 