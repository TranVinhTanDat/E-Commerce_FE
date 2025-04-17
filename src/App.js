import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import 'remixicon/fonts/remixicon.css';

import ClientNavbar from './components/layout/client/Navbar'; 
import ClientFooter from './components/layout/client/Footer'; 
import AdminLayout from './components/layout/admin/AdminLayout'; // Import AdminLayout


// Client
import Main from './components/pages/client/Main';
import Shop from './components/pages/client/Shop'; 
import Cart from './components/pages/client/Cart'; 
import Contact from './components/pages/client/Contact'; 
import NotFound from './components/pages/client/NotFound';
import Checkout from './components/pages/client/Checkout';
import ShopDetail from './components/pages/client/ShopDetail';
import Testimonial from './components/pages/client/Testimonial';
import Register from './components/pages/client/Register'; 
import Login from './components/pages/client/Login'; 
import Address from './components/pages/client/Address'; 
import OrderHistory from './components/pages/client/OrderHistory';
import QRBank from './components/pages/client/QRBank'; 
import QrMomo from './components/pages/client/QrMomo'; 
import Posts from './components/pages/client/Posts';
import ChangePassword from './components/pages/client/ChangePassword';
import ForgotPassword from './components/pages/client/ForgotPassword';
import VerifyOtp from './components/pages/client/VerifyOtp';
import ResetPassword from './components/pages/client/ResetPassword';
// import ChatClient from './components/pages/client/ChatClient';

// Admin
import AdminOrderList from './components/pages/admin/AdminOrderList'; 
import ShipperOrderList from './components/pages/admin/ShipperOrderList'; 
import ThankYou from './components/pages/client/ThankYou'; 
import AdminDashboard from './components/pages/admin/AdminDashboard'; 
import { ToastContainer } from 'react-toastify';
import ProductList from './components/pages/admin/ProductList';
import AdminCustomers from './components/pages/admin/AdminCustomers';
import AdminChat from './components/pages/admin/AdminChat';


// import ProductListExample from './components/pages/admin/ProductListExample';




function App() {
    const location = useLocation();
    const isAuthPage = location.pathname === '/register' || location.pathname === '/login';

    return (
        <div>
            {location.pathname.startsWith('/admin') ? (  // Kiểm tra xem có phải là trang admin không
                <AdminLayout>  {/* Sử dụng AdminLayout cho các trang admin */}
                    <Routes>
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        <Route path="/admin/orderList" element={<AdminOrderList />} />
                        <Route path="/admin/shipperOrderList" element={<ShipperOrderList />} />
                        <Route path="/admin/productList" element={<ProductList />} />
                        {/* <Route path="/admin/productListExample" element={<ProductListExample />} /> */}
                        <Route path="/admin/customers" element={<AdminCustomers />} />
                        <Route path="/admin/chat" element={<AdminChat />} />

                    </Routes>
                </AdminLayout>
            ) : (
                <>
                    {!isAuthPage && <ClientNavbar />} {/* Navbar cho trang client */}
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
                        <Route path="/ThankYou" element={<ThankYou />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />

                        <Route path="/posts" element={<Posts />} />
                        <Route path="/change-password" element={<ChangePassword />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/verify-otp" element={<VerifyOtp />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        {/* <Route path="/chat" element={<ChatClient username="customer" />} /> */}

                    </Routes>
                    {!isAuthPage && <ClientFooter />} {/* Footer cho trang client */}
                </>
            )}
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