import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../../utils/config';

function Checkout() {
    const [address, setAddress] = useState({
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        phone: '',
        email: ''  // Thêm trường email vào state
    });

    const [cartItems, setCartItems] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [subtotal, setSubtotal] = useState(0);
    const shipping = 3.00;
    const [total, setTotal] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [errors, setErrors] = useState({});

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Vui lòng đăng nhập để thanh toán');
            return;
        }

        const fetchData = async () => {
            try {
                const [userRes, addressRes, cartRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/auth/user`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${API_BASE_URL}/addresses/view`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${API_BASE_URL}/cart/view`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                // Nếu có địa chỉ, lấy địa chỉ đầu tiên
                if (addressRes.data.length > 0) {
                    setAddress(addressRes.data[0]);
                } else {
                    // Nếu không có địa chỉ, gán email từ user
                    setAddress(prev => ({ ...prev, email: userRes.data.email || '' }));
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
    }, []);

    const handleChange = (e) => {
        setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!address.addressLine1.trim()) {
            newErrors.addressLine1 = 'Address Line 1 không được để trống';
        }
        if (!address.city.trim()) {
            newErrors.city = 'City không được để trống';
        }
        if (!address.state.trim()) {
            newErrors.state = 'State không được để trống';
        }
        if (!address.postalCode.trim()) {
            newErrors.postalCode = 'Postal Code không được để trống';
        }
        if (!address.country.trim()) {
            newErrors.country = 'Country không được để trống';
        }
        if (!address.phone.trim()) {
            newErrors.phone = 'Phone không được để trống';
        }
        if (!address.email.trim()) {
            newErrors.email = 'Email không được để trống';
        } else if (!/\S+@\S+\.\S+/.test(address.email)) {
            newErrors.email = 'Email không hợp lệ';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handlePaymentMethodChange = (e) => {
        setPaymentMethod(e.target.value);
    };

    const handlePlaceOrder = async () => {
        if (!validateForm()) {
            alert('Vui lòng điền đầy đủ các trường bắt buộc trước khi thanh toán.');
            return;
        }

        const token = localStorage.getItem('token');

        if (!paymentMethod) {
            alert('Vui lòng chọn phương thức thanh toán');
            return;
        }

        try {
            const orderResponse = await axios.post(`${API_BASE_URL}/orders/place`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const orderId = orderResponse.data.id;

            if (paymentMethod === 'momo') {
                const paymentResponse = await axios.post(`${API_BASE_URL}/payments/process`, {
                    orderId: orderId,
                    amount: orderResponse.data.total
                }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (paymentResponse.data && typeof paymentResponse.data === 'object' && paymentResponse.data.payUrl) {
                    window.location.href = paymentResponse.data.payUrl;
                } else {
                    console.error('Invalid payment URL received');
                    alert('Lỗi xử lý thanh toán. Vui lòng thử lại.');
                }
            } else if (paymentMethod === 'cod') {
                alert('Order placed successfully!');
                navigate('/ThankYou');
            } else {
                alert('Vui lòng chọn phương thức thanh toán hợp lệ!');
            }
        } catch (error) {
            console.error('Error placing order:', error.response?.data || error.message);
            alert('Không thể đặt hàng. Vui lòng thử lại.');
        }
    };

    const handleSave = async () => {
        if (!validateForm()) {
            alert('Vui lòng điền đầy đủ các trường bắt buộc.');
            return;
        }

        const token = localStorage.getItem('token');

        try {
            await axios.post(`${API_BASE_URL}/addresses/create`, address, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert('Address saved successfully!');
        } catch (error) {
            console.error('Error saving address:', error);
            alert('Không thể lưu địa chỉ. Vui lòng thử lại.');
        }
    };

    return (
        <div>
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
                                <div className="row">
                                    <div className="col-md-12 col-lg-6">
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
                                    </div>
                                    <div className="col-md-12 col-lg-6">
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
                                    </div>
                                </div>
                                <div className="form-item">
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
                                <div className="form-item">
                                    <label className="form-label my-3">State <sup>*</sup></label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.state ? 'is-invalid' : ''}`}
                                        name="state"
                                        value={address.state}
                                        onChange={handleChange}
                                    />
                                    {errors.state && <div className="invalid-feedback">{errors.state}</div>}
                                </div>
                                <div className="form-item">
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
                                <div className="form-item">
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
                                <div className="form-item">
                                    <label className="form-label my-3">Mobile<sup>*</sup></label>
                                    <input
                                        type="tel"
                                        className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                        name="phone"
                                        value={address.phone}
                                        onChange={handleChange}
                                    />
                                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                                </div>
                                <div className="form-item">
                                    <label className="form-label my-3">Email Address<sup>*</sup></label>
                                    <input
                                        type="email"
                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                        name="email"
                                        value={address.email}
                                        onChange={handleChange}
                                    />
                                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                </div>
                                <div className="row g-4 text-center align-items-center justify-content-center pt-4">
                                    <button
                                        type="button"
                                        className="btn btn-secondary py-3 px-4 text-uppercase w-100 text-primary"
                                        onClick={handleSave}
                                    >
                                        Save
                                    </button>
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
                                            {cartItems.map(item => (
                                                <tr key={item.id}>
                                                    <th scope="row">
                                                        <div className="d-flex align-items-center mt-2">
                                                            <img src={item.product.image} className="img-fluid rounded-circle" style={{ width: '90px', height: '90px' }} alt="" />
                                                        </div>
                                                    </th>
                                                    <td className="py-5">{item.product.name}</td>
                                                    <td className="py-5">{item.product.price.toFixed(0)} VNĐ</td>
                                                    <td className="py-5">{quantities[item.id]}</td>
                                                    <td className="py-5">{(item.product.price * quantities[item.id]).toFixed(0)} VNĐ</td>
                                                </tr>
                                            ))}
                                            <tr>
                                                <th scope="row">
                                                </th>
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
                                            {/* <tr>
                                                <th scope="row">
                                                </th>
                                                <td className="py-5">
                                                    <p className="mb-0 text-dark py-4">Shipping</p>
                                                </td>
                                                <td colSpan="3" className="py-5">
                                                    <div className="form-check text-start">
                                                        <input type="radio" className="form-check-input bg-primary border-0" id="Shipping-1" name="Shipping" value="free" />
                                                        <label className="form-check-label" htmlFor="Shipping-1">Free Shipping</label>
                                                    </div>
                                                    <div className="form-check text-start">
                                                        <input type="radio" className="form-check-input bg-primary border-0" id="Shipping-2" name="Shipping" value="flat" />
                                                        <label className="form-check-label" htmlFor="Shipping-2">Flat rate: $15.00</label>
                                                    </div>
                                                    <div className="form-check text-start">
                                                        <input type="radio" className="form-check-input bg-primary border-0" id="Shipping-3" name="Shipping" value="pickup" />
                                                        <label className="form-check-label" htmlFor="Shipping-3">Local Pickup: $8.00</label>
                                                    </div>
                                                </td>
                                            </tr> */}
                                            <tr>
                                                <th scope="row">
                                                </th>
                                                <td className="py-5">
                                                    <p className="mb-0 text-dark text-uppercase py-3">TOTAL</p>
                                                </td>
                                                <td className="py-5"></td>
                                                <td className="py-5"></td>
                                                <td className="py-5">
                                                    <div className="py-3 border-bottom border-top">
                                                        <p className="mb-0 text-dark">{total.toFixed(0)}VNĐ</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="row g-4 text-center align-items-center justify-content-center border-bottom py-3">
                                    <div className="col-12">
                                        <div className="form-check text-start my-3">
                                            <input type="radio" className="form-check-input bg-primary border-0" id="PaymentMethod-2" name="PaymentMethod" value="cod" onChange={handlePaymentMethodChange} />
                                            <label className="form-check-label" htmlFor="PaymentMethod-2">Cash On Delivery</label>
                                        </div>
                                    </div>
                                </div>
                                <div className="row g-4 text-center align-items-center justify-content-center border-bottom py-3">
                                    <div className="col-12">
                                        <div className="form-check text-start my-3">
                                            <input type="radio" className="form-check-input bg-primary border-0" id="PaymentMethod-3" name="PaymentMethod" value="momo" onChange={handlePaymentMethodChange} />
                                            <label className="form-check-label" htmlFor="PaymentMethod-3">MoMo</label>
                                        </div>
                                    </div>
                                </div>
                                <div className="row g-4 text-center align-items-center justify-content-center pt-4">
                                    <button type="button" className="btn border-secondary py-3 px-4 text-uppercase w-100 text-primary" onClick={handlePlaceOrder}>Place Order</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            {/* Checkout Page End */}

            {/* Back to Top */}
            <a href="#" className="btn btn-primary border-3 border-primary rounded-circle back-to-top"><i className="fa fa-arrow-up"></i></a>
        </div>
    );
}

export default Checkout;
