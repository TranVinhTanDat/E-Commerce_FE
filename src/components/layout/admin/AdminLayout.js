import React from 'react';
import NavbarAdmin from './NavbarAdmin';
import NavbarEmployee from './NavbarEmployee';
import Header from './header';

const AdminLayout = ({ children }) => {
    const role = localStorage.getItem('role'); // Lấy role từ localStorage

    // Chọn navbar dựa trên role
    const Navbar = role === 'EMPLOYEE' ? NavbarEmployee : NavbarAdmin;

    return (
        <div className="layout-wrapper">
            <Navbar />
            <div className="layout-page">
                <Header />
                <div className="content-wrapper">
                    {children}
                </div>
            </div>
        </div>
    );
};



export default AdminLayout;