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
import MainLayout from './components/MainLayout/MainLayout'
import Analytics from './pages/AnalyticsPage/Analytics'

function App() {

  return (
    <BrowserRouter>

      <Routes>

        <Route element={<PublicRoute />}>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />} >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path='/analytics' element={<Analytics />} />
          </Route>
        </Route>

      </Routes>

    </BrowserRouter>
  )
}

export default App
