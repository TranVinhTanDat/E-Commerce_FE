import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'; // Sử dụng GoogleOAuthProvider và GoogleLogin từ @react-oauth/google
import API_BASE_URL from '../../../utils/config';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();
    
    const handleLogin = (e) => {
        e.preventDefault();
        const user = { username, password };
        
        axios.post(`${API_BASE_URL}/auth/login`, user)
            .then(response => {
                toast.success('✅ Login successful!');
                const accessToken = response.data.accessToken;
                const userRole = response.data.role;

                localStorage.setItem('token', accessToken);
                localStorage.setItem('role', userRole);

                if (rememberMe) {
                    localStorage.setItem('rememberedUsername', username);
                    localStorage.setItem('rememberedPassword', password);
                } else {
                    localStorage.removeItem('rememberedUsername');
                    localStorage.removeItem('rememberedPassword');
                }

                setTimeout(() => {
                   // Chuyển hướng dựa trên role
                        if (userRole === 'ADMIN') {
                            navigate('/admin/dashboard');
                        } else if (userRole === 'EMPLOYEE') {
                            navigate('/admin/orderList'); // Chuyển hướng đến trang Orders cho EMPLOYEE
                        } else {
                            navigate('/'); // Trang chính cho các role khác (USER)
                        }
                }, 1500);
            })
            .catch(error => {
                const errorMessage = error.response?.data?.message || '❌ Login failed. Please try again.';
                toast.error(errorMessage);
            });
    };
    const handleGoogleLogin = (response) => {
        const token = response.credential;
        console.log("Google Token:", token); 
    
        axios.post(`${API_BASE_URL}/auth/google-login`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then((res) => {
            console.log("Google login successful", res.data);
            toast.success('✅ Google Login successful!');
    
            const { accessToken, refreshToken, expiresIn, role, id } = res.data;
            localStorage.setItem('token', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('expiresIn', expiresIn);
            localStorage.setItem('role', role);
            localStorage.setItem('userId', id);
    
            setTimeout(() => {
                navigate(role === 'ADMIN' ? '/admin/dashboard' : '/');
            }, 1500);
        })
        .catch((error) => {
            toast.error('❌ Google login failed');
            console.error(error);
        });
    };
    
    
    
    
    
    
    

    const handleGoogleFailure = (error) => {
        if (error.error === 'popup_closed_by_user') {
            toast.error('❌ Cửa sổ popup đã bị đóng trước khi hoàn tất đăng nhập.');
        } else {
            toast.error('❌ Đăng nhập Google thất bại');
        }
        console.error('Google login failed', error);
    };
    
    return (
        <GoogleOAuthProvider clientId="184747389991-utq1ies8k5e2832vdflf6i7qohbk10g6.apps.googleusercontent.com">
            <div style={styles.wrapper}>
                <div style={styles.container}>
                    <h2 style={styles.title}>🔑 Login</h2>
                    <form onSubmit={handleLogin} style={styles.form}>
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
                        <div style={styles.rememberMe}>
                            <input 
                                type="checkbox" 
                                checked={rememberMe} 
                                onChange={() => setRememberMe(!rememberMe)} 
                            />
                            <span style={styles.rememberText}>Remember Me</span>
                        </div>
                        <button type="submit" style={styles.button}>🚀 Login</button>
                    </form>
                    <GoogleLogin
                        onSuccess={handleGoogleLogin}
                        onFailure={handleGoogleFailure}
                        useOneTap
                        style={{ marginTop: '15px', width: '100%' }}
                    />

                    <div style={styles.authLinks}>
                        <Link to="/register" style={styles.link}>📝 Register</Link>
                        <Link to="/forgot-password" style={styles.link}>🔄 Forgot Password?</Link>
                    </div>
                </div>
                <ToastContainer />
            </div>
        </GoogleOAuthProvider>
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
        right: '-150px', // Đẩy icon ra sát phải ngoài cùng
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '18px',
        color: '#777',
    },
    rememberMe: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        color: '#555',
    },
    rememberText: {
        cursor: 'pointer',
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
    authLinks: {
        marginTop: '15px',
        display: 'flex',
        justifyContent: 'space-between',
    },
    link: {
        color: '#007bff',
        textDecoration: 'none',
        fontSize: '14px',
    },
};

export default Login;
