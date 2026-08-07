import React, { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/useAuth'

const Register = () => {

    const {setUser} = useAuth();

    const [form, setForm] = useState({
        email: '',
        password: '',
        password2: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        phone: '',
        gender: null,
        country: '',
        city: '',
        image: null,
        weight: 0,
        height: 0,
    })
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await axios.post("http://localhost:5000/api/auth/register", form,
                {withCredentials: true}
            );
            setUser(result.data.user);
            navigate("/dashboard");
        } catch (error) {
            setError(error.response?.data?.message || "Something went wrong. Try again.")
        }
    }

    return (
        <div>
            <div>
                <h1>Sign Up</h1>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" placeholder="example@gmail.com" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />

                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />

                    <label htmlFor="password2">Confirm Password</label>
                    <input type="password" id="password2" value={form.password2} onChange={(e) => setForm({...form, password2: e.target.value})} />

                    <label htmlFor="FirstName">First Name</label>
                    <input type="text" id="FirstName" value={form.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})} />

                    <label htmlFor="LastName">Last Name</label>
                    <input type="text" id="LastName" value={form.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})} />

                    <label htmlFor="dateOfBirth">Date of Birth</label>
                    <input type="date" id="dateOfBirth" value={form.dateOfBirth} onChange={(e) => setForm({...form, dateOfBirth: e.target.value})} />

                    <label htmlFor="phone">Phone Number</label>
                    <input type="tel" id="phone" placeholder="111-222-333" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />

                    <label>Gender</label>
                    <input type="radio" id="male" name="gender" checked={form.gender === true} onChange={(e) => setForm({...form, gender: true})} />
                    <label htmlFor="male">Male</label>
                    <input type="radio" id="female" name="gender" checked={form.gender === false} onChange={(e) => setForm({...form, gender: false})} />
                    <label htmlFor="female">Female</label>

                    <label htmlFor="country">Country</label>
                    <input type="text" id="country" value={form.country} onChange={(e) => setForm({...form, country: e.target.value})} />

                    <label htmlFor="city">City</label>
                    <input type="text" id="city" value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} />

                    {/* <label htmlFor="image">Profile Image</label>
                    <input type="file" id="image" accept="image/*" value={form.image} onChange={(e) => setForm({...form, image: e.target.value})} /> */}

                    <label htmlFor="weight">Weight (kg)</label>
                    <input type="number" id="weight" value={form.weight} onChange={(e) => setForm({...form, weight: e.target.value})} />

                    <label htmlFor="height">Height (cm)</label>
                    <input type="number" id="height" value={form.height} onChange={(e) => setForm({...form, height: e.target.value})} />


                    <button type="submit">Sign Up</button>
                </form>
            </div>
        </div>
    )
}

export default Register