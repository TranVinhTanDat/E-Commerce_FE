import React from 'react';
import { NavLink } from 'react-router-dom';


function ThankYou() {
    return (
        <div className="container py-5 text-center" style={{ marginTop: '100px' }}>
            <div className="row">
                <div className="col-12">
                    <div className="thank-you-message p-4 shadow-sm rounded">
                        <i className="fa fa-check-circle text-success fa-3x mb-3"></i>
                        <h1 className="mb-4">Cảm ơn vì đã đặt hàng!</h1>
                        <p className="lead mb-4">Đơn hàng của bạn sẽ sớm được giao đến bạn trong 4 ngày tới.</p>
                        <NavLink to="/" className="btn btn-primary btn-lg">Quay về trang chủ</NavLink>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ThankYou;
