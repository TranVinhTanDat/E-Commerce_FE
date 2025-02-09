import API_BASE_URL from '../../../utils/config';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Address() {
    const [address, setAddress] = useState({
        id: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        phone: '' // Thêm thuộc tính phone
    });
    const [isNewAddress, setIsNewAddress] = useState(true); // Cờ để kiểm tra có phải địa chỉ mới hay không
    const [user, setUser] = useState({}); // Thêm state để lưu thông tin user
    const [avatarUrl, setAvatarUrl] = useState(''); // State để lưu URL avatar mới

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

        axios.get(`${API_BASE_URL}/addresses/view`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            if (response.data.length > 0) {
                setAddress(response.data[0]);
                setIsNewAddress(false); // Địa chỉ đã tồn tại
            }
        })
        .catch(error => {
            console.error('Error fetching address:', error);
        });
    }, []);

    
    const handleChange = (e) => {
        setAddress({
            ...address,
            [e.target.name]: e.target.value
        });
    };

    const handleCreate = () => {
        const token = localStorage.getItem('token');
        axios.post(`${API_BASE_URL}/addresses/create`, address, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            alert('Address created successfully!');
            setAddress(response.data);
            setIsNewAddress(false); // Địa chỉ đã được tạo
        })
        .catch(error => {
            console.error('Error creating address:', error);
        });
    };

    const handleUpdate = () => {
        const token = localStorage.getItem('token');
        axios.put(`${API_BASE_URL}/addresses/${address.id}`, address, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            alert('Address updated successfully!');
        })
        .catch(error => {
            console.error('Error updating address:', error);
        });
    };

    const handleAvatarChange = () => {
        const token = localStorage.getItem('token');
        axios.put(`${API_BASE_URL}/auth/update-avatar`, { avatar: avatarUrl }, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            setUser({ ...user, avatar: avatarUrl });
            const modalElement = document.getElementById('avatarModal');
            const modal = window.bootstrap.Modal.getInstance(modalElement);
            modal.hide();
        })
        .catch(error => {
            console.error('Error updating avatar:', error);
        });
    };
    
    
    

    return (
        <div className="container py-5" style={{ marginTop: '100px' }}>
            <div className="row">
                <div className="col-md-3">
                    {user.avatar && (
                        <>
                            <img src={user.avatar} alt="Avatar" className="img-fluid rounded-circle mb-4" />
                            <button type="button" className="btn btn-secondary mt-2" onClick={() => {
                                const modal = new window.bootstrap.Modal(document.getElementById('avatarModal'));
                                modal.show();
                            }}>Edit Avatar</button>
                        </>
                    )}
                </div>
                <div className="col-md-9">
                    <h1 className="mb-4">Address Information</h1>
                    <form>
                        <div className="form-item w-100">
                            <label className="form-label my-3">Address Line 1<sup>*</sup></label>
                            <input type="text" className="form-control" name="addressLine1" value={address.addressLine1} onChange={handleChange} />
                        </div>
                        <div className="form-item w-100">
                            <label className="form-label my-3">Address Line 2</label>
                            <input type="text" className="form-control" name="addressLine2" value={address.addressLine2} onChange={handleChange} />
                        </div>
                        <div className="form-item w-100">
                            <label className="form-label my-3">City<sup>*</sup></label>
                            <input type="text" className="form-control" name="city" value={address.city} onChange={handleChange} />
                        </div>
                        <div className="form-item w-100">
                            <label className="form-label my-3">State</label>
                            <input type="text" className="form-control" name="state" value={address.state} onChange={handleChange} />
                        </div>
                        <div className="form-item w-100">
                            <label className="form-label my-3">Postal Code<sup>*</sup></label>
                            <input type="text" className="form-control" name="postalCode" value={address.postalCode} onChange={handleChange} />
                        </div>
                        <div className="form-item w-100">
                            <label className="form-label my-3">Country<sup>*</sup></label>
                            <input type="text" className="form-control" name="country" value={address.country} onChange={handleChange} />
                        </div>
                        <div className="form-item w-100">
                            <label className="form-label my-3">Phone<sup>*</sup></label>
                            <input type="text" className="form-control" name="phone" value={address.phone} onChange={handleChange} />
                        </div>
                        {isNewAddress ? (
                            <button type="button" className="btn btn-primary mt-4" onClick={handleCreate}>Create</button>
                        ) : (
                            <button type="button" className="btn btn-primary mt-4" onClick={handleUpdate}>Update</button>
                        )}
                    </form>
                </div>
            </div>

            {/* Modal for updating avatar */}
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
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary" onClick={handleAvatarChange}>Save changes</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Address;
