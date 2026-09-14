import { Link, Navigate, useNavigate } from 'react-router-dom'
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '../../hooks/useAuth'
import './Login.css'

const Login = () => {
    const {setUser} = useAuth();

    const [form, setForm] = useState({
        email: '',
        password: '',
    })
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await axios.post("http://localhost:5000/api/auth/login", form, 
                {withCredentials: true}
            );
            setUser(result.data.user);
            navigate("/dashboard");
        } catch (error) {
            setError("Something went wrong. Try again.");
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Sign In</h1>
                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && <p className="error-text">{error}</p>}
                    <div className="form-field">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" placeholder="example@gmail.com" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
                    </div>
                    <div className="form-field">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />
                        <span className="auth-switch">Don't have an account? <Link to="/register">Sign Up</Link></span>
                    </div>
                    <button className="btn btn-primary" type="submit">Sign In</button>
                </form>
            </div>
        </div>
    )
}

export default Login
