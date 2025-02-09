import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import icon mắt
import API_BASE_URL from '../../../utils/config';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false); // Mật khẩu ẩn ban đầu
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const handleRegister = (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('❌ Passwords do not match!');
            return;
        }

        const newUser = { username, password, email };

        axios.post(`${API_BASE_URL}/auth/register`, newUser)
            .then(response => {
                toast.success('✅ User registered successfully!');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            })
            .catch(error => {
                toast.error('❌ Registration failed: ' + (error.response?.data || 'Unexpected error'));
            });
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <h2 style={styles.title}>📝 Register</h2>
                <form onSubmit={handleRegister} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Username:</label>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Password:</label>
                        <div style={styles.passwordWrapper}>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                                style={styles.input}
                            />
                            <button 
                                type="button" 
                                style={styles.togglePassword} 
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Confirm Password:</label>
                        <div style={styles.passwordWrapper}>
                            <input 
                                type={showConfirmPassword ? "text" : "password"} 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                required 
                                style={styles.input}
                            />
                            <button 
                                type="button" 
                                style={styles.togglePassword} 
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email:</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            style={styles.input}
                        />
                    </div>
                    <button type="submit" style={styles.button}>🚀 Register</button>
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
    formGroup: {
        textAlign: 'left',
    },
    label: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#555',
        display: 'block',
        marginBottom: '5px',
    },
    input: {
        padding: '10px',
        fontSize: '14px',
        borderRadius: '6px',
        border: '1px solid #ccc',
        outline: 'none',
        transition: 'border 0.3s ease-in-out',
        width: '100%',
    },
    passwordWrapper: {
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        width: '100%',
    },
    togglePassword: {
        position: 'absolute',
        right: '-150px', // Đưa icon 👁️ về ngoài cùng bên phải
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '18px',
        color: '#777',
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

export default Register;
