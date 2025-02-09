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
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const fetchData = async () => {
            try {
                const [addressRes, cartRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/addresses/view`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${API_BASE_URL}/cart/view`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                if (addressRes.data.length > 0) setAddress(addressRes.data[0]);

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
            }
        };

        fetchData();
    }, []);

    const handleChange = (e) => {
        setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };
    

    const handlePaymentMethodChange = (e) => {
        setPaymentMethod(e.target.value);
    };

    const handlePlaceOrder = async () => {

        if (!address.addressLine1 || !address.city || !address.state || !address.postalCode || !address.country || !address.phone || !address.email) {
            alert('Please fill in all required fields before proceeding with the checkout.');
            return;
        }
        const token = localStorage.getItem('token');
    
        if (!paymentMethod) {
            alert('Please select a payment method');
            return;
        }
    
        try {
            // Gửi yêu cầu tạo đơn hàng
            const orderResponse = await axios.post(`${API_BASE_URL}/orders/place`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
    
            const orderId = orderResponse.data.id;
    
            if (paymentMethod === 'momo') {
                // Nếu là MoMo, gửi yêu cầu thanh toán và lấy URL
                const paymentResponse = await axios.post(`${API_BASE_URL}/payments/process`, {
                    orderId: orderId,
                    amount: orderResponse.data.total // Đảm bảo gửi đúng amount
                }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
    
                // Kiểm tra xem paymentResponse.data có phải là một đối tượng không và có thuộc tính payUrl
                if (paymentResponse.data && typeof paymentResponse.data === 'object' && paymentResponse.data.payUrl) {
                    // Nếu có payUrl, điều hướng đến trang thanh toán
                    window.location.href = paymentResponse.data.payUrl;
                } else {
                    console.error('Invalid payment URL received');
                    alert('Error processing payment. Please try again.');
                }
            } else if (paymentMethod === 'cod') {
                alert('Order placed successfully!');
                navigate('/ThankYou');
            } else {
                alert('Please select a valid payment method!');
            }
        } catch (error) {
            console.error('Error placing order:', error.response?.data || error.message);
            alert('Failed to place order. Please try again.');
        }
    };

    const handleSave = async () => {
        if (!address.addressLine1 || !address.city || !address.state || !address.postalCode || !address.country || !address.phone || !address.email) {
            alert('Please fill in all required fields.');
            return;
        }
    
        const token = localStorage.getItem('token');
        
        try {
            // Gửi yêu cầu tạo địa chỉ mới
            await axios.post(`${API_BASE_URL}/addresses/create`, address, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert('Address saved successfully!');
        } catch (error) {
            console.error('Error saving address:', error);
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
                                            <input type="text" className="form-control" name="addressLine1" value={address.addressLine1} onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="col-md-12 col-lg-6">
                                        <div className="form-item w-100">
                                            <label className="form-label my-3">Address Line 2</label>
                                            <input type="text" className="form-control" name="addressLine2" value={address.addressLine2} onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>
                                <div className="form-item">
                                    <label className="form-label my-3">City<sup>*</sup></label>
                                    <input type="text" className="form-control" name="city" value={address.city} onChange={handleChange} />
                                </div>
                                <div className="form-item">
                                    <label className="form-label my-3">State <sup>*</sup></label>
                                    <input type="text" className="form-control" name="state" value={address.state} onChange={handleChange} />
                                </div>
                                <div className="form-item">
                                    <label className="form-label my-3">Postal Code<sup>*</sup></label>
                                    <input type="text" className="form-control" name="postalCode" value={address.postalCode} onChange={handleChange} />
                                </div>
                                <div className="form-item">
                                    <label className="form-label my-3">Country<sup>*</sup></label>
                                    <input type="text" className="form-control" name="country" value={address.country} onChange={handleChange} />
                                </div>
                                <div className="form-item">
                                    <label className="form-label my-3">Postcode/Zip<sup>*</sup></label>
                                    <input type="text" className="form-control" name="country" value={address.country} onChange={handleChange} />
                                </div>
                                <div className="form-item">
                                    <label className="form-label my-3">Mobile<sup>*</sup></label>
                                    <input type="tel" className="form-control" name="phone" value={address.phone} onChange={handleChange} />
                                </div>

                                                                <div className="form-item">
                                    <label className="form-label my-3">Email Address<sup>*</sup></label>
                                    <input type="email" className="form-control" name="email" value={address.email} onChange={handleChange} />
                                </div>

                                <div className="row g-4 text-center align-items-center justify-content-center pt-4">
                                    <button type="button" className="btn btn-secondary py-3 px-4 text-uppercase w-100 text-primary" onClick={handleSave}>Save</button>
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
                                                    <td className="py-5">${item.product.price.toFixed(2)}</td>
                                                    <td className="py-5">{quantities[item.id]}</td>
                                                    <td className="py-5">${(item.product.price * quantities[item.id]).toFixed(2)}</td>
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
                                                        <p className="mb-0 text-dark">${subtotal.toFixed(2)}</p>
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
                                                        <p className="mb-0 text-dark">${total.toFixed(2)}</p>
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
