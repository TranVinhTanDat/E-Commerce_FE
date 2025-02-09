import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_BASE_URL from '../../../utils/config';

function ForgotPassword() {
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post(`${API_BASE_URL}/auth/forgot-password`, { email })
            .then((response) => {
                toast.success('OTP sent to your email!');
                setTimeout(() => {
                    window.location.href = '/verify-otp'; // Redirect after OTP sent
                }, 1500);
            })
            .catch((error) => {
                toast.error(error.response?.data || 'Error sending OTP');
            });
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <h2 style={styles.title}>Forgot Password</h2>
                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email Address:</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required
                            style={styles.input}
                        />
                    </div>
                    <button type="submit" style={styles.button}>
                        Send OTP
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

export default ForgotPassword;
