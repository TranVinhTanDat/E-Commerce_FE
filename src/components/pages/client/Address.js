import React, { useState, useEffect } from 'react';
import axiosInstance from '../admin/axiosInstance'; // Điều chỉnh đường dẫn
import API_BASE_URL from '../../../utils/config';

function Address() {
    const [address, setAddress] = useState({
        id: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        phone: '',
        email: ''
    });
    const [isNewAddress, setIsNewAddress] = useState(true);
    const [user, setUser] = useState({});
    const [avatarUrl, setAvatarUrl] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Vui lòng đăng nhập để xem thông tin địa chỉ');
            return;
        }

        // Lấy thông tin người dùng
        axiosInstance.get('/auth/user')
            .then(response => {
                setUser(response.data);
                if (isNewAddress) {
                    setAddress(prev => ({ ...prev, email: response.data.email || '' }));
                }
            })
            .catch(error => {
                console.error('Error fetching user:', error.response?.status, error.response?.data);
                alert('Lỗi tải thông tin người dùng. Vui lòng thử lại.');
            });

        // Lấy danh sách địa chỉ
        axiosInstance.get('/addresses/view')
            .then(response => {
                if (response.data.length > 0) {
                    setAddress(response.data[0]); // AddressDTO tương thích
                    setIsNewAddress(false);
                }
            })
            .catch(error => {
                console.error('Error fetching address:', error.response?.status, error.response?.data);
                if (error.response?.status !== 404) { // 404 có thể là chưa có địa chỉ
                    alert('Lỗi tải danh sách địa chỉ. Vui lòng thử lại.');
                }
            });
    }, []);

    const validateForm = () => {
        const newErrors = {};
        if (!address.addressLine1.trim()) newErrors.addressLine1 = 'Address Line 1 không được để trống';
        if (!address.city.trim()) newErrors.city = 'City không được để trống';
        if (!address.postalCode.trim()) newErrors.postalCode = 'Postal Code không được để trống';
        if (!address.country.trim()) newErrors.country = 'Country không được để trống';
        if (!address.phone.trim()) newErrors.phone = 'Phone không được để trống';
        if (!address.email.trim()) {
            newErrors.email = 'Email không được để trống';
        } else if (!/\S+@\S+\.\S+/.test(address.email)) {
            newErrors.email = 'Email không hợp lệ';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        setAddress({
            ...address,
            [e.target.name]: e.target.value
        });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const handleCreate = () => {
        if (!validateForm()) return;

        axiosInstance.post('/addresses/create', address)
            .then(response => {
                // Chỉ lấy các trường cần thiết từ Address
                const { id, addressLine1, addressLine2, city, state, postalCode, country, phone, email } = response.data;
                setAddress({ id, addressLine1, addressLine2, city, state, postalCode, country, phone, email });
                setIsNewAddress(false);
                alert('Address created successfully!');
            })
            .catch(error => {
                console.error('Error creating address:', error.response?.status, error.response?.data);
                alert('Không thể tạo địa chỉ. Vui lòng thử lại.');
            });
    };

    const handleUpdate = () => {
        if (!validateForm()) return;

        axiosInstance.put(`/addresses/${address.id}`, address)
            .then(response => {
                // Cập nhật state với các trường cần thiết
                const { id, addressLine1, addressLine2, city, state, postalCode, country, phone, email } = response.data;
                setAddress({ id, addressLine1, addressLine2, city, state, postalCode, country, phone, email });
                alert('Address updated successfully!');
            })
            .catch(error => {
                console.error('Error updating address:', error.response?.status, error.response?.data);
                alert('Không thể cập nhật địa chỉ. Vui lòng thử lại.');
            });
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
        <div className="container py-5" style={{ marginTop: '100px' }}>
            <div className="row">
                <div className="col-md-3">
                    {user.avatar && (
                        <>
                            <img src={user.avatar} alt="Avatar" className="img-fluid rounded-circle mb-4" />
                            <button
                                type="button"
                                className="btn btn-secondary mt-2"
                                onClick={() => {
                                    const modal = new window.bootstrap.Modal(document.getElementById('avatarModal'));
                                    modal.show();
                                }}
                            >
                                Edit Avatar
                            </button>
                        </>
                    )}
                </div>
                <div className="col-md-9">
                    <h1 className="mb-4">Address Information</h1>
                    <form>
                        <div className="form-item w-100">
                            <label className="form-label my-3">Address Line 1<sup>*</sup></label>
                            <input
                                type="text"
                                className={`form-control ${errors.addressLine1 ? 'is-invalid' : ''}`}
                                name="addressLine1"
                                value={address.addressLine1}
                                onChange={handleChange}
                            />
                            {errors.addressLine1 && <div className="invalid-feedback">{errors.addressLine1}</div>}
                        </div>
                        <div className="form-item w-100">
                            <label className="form-label my-3">Address Line 2</label>
                            <input
                                type="text"
                                className="form-control"
                                name="addressLine2"
                                value={address.addressLine2}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-item w-100">
                            <label className="form-label my-3">City<sup>*</sup></label>
                            <input
                                type="text"
                                className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                                name="city"
                                value={address.city}
                                onChange={handleChange}
                            />
                            {errors.city && <div className="invalid-feedback">{errors.city}</div>}
                        </div>
                        <div className="form-item w-100">
                            <label className="form-label my-3">State</label>
                            <input
                                type="text"
                                className="form-control"
                                name="state"
                                value={address.state}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-item w-100">
                            <label className="form-label my-3">Postal Code<sup>*</sup></label>
                            <input
                                type="text"
                                className={`form-control ${errors.postalCode ? 'is-invalid' : ''}`}
                                name="postalCode"
                                value={address.postalCode}
                                onChange={handleChange}
                            />
                            {errors.postalCode && <div className="invalid-feedback">{errors.postalCode}</div>}
                        </div>
                        <div className="form-item w-100">
                            <label className="form-label my-3">Country<sup>*</sup></label>
                            <input
                                type="text"
                                className={`form-control ${errors.country ? 'is-invalid' : ''}`}
                                name="country"
                                value={address.country}
                                onChange={handleChange}
                            />
                            {errors.country && <div className="invalid-feedback">{errors.country}</div>}
                        </div>
                        <div className="form-item w-100">
                            <label className="form-label my-3">Phone<sup>*</sup></label>
                            <input
                                type="text"
                                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                name="phone"
                                value={address.phone}
                                onChange={handleChange}
                            />
                            {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                        </div>
                        <div className="form-item w-100">
                            <label className="form-label my-3">Email<sup>*</sup></label>
                            <input
                                type="email"
                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                name="email"
                                value={address.email}
                                onChange={handleChange}
                            />
                            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                        </div>
                        {isNewAddress ? (
                            <button type="button" className="btn btn-primary mt-4" onClick={handleCreate}>
                                Create
                            </button>
                        ) : (
                            <button type="button" className="btn btn-primary mt-4" onClick={handleUpdate}>
                                Update
                            </button>
                        )}
                    </form>
                </div>
            </div>

            <div className="modal fade" id="avatarModal" tabIndex="-1" aria-labelledby="avatarModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="avatarModalLabel">Update Avatar</h5>
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