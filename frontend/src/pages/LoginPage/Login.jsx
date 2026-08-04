import { Link, Navigate, useNavigate } from 'react-router-dom'
import React, { useState } from 'react'
import axios from 'axios'

const Login = ({ setUser }) => {
    const [form, setForm] = useState({
        email: '',
        password: '',
    })
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await axios.post("http://localhost:5000/api/auth/login", form);
            setUser(result.data);
            navigate("/dashboard");
        } catch (error) {
            setError(error.response?.data?.message || "Something went wrong. Try again.");
        }
    }

    return (
        <div>
            <div>
                <h1>Sign In</h1>
                <form onSubmit={handleSubmit}>
                    {error && <p>{error}</p>}
                    <div>
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" placeholder="example@gmail.com" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
                    </div>
                    <div>
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />
                        <span>Don't have an account? <Link to="/register">Sign Up</Link></span>
                    </div>
                    <button type="submit">Sign In</button>
                </form>
            </div>
        </div>
    )
}

export default Login