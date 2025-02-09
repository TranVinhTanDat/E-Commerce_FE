import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import API_BASE_URL from '../../../utils/config';

function VerifyOtp() {
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Kiểm tra xem mật khẩu mới và mật khẩu xác nhận có khớp không
        if (newPassword !== confirmNewPassword) {
            toast.error('Passwords do not match!');
            return;
        }

        // Gửi OTP và mật khẩu mới lên backend
        axios.post(`${API_BASE_URL}/auth/reset-password`, { otp, newPassword, confirmNewPassword })
            .then((response) => {
                toast.success('Password reset successfully!');
                setTimeout(() => {
                    window.location.href = '/login'; // Redirect to login after password reset
                }, 1500);
            })
            .catch((error) => {
                toast.error(error.response?.data || 'Error resetting password');
            });
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <h2 style={styles.title}>Verify OTP and Reset Password</h2>
                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>OTP:</label>
                        <input 
                            type="text" 
                            value={otp} 
                            onChange={(e) => setOtp(e.target.value)} 
                            required
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>New Password:</label>
                        <input 
                            type="password" 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            required
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Confirm New Password:</label>
                        <input 
                            type="password" 
                            value={confirmNewPassword} 
                            onChange={(e) => setConfirmNewPassword(e.target.value)} 
                            required
                            style={styles.input}
                        />
                    </div>
                    <button type="submit" style={styles.button}>
                        Reset Password
                    </button>
                </form>
            </div>
            <ToastContainer />
        </div>
    );
}

const styles = {
    wrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f3f4f6',
    },
    container: {
        width: '400px',
        padding: '30px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
    },
    title: {
        marginBottom: '20px',
        fontSize: '24px',
        color: '#333',
    },
    formGroup: {
        marginBottom: '20px',
        textAlign: 'left',
    },
    label: {
        fontSize: '16px',
        color: '#555',
    },
    input: {
        width: '100%',
        padding: '12px',
        fontSize: '14px',
        borderRadius: '6px',
        border: '1px solid #ccc',
        outline: 'none',
    },
    button: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
    },
};

export default VerifyOtp;
