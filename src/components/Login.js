import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        const user = { username, password };
        axios.post('http://localhost:8080/auth/login', user)
            .then(response => {
                toast.success('Login successful');
                // Save JWT and refresh token to local storage
                localStorage.setItem('token', response.data.accessToken);
                localStorage.setItem('refreshToken', response.data.refreshToken);
                // Redirect to main page
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            })
            .catch(error => {
                toast.error('Login failed: ' + error.response.data);
            });
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label>Username:</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit">Login</button>
            </form>
            <ToastContainer />
            <div className="auth-links">
                <Link to="/register">Register</Link>
                <Link to="/forgot-password">Forgot Password?</Link>
            </div>
        </div>
    );
}

export default Login;
