import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../../utils/config';

// CSS tùy chỉnh để làm giao diện đẹp hơn
const customStyles = `
    .address-section h3 {
        font-weight: 600;
        font-size: 1.5rem;
        color: #333;
        margin-bottom: 1.5rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .address-details {
        background-color: #fff;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border: 1px solid #e0e0e0;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
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

    .btn-change-address {
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

    .btn-change-address:hover {
        background-color: #28a745;
        color: #fff;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
    }

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

    .modal-body .address-item.selected {
        border: 2px solid #1a73e8;
        background-color: #f0f7ff;
    }

    .modal-body .address-item p {
        margin-bottom: 0.5rem;
        font-size: 0.95rem;
        color: #444;
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

    .modal-footer .btn-primary {
        background-color: #1a73e8;
        border-color: #1a73e8;
    }

    .modal-footer .btn-secondary {
        background-color: #6c757d;
        border-color: #6c757d;
    }
`;

function Checkout() {
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [defaultAddress, setDefaultAddress] = useState(null);
    const [newAddress, setNewAddress] = useState({
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        phone: '',
        email: '',
        isDefault: false,
    });
    const [editingAddress, setEditingAddress] = useState(null);
    const [showAddAddressForm, setShowAddAddressForm] = useState(false);
    const [errors, setErrors] = useState({});

    const [cartItems, setCartItems] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [subtotal, setSubtotal] = useState(0);
    const shipping = 3.00;
    const [total, setTotal] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Vui lòng đăng nhập để thanh toán');
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const [userRes, addressRes, defaultAddressRes, cartRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/auth/user`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`${API_BASE_URL}/addresses/view`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`${API_BASE_URL}/addresses/default`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`${API_BASE_URL}/cart/view`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                setAddresses(addressRes.data);

                if (defaultAddressRes.data) {
                    setDefaultAddress(defaultAddressRes.data);
                    setSelectedAddressId(defaultAddressRes.data.id);
                    setNewAddress({
                        addressLine1: defaultAddressRes.data.addressLine1 || '',
                        addressLine2: defaultAddressRes.data.addressLine2 || '',
                        city: defaultAddressRes.data.city || '',
                        state: defaultAddressRes.data.state || '',
                        postalCode: defaultAddressRes.data.postalCode || '',
                        country: defaultAddressRes.data.country || '',
                        phone: defaultAddressRes.data.phone || '',
                        email: defaultAddressRes.data.email || userRes.data.email || '',
                        isDefault: true,
                    });
                } else if (addressRes.data.length > 0) {
                    setSelectedAddressId(addressRes.data[0].id);
                    setNewAddress({
                        addressLine1: addressRes.data[0].addressLine1 || '',
                        addressLine2: addressRes.data[0].addressLine2 || '',
                        city: addressRes.data[0].city || '',
                        state: addressRes.data[0].state || '',
                        postalCode: addressRes.data[0].postalCode || '',
                        country: addressRes.data[0].country || '',
                        phone: addressRes.data[0].phone || '',
                        email: addressRes.data[0].email || userRes.data.email || '',
                        isDefault: false,
                    });
                } else {
                    setNewAddress((prev) => ({ ...prev, email: userRes.data.email || '' }));
                }

                const cartData = cartRes.data;
                setCartItems(cartData);

                let initialSubtotal = 0;
                const initialQuantities = cartData.reduce((acc, item) => {
                    acc[item.id] = item.quantity;
                    initialSubtotal += item.product.price * item.quantity;
                    return acc;
                }, {});

                setQuantities(initialQuantities);
                setSubtotal(initialSubtotal);
                setTotal(initialSubtotal + shipping);
            } catch (error) {
                console.error('Error fetching data:', error);
                alert('Không thể tải dữ liệu. Vui lòng thử lại.');
            }
        };

        fetchData();
    }, [navigate]);

    const handleAddressSelect = (addressId) => {
        setSelectedAddressId(addressId);
        const selectedAddress = addresses.find((addr) => addr.id === addressId);
        if (selectedAddress) {
            setNewAddress({
                addressLine1: selectedAddress.addressLine1 || '',
                addressLine2: selectedAddress.addressLine2 || '',
                city: selectedAddress.city || '',
                state: selectedAddress.state || '',
                postalCode: selectedAddress.postalCode || '',
                country: selectedAddress.country || '',
                phone: selectedAddress.phone || '',
                email: selectedAddress.email || '',
                isDefault: selectedAddress.isDefault,
            });
        }
        setShowAddAddressForm(false);
    };

    const handleNewAddressChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewAddress((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!newAddress.addressLine1.trim()) newErrors.addressLine1 = 'Address Line 1 không được để trống';
        if (!newAddress.city.trim()) newErrors.city = 'City không được để trống';
        if (!newAddress.state.trim()) newErrors.state = 'State không được để trống';
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

    const handleSaveAddress = async () => {
        if (!validateForm()) {
            alert('Vui lòng điền đầy đủ các trường bắt buộc.');
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${API_BASE_URL}/addresses/create`, newAddress, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const savedAddress = response.data;
            setAddresses([...addresses, savedAddress]);
            setSelectedAddressId(savedAddress.id);
            setShowAddAddressForm(false);
            if (savedAddress.isDefault) {
                setDefaultAddress(savedAddress);
            }
            alert('Địa chỉ đã được lưu thành công!');
        } catch (error) {
            console.error('Error saving address:', error);
            alert('Không thể lưu địa chỉ. Vui lòng thử lại.');
        }
    };

    const handleUpdateAddress = async () => {
        if (!validateForm()) {
            alert('Vui lòng điền đầy đủ các trường bắt buộc.');
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const response = await axios.put(`${API_BASE_URL}/addresses/${editingAddress.id}`, newAddress, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const updatedAddress = response.data;
            setAddresses(addresses.map((addr) =>
                addr.id === updatedAddress.id ? updatedAddress : addr
            ));
            if (updatedAddress.isDefault) {
                setDefaultAddress(updatedAddress);
            }
            setEditingAddress(null);
            setShowAddAddressForm(false);
            setNewAddress({
                addressLine1: '',
                addressLine2: '',
                city: '',
                state: '',
                postalCode: '',
                country: '',
                phone: '',
                email: '',
                isDefault: false,
            });
            alert('Địa chỉ đã được cập nhật thành công!');
        } catch (error) {
            console.error('Error updating address:', error);
            alert('Không thể cập nhật địa chỉ. Vui lòng thử lại.');
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;

        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${API_BASE_URL}/addresses/${addressId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAddresses(addresses.filter((addr) => addr.id !== addressId));
            if (selectedAddressId === addressId) {
                setSelectedAddressId(null);
            }
            if (defaultAddress && defaultAddress.id === addressId) {
                setDefaultAddress(null);
            }
            alert('Địa chỉ đã được xóa thành công!');
        } catch (error) {
            console.error('Error deleting address:', error);
            alert('Không thể xóa địa chỉ. Vui lòng thử lại.');
        }
    };

    const handleEditAddress = (addr) => {
        setEditingAddress(addr);
        setNewAddress({
            addressLine1: addr.addressLine1 || '',
            addressLine2: addr.addressLine2 || '',
            city: addr.city || '',
            state: addr.state || '',
            postalCode: addr.postalCode || '',
            country: addr.country || '',
            phone: addr.phone || '',
            email: addr.email || '',
            isDefault: addr.isDefault || false,
        });
        setShowAddAddressForm(true);
    };

    const handleSetDefaultAddress = async (addressId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(`${API_BASE_URL}/addresses/set-default/${addressId}`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const updatedAddress = response.data;
            setDefaultAddress(updatedAddress);
            setAddresses(addresses.map((addr) =>
                addr.id === updatedAddress.id ? updatedAddress : { ...addr, isDefault: false }
            ));
            setSelectedAddressId(updatedAddress.id);
            alert('Địa chỉ mặc định đã được cập nhật!');
        } catch (error) {
            console.error('Error setting default address:', error);
            alert('Không thể đặt địa chỉ mặc định. Vui lòng thử lại.');
        }
    };

    const handlePaymentMethodChange = (e) => {
        setPaymentMethod(e.target.value);
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            alert('Vui lòng chọn hoặc thêm một địa chỉ giao hàng.');
            return;
        }

        if (!paymentMethod) {
            alert('Vui lòng chọn phương thức thanh toán');
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const orderResponse = await axios.post(
                `${API_BASE_URL}/orders/place`,
                null,
                {
                    params: { addressId: selectedAddressId },
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const orderId = orderResponse.data.id;

            if (paymentMethod === 'momo') {
                const paymentResponse = await axios.post(
                    `${API_BASE_URL}/payments/process`,
                    {
                        orderId: orderId,
                        amount: orderResponse.data.total,
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (paymentResponse.data && typeof paymentResponse.data === 'object' && paymentResponse.data.payUrl) {
                    window.location.href = paymentResponse.data.payUrl;
                } else {
                    console.error('Invalid payment URL received');
                    alert('Lỗi xử lý thanh toán. Vui lòng thử lại.');
                }
            } else if (paymentMethod === 'cod') {
                alert('Đặt hàng thành công!');
                navigate('/ThankYou');
            } else {
                alert('Vui lòng chọn phương thức thanh toán hợp lệ!');
            }
        } catch (error) {
            console.error('Error placing order:', error.response?.data || error.message);
            alert('Không thể đặt hàng. Vui lòng thử lại.');
        }
    };

    const selectedAddress = addresses.find((addr) => addr.id === selectedAddressId);

    return (
        <div>
            {/* Thêm Font Awesome để hiển thị icon */}
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
            <style>{customStyles}</style>

            {/* Single Page Header start */}
            <div className="container-fluid page-header py-5">
                <h1 className="text-center text-white display-6">Checkout</h1>
                <ol className="breadcrumb justify-content-center mb-0">
                    <li className="breadcrumb-item"><a href="#">Home</a></li>
                    <li className="breadcrumb-item"><a href="#">Pages</a></li>
                    <li className="breadcrumb-item active text-white">Checkout</li>
                </ol>
            </div>
            {/* Single Page Header End */}

            {/* Checkout Page Start */}
            <div className="container-fluid py-5">
                <div className="container py-5">
                    <h1 className="mb-4">Billing details</h1>
                    <form action="#">
                        <div className="row g-5">
                            <div className="col-md-12 col-lg-6 col-xl-7">
                                {/* Hiển thị địa chỉ giao hàng đã chọn */}
                                <div className="address-section">
                                    <h3>Địa chỉ giao hàng</h3>
                                    {selectedAddress ? (
                                        <div className="address-details">
                                            <p className="address-info"> 
                                            <i style={{color:'red', fontWeight:'bold'}}>Địa chỉ:</i> {selectedAddress.addressLine1}

                                                {selectedAddress.addressLine2 && `, ${selectedAddress.addressLine2}`}, {selectedAddress.city}, {selectedAddress.state}, {selectedAddress.postalCode}, {selectedAddress.country}
                                            </p>
                                            <p className="phone-email phone">
                                                Phone: {selectedAddress.phone}
                                            </p>
                                            <p className="phone-email email">
                                                Email: {selectedAddress.email}
                                            </p>
                                            <button
                                                type="button"
                                                className="btn btn-change-address"
                                                data-bs-toggle="modal"
                                                data-bs-target="#addressModal"
                                            >
                                                Thay đổi
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="address-details">
                                            <p>Chưa có địa chỉ giao hàng. Vui lòng thêm địa chỉ mới.</p>
                                            <button
                                                type="button"
                                                className="btn btn-change-address"
                                                data-bs-toggle="modal"
                                                data-bs-target="#addressModal"
                                            >
                                                Thêm địa chỉ
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-12 col-lg-6 col-xl-5">
                                <div className="table-responsive">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th scope="col">Products</th>
                                                <th scope="col">Name</th>
                                                <th scope="col">Price</th>
                                                <th scope="col">Quantity</th>
                                                <th scope="col">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cartItems.map((item) => (
                                                <tr key={item.id}>
                                                    <th scope="row">
                                                        <div className="d-flex align-items-center mt-2">
                                                            <img
                                                                src={item.product.image}
                                                                className="img-fluid rounded-circle"
                                                                style={{ width: '90px', height: '90px' }}
                                                                alt=""
                                                            />
                                                        </div>
                                                    </th>
                                                    <td className="py-5">{item.product.name}</td>
                                                    <td className="py-5">{item.product.price.toFixed(0)} VNĐ</td>
                                                    <td className="py-5">{quantities[item.id]}</td>
                                                    <td className="py-5">{(item.product.price * quantities[item.id]).toFixed(0)} VNĐ</td>
                                                </tr>
                                            ))}
                                            <tr>
                                                <th scope="row"></th>
                                                <td className="py-5"></td>
                                                <td className="py-5"></td>
                                                <td className="py-5">
                                                    <p className="mb-0 text-dark py-3">Subtotal</p>
                                                </td>
                                                <td className="py-5">
                                                    <div className="py-3 border-bottom border-top">
                                                        <p className="mb-0 text-dark">{subtotal.toFixed(0)} VNĐ</p>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th scope="row"></th>
                                                <td className="py-5">
                                                    <p className="mb-0 text-dark text-uppercase py-3">TOTAL</p>
                                                </td>
                                                <td className="py-5"></td>
                                                <td className="py-5"></td>
                                                <td className="py-5">
                                                    <div className="py-3 border-bottom border-top">
                                                        <p className="mb-0 text-dark">{total.toFixed(0)} VNĐ</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="row g-4 text-center align-items-center justify-content-center border-bottom py-3">
                                    <div className="col-12">
                                        <div className="form-check text-start my-3">
                                            <input
                                                type="radio"
                                                className="form-check-input bg-primary border-0"
                                                id="PaymentMethod-2"
                                                name="PaymentMethod"
                                                value="cod"
                                                onChange={handlePaymentMethodChange}
                                            />
                                            <label className="form-check-label" htmlFor="PaymentMethod-2">
                                                Cash On Delivery
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="row g-4 text-center align-items-center justify-content-center border-bottom py-3">
                                    <div className="col-12">
                                        <div className="form-check text-start my-3">
                                            <input
                                                type="radio"
                                                className="form-check-input bg-primary border-0"
                                                id="PaymentMethod-3"
                                                name="PaymentMethod"
                                                value="momo"
                                                onChange={handlePaymentMethodChange}
                                            />
                                            <label className="form-check-label" htmlFor="PaymentMethod-3">
                                                MoMo
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="row g-4 text-center align-items-center justify-content-center pt-4">
                                    <button
                                        type="button"
                                        className="btn border-secondary py-3 px-4 text-uppercase w-100 text-primary"
                                        onClick={handlePlaceOrder}
                                    >
                                        Place Order
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            {/* Checkout Page End */}

            {/* Modal chọn địa chỉ */}
            <div className="modal fade" id="addressModal" tabIndex="-1" aria-labelledby="addressModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="addressModalLabel">Địa Chỉ Của Tôi</h5>
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
                                            className={`address-item d-flex justify-content-between align-items-center mb-3 ${
                                                selectedAddressId === addr.id ? 'selected' : ''
                                            }`}
                                        >
                                            <div className="d-flex align-items-center">
                                                <input
                                                    type="radio"
                                                    name="address"
                                                    value={addr.id}
                                                    checked={selectedAddressId === addr.id}
                                                    onChange={() => handleAddressSelect(addr.id)}
                                                    className="me-3"
                                                />
                                                <div>
                                                    <p className="mb-1">
                                                        {addr.addressLine1}
                                                        {addr.addressLine2 && `, ${addr.addressLine2}`}, {addr.city}, {addr.state}, {addr.postalCode}, {addr.country}
                                                    </p>
                                                    <p className="mb-1">Phone: {addr.phone}</p>
                                                    <p className="mb-1">Email: {addr.email}</p>
                                                    {addr.isDefault && <p className="default-label mb-0">Mặc định</p>}
                                                </div>
                                            </div>
                                            <div>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-action me-2"
                                                    onClick={() => handleEditAddress(addr)}
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-action me-2"
                                                    onClick={() => handleDeleteAddress(addr.id)}
                                                >
                                                    Xóa
                                                </button>
                                                {!addr.isDefault && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-primary btn-action"
                                                        onClick={() => handleSetDefaultAddress(addr.id)}
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
                                        addressLine1: '',
                                        addressLine2: '',
                                        city: '',
                                        state: '',
                                        postalCode: '',
                                        country: '',
                                        phone: '',
                                        email: '',
                                        isDefault: false,
                                    });
                                }}
                            >
                                <i className="fas fa-plus me-2"></i> Thêm địa chỉ mới
                            </button>

                            {/* Form thêm/sửa địa chỉ */}
                            {showAddAddressForm && (
                                <div className="mt-4">
                                    <div className="row">
                                        <div className="col-md-12 col-lg-6">
                                            <div className="form-item w-100">
                                                <label className="form-label my-3">Address Line 1<sup>*</sup></label>
                                                <input
                                                    type="text"
                                                    className={`form-control ${errors.addressLine1 ? 'is-invalid' : ''}`}
                                                    name="addressLine1"
                                                    value={newAddress.addressLine1}
                                                    onChange={handleNewAddressChange}
                                                />
                                                {errors.addressLine1 && <div className="invalid-feedback">{errors.addressLine1}</div>}
                                            </div>
                                        </div>
                                        <div className="col-md-12 col-lg-6">
                                            <div className="form-item w-100">
                                                <label className="form-label my-3">Address Line 2</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="addressLine2"
                                                    value={newAddress.addressLine2}
                                                    onChange={handleNewAddressChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-item">
                                        <label className="form-label my-3">City<sup>*</sup></label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                                            name="city"
                                            value={newAddress.city}
                                            onChange={handleNewAddressChange}
                                        />
                                        {errors.city && <div className="invalid-feedback">{errors.city}</div>}
                                    </div>
                                    <div className="form-item">
                                        <label className="form-label my-3">State<sup>*</sup></label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.state ? 'is-invalid' : ''}`}
                                            name="state"
                                            value={newAddress.state}
                                            onChange={handleNewAddressChange}
                                        />
                                        {errors.state && <div className="invalid-feedback">{errors.state}</div>}
                                    </div>
                                    <div className="form-item">
                                        <label className="form-label my-3">Postal Code<sup>*</sup></label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.postalCode ? 'is-invalid' : ''}`}
                                            name="postalCode"
                                            value={newAddress.postalCode}
                                            onChange={handleNewAddressChange}
                                        />
                                        {errors.postalCode && <div className="invalid-feedback">{errors.postalCode}</div>}
                                    </div>
                                    <div className="form-item">
                                        <label className="form-label my-3">Country<sup>*</sup></label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.country ? 'is-invalid' : ''}`}
                                            name="country"
                                            value={newAddress.country}
                                            onChange={handleNewAddressChange}
                                        />
                                        {errors.country && <div className="invalid-feedback">{errors.country}</div>}
                                    </div>
                                    <div className="form-item">
                                        <label className="form-label my-3">Mobile<sup>*</sup></label>
                                        <input
                                            type="tel"
                                            className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                            name="phone"
                                            value={newAddress.phone}
                                            onChange={handleNewAddressChange}
                                        />
                                        {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                                    </div>
                                    <div className="form-item">
                                        <label className="form-label my-3">Email Address<sup>*</sup></label>
                                        <input
                                            type="email"
                                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                            name="email"
                                            value={newAddress.email}
                                            onChange={handleNewAddressChange}
                                        />
                                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                    </div>
                                    <div className="form-item">
                                        <label className="form-label my-3">
                                            <input
                                                type="checkbox"
                                                name="isDefault"
                                                checked={newAddress.isDefault}
                                                onChange={handleNewAddressChange}
                                                className="me-2"
                                            />
                                            Đặt làm địa chỉ mặc định
                                        </label>
                                    </div>
                                    <div className="row g-4 text-center align-items-center justify-content-center pt-4">
                                        {editingAddress ? (
                                            <button
                                                type="button"
                                                className="btn btn-secondary py-3 px-4 text-uppercase w-100 text-primary"
                                                onClick={handleUpdateAddress}
                                            >
                                                Cập nhật địa chỉ
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                className="btn btn-secondary py-3 px-4 text-uppercase w-100 text-primary"
                                                onClick={handleSaveAddress}
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
                                Hủy
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                data-bs-dismiss="modal"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Back to Top */}
            <a href="#" className="btn btn-primary border-3 border-primary rounded-circle back-to-top">
                <i className="fa fa-arrow-up"></i>
            </a>
        </div>
    );
}

export default Checkout;