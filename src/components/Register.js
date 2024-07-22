import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [avatar, setAvatar] = useState('');
    const navigate = useNavigate();

    const handleRegister = (e) => {
        e.preventDefault();
        const newUser = { username, password, email, avatar };

        axios.post('http://localhost:8080/auth/register', newUser)
            .then(response => {
                toast.success('User registered successfully');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            })
            .catch(error => {
                toast.error('Registration failed: ' + error.response.data);
            });
    };

    return (
        <div className="register-container">
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
                <div className="form-group">
                    <label>Username:</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Email:</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Avatar URL:</label>
                    <input type="text" value={avatar} onChange={(e) => setAvatar(e.target.value)} required />
                </div>
                <button type="submit">Register</button>
            </form>
            <ToastContainer />
        </div>
    );
}

export default Register;
