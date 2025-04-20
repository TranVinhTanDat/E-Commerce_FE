import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../../utils/config';


function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [subtotal, setSubtotal] = useState(0);
    const [shipping] = useState(3.00); // Fixed shipping value
    const [total, setTotal] = useState(0);
    const navigate = useNavigate(); // Replace useHistory with useNavigate

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            // Redirect to login page if not logged in
            window.location.href = '/login';
            return;
        }
        axios.get(`${API_BASE_URL}/cart/view`, { // Sử dụng template literals
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
            setCartItems(response.data);
            const initialQuantities = {};
            let initialSubtotal = 0;
            response.data.forEach(item => {
                initialQuantities[item.id] = item.quantity;
                initialSubtotal += item.product.price * item.quantity;
            });
            setQuantities(initialQuantities);
            setSubtotal(initialSubtotal);
            setTotal(initialSubtotal + shipping);
        })
        .catch(error => {
            console.error('Error fetching cart items:', error);
        });
    }, [shipping]);

    const updateCartQuantity = (itemId, newQuantity) => {
        const token = localStorage.getItem('token');
        axios.post(`${API_BASE_URL}/cart/update/${itemId}`, {
            quantity: newQuantity
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(() => {
            console.log('Cart item quantity updated successfully');
        })
        .catch(error => {
            console.error('Error updating cart item quantity:', error);
        });
    };

    const handleQuantityChange = (item, value) => {
        if (value < 1) return; // Ensure quantity is at least 1

        const newQuantities = {
            ...quantities,
            [item.id]: value,
        };
        setQuantities(newQuantities);

        // Update quantity on server
        updateCartQuantity(item.id, value);

        // Update subtotal and total
        let newSubtotal = 0;
        cartItems.forEach(cartItem => {
            if (cartItem.id === item.id) {
                newSubtotal += cartItem.product.price * value;
            } else {
                newSubtotal += cartItem.product.price * cartItem.quantity;
            }
        });
        setSubtotal(newSubtotal);
        setTotal(newSubtotal + shipping);
    };

    const handleRemoveItem = (itemId) => {
        const token = localStorage.getItem('token');
        axios.delete(`${API_BASE_URL}/cart/remove/${itemId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(() => {
            setCartItems(cartItems.filter(item => item.id !== itemId));
            const newQuantities = { ...quantities };
            delete newQuantities[itemId];
            setQuantities(newQuantities);

            // Update subtotal and total
            let newSubtotal = 0;
            cartItems.forEach(cartItem => {
                if (cartItem.id !== itemId) {
                    newSubtotal += cartItem.product.price * cartItem.quantity;
                }
            });
            setSubtotal(newSubtotal);
            setTotal(newSubtotal + shipping);
        })
        .catch(error => {
            console.error('Error removing item from cart:', error);
        });
    };

    const handleProceedCheckout = () => {
        navigate('/checkout');
    };
    return (
        <>
            {/* Modal Search Start */}
            <div className="modal fade" id="searchModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-fullscreen">
                    <div className="modal-content rounded-0">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Search by keyword</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body d-flex align-items-center">
                            <div className="input-group w-75 mx-auto d-flex">
                                <input type="search" className="form-control p-3" placeholder="keywords" aria-describedby="search-icon-1" />
                                <span id="search-icon-1" className="input-group-text p-3"><i className="fa fa-search"></i></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Modal Search End */}

            {/* Single Page Header start */}
            <div className="container-fluid page-header py-5">
                <h1 className="text-center text-white display-6">Cart</h1>
                <ol className="breadcrumb justify-content-center mb-0">
                    <li className="breadcrumb-item"><a href="#">Home</a></li>
                    <li className="breadcrumb-item"><a href="#">Pages</a></li>
                    <li className="breadcrumb-item active text-white">Cart</li>
                </ol>
            </div>
            {/* Single Page Header End */}

            {/* Cart Page Start */}
            <div className="container-fluid py-5">
                <div className="container py-5">
                    {cartItems.length === 0 ? (
                        <div className="text-center">
                            <h3>Chưa có item nào trong giỏ hàng</h3>
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th scope="col">Products</th>
                                            <th scope="col">Name</th>
                                            <th scope="col">Price</th>
                                            <th scope="col">Quantity</th>
                                            <th scope="col">Total</th>
                                            <th scope="col">Handle</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cartItems.map(item => (
                                            <tr key={item.id}>
                                                <th scope="row">
                                                    <div className="d-flex align-items-center">
                                                        <img src={item.product.image} className="img-fluid me-5 rounded-circle" style={{ width: '80px', height: '80px' }} alt={item.product.name} />
                                                    </div>
                                                </th>
                                                <td>
                                                    <p style={{textAlign:'left'}} className="mb-0 mt-4">{item.product.name}</p>
                                                </td>
                                                <td>
                                                    <p style={{textAlign:'left'}} className="mb-0 mt-4">{item.product.price.toFixed(0)} VNĐ</p>
                                                </td>
                                                <td>
                                                    <div className="input-group quantity mt-4" style={{ width: '100px' }}>
                                                        <div className="input-group-btn">
                                                            <button className="btn btn-sm btn-minus rounded-circle bg-light border" onClick={() => handleQuantityChange(item, Math.max(quantities[item.id] - 1, 1))}>
                                                                <i className="fa fa-minus"></i>
                                                            </button>
                                                        </div>
                                                        <input type="text" className="form-control form-control-sm text-center border-0" style={{marginBottom:'10px'}} value={quantities[item.id]} onChange={(e) => handleQuantityChange(item, e.target.value)} />
                                                        <div className="input-group-btn">
                                                            <button className="btn btn-sm btn-plus rounded-circle bg-light border" onClick={() => handleQuantityChange(item, parseInt(quantities[item.id]) + 1)}>
                                                                <i className="fa fa-plus"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <p style={{textAlign:'left'}} className="mb-0 mt-4">{(item.product.price * quantities[item.id]).toFixed(0)} VNĐ</p>
                                                </td>
                                                <td>
                                                    <button style={{borderRadius:'50%',width:'50px'}}  className="btn btn-md rounded-circle bg-light border mt-4" onClick={() => handleRemoveItem(item.id)}>
                                                        <i className="fa fa-times text-danger"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="row g-4 justify-content-end">
                                <div className="col-8"></div>
                                <div className="col-sm-8 col-md-7 col-lg-6 col-xl-4">
                                    <div className="bg-light rounded">
                                        <div className="p-4">
                                            <h1 className="display-6 mb-4">Cart <span className="fw-normal">Total</span></h1>
                                            <div className="d-flex justify-content-between mb-4">
                                                <h5 className="mb-0 me-4">Subtotal:</h5>
                                                <p className="mb-0">{subtotal.toFixed(0)} VNĐ</p>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <h5 className="mb-0 me-4">Shipping</h5>
                                                <div className="">
                                                    <p className="mb-0">Flat rate: {shipping.toFixed(0)} VNĐ</p>
                                                </div>
                                            </div>
                                            <p className="mb-0 text-end">Shipping to VietNam.</p>
                                        </div>
                                        <div className="py-4 mb-4 border-top border-bottom d-flex justify-content-between">
                                            <h5 className="mb-0 ps-4 me-4">Total</h5>
                                            <p className="mb-0 pe-4">{total.toFixed(0)} VNĐ</p>
                                        </div>
                                        <button className="btn border-secondary rounded-pill px-4 py-3 text-primary text-uppercase mb-4 ms-4" style={{width:'360px'}} type="button" onClick={handleProceedCheckout}>Proceed Checkout</button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Back to Top */}
            <a href="#" className="btn btn-primary border-3 border-primary rounded-circle back-to-top"><i className="fa fa-arrow-up"></i></a>
        </>
    );
}

export default Cart;
