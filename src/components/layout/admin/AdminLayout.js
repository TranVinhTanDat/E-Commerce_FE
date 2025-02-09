import React from 'react';
import Navbar from './navbar';
import Header from './header';

const AdminLayout = ({ children }) => {
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
