import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Main from './components/Main';
import Shop from './components/Shop';
import Cart from './components/Cart';
import Contact from './components/Contact';
import NotFound from './components/NotFound';
import Checkout from './components/Checkout';
import ShopDetail from './components/ShopDetail';
import Testimonial from './components/Testimonial';
import Register from './components/Register';
import Login from './components/Login';
import Address from './components/Address';
import OrderHistory from './components/OrderHistory';
import QRBank from './components/QRBank';
import QrMomo from './components/QrMomo';
import AdminOrderList from './components/AdminOrderList';
import ShipperOrderList from './components/ShipperOrderList';
import { ToastContainer } from 'react-toastify'; // Import ToastContainer


function App() {
    const location = useLocation();
    const isAuthPage = location.pathname === '/register' || location.pathname === '/login';

    return (
        <div>
            {!isAuthPage && <Navbar />}
            <Routes>
                <Route path="/" element={<Main />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/notFound" element={<NotFound />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/shopdetail/:productId" element={<ShopDetail />} />
                <Route path="/testimonial" element={<Testimonial />} />
                <Route path="/address" element={<Address />} />
                <Route path="/orderhistory" element={<OrderHistory />} />
                <Route path="/qrbank" element={<QRBank />} />
                <Route path="/qrmomo" element={<QrMomo />} />
                <Route path="/adminorderList" element={<AdminOrderList />} />
                <Route path="/shipperorderList" element={<ShipperOrderList />} />

                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
            </Routes>
            {!isAuthPage && <Footer />}
             <ToastContainer />
        </div>
    );
}

function AppWrapper() {
    return (
        <Router>
            <App />
        </Router>
    );
}

export default AppWrapper;
