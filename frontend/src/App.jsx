import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import axios from 'axios'

import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

import LoginPage from './pages/LoginPage/Login'
import RegisterPage from './pages/RegisterPage/Register'
import DashboardPage from './pages/DashboardPage/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'

function App() {
  // const [user, setUser] = useState(null);
  // const [error, setError] = useState('');
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       const result = await axios.get("http://localhost:5000/api/auth/me",
  //         {withCredentials: true}
  //       );
  //       setUser(result.data);
  //     } catch (error) {
  //       setUser(null);
  //       console.log('Could not fetch user: ' + error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  //   fetchUser();
  // }, [])

  // if (loading) {
  //   return <div><h1>Loading...</h1></div>
  // }
  // console.log(user);

  return (
    <BrowserRouter>

      <Routes>

        <Route element={<PublicRoute />}>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

      </Routes>

    </BrowserRouter>
  )
}

export default App
