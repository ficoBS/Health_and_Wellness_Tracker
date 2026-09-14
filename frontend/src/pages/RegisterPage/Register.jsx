import React, { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../hooks/useAuth'
import './Register.css'

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

    const uploadImage = async (e) => {
        const file = e.target.files[0];

        const formData = new FormData();
        formData.append("image", file)
        try {
            const result = await axios.post("http://localhost:5000/api/upload/profile_image", formData, 
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            )

            setForm({...form, image: result.data.url});
        } catch (error) {
            console.log("Failed uploading image: " + error);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card auth-card-wide">
                <h1>Sign Up</h1>
                <form className="auth-form form-grid" onSubmit={handleSubmit}>
                    <div className="form-field form-span-2">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" placeholder="example@gmail.com" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
                    </div>

                    <div className="form-field">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />
                    </div>

                    <div className="form-field">
                        <label htmlFor="password2">Confirm Password</label>
                        <input type="password" id="password2" value={form.password2} onChange={(e) => setForm({...form, password2: e.target.value})} />
                    </div>

                    <div className="form-field">
                        <label htmlFor="FirstName">First Name</label>
                        <input type="text" id="FirstName" value={form.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})} />
                    </div>

                    <div className="form-field">
                        <label htmlFor="LastName">Last Name</label>
                        <input type="text" id="LastName" value={form.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})} />
                    </div>

                    <div className="form-field">
                        <label htmlFor="dateOfBirth">Date of Birth</label>
                        <input type="date" id="dateOfBirth" value={form.dateOfBirth} onChange={(e) => setForm({...form, dateOfBirth: e.target.value})} />
                    </div>

                    <div className="form-field">
                        <label htmlFor="phone">Phone Number</label>
                        <input type="tel" id="phone" placeholder="111-222-333" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
                    </div>

                    <div className="form-field form-span-2">
                        <label>Gender</label>
                        <div className="radio-group">
                            <input type="radio" id="male" name="gender" checked={form.gender === true} onChange={(e) => setForm({...form, gender: true})} />
                            <label htmlFor="male">Male</label>
                            <input type="radio" id="female" name="gender" checked={form.gender === false} onChange={(e) => setForm({...form, gender: false})} />
                            <label htmlFor="female">Female</label>
                        </div>
                    </div>

                    <div className="form-field">
                        <label htmlFor="country">Country</label>
                        <input type="text" id="country" value={form.country} onChange={(e) => setForm({...form, country: e.target.value})} />
                    </div>

                    <div className="form-field">
                        <label htmlFor="city">City</label>
                        <input type="text" id="city" value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} />
                    </div>

                    <div className="form-field form-span-2">
                        <label htmlFor="image">Profile Image</label>
                        <input type="file" id="image" accept="image/*" onChange={uploadImage} />
                    </div>

                    <div className="form-field">
                        <label htmlFor="weight">Weight (kg)</label>
                        <input type="number" id="weight" value={form.weight} onChange={(e) => setForm({...form, weight: e.target.value})} />
                    </div>

                    <div className="form-field">
                        <label htmlFor="height">Height (cm)</label>
                        <input type="number" id="height" value={form.height} onChange={(e) => setForm({...form, height: e.target.value})} />
                    </div>

                    <div className="form-span-2">
                        <button className="btn btn-primary" type="submit">Sign Up</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Register
