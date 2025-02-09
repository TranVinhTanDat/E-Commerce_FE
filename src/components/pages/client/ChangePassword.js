import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../../utils/config';
import { toast } from 'react-toastify';

const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("❌ New password and confirmation do not match!");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/auth/change-password`, 
                { currentPassword, newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("✅ Password changed successfully!");
            setTimeout(() => navigate('/'), 2000); // Chuyển hướng sau khi thành công
        } catch (error) {
            toast.error(error.response?.data || "⚠️ Failed to change password");
        }
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <h2 style={styles.title}>🔒 Change Password</h2>
                <form onSubmit={handleChangePassword} style={styles.form}>
                    <label style={styles.label}>Current Password</label>
                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required style={styles.input} />
                    
                    <label style={styles.label}>New Password</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required style={styles.input} />
                    
                    <label style={styles.label}>Confirm New Password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={styles.input} />

                    <button type="submit" style={styles.button}>🔄 Update Password</button>
                </form>
            </div>
        </div>
    );
};

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
        padding: '25px',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.2)',
        textAlign: 'center',
    },
    title: {
        marginBottom: '20px',
        fontSize: '22px',
        fontWeight: 'bold',
        color: '#333',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    label: {
        fontWeight: 'bold',
        textAlign: 'left',
        fontSize: '14px',
        color: '#555',
    },
    input: {
        padding: '10px',
        fontSize: '14px',
        borderRadius: '6px',
        border: '1px solid #ccc',
        outline: 'none',
        transition: 'border 0.3s ease-in-out',
    },
    button: {
        backgroundColor: '#ff4d4f',
        color: 'white',
        padding: '12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '14px',
        border: 'none',
        transition: 'background 0.3s ease-in-out',
    },
};

export default ChangePassword;
