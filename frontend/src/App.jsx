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
import AnalyticsPage from './pages/AnalyticsPage/Analytics'
import ProfilePage from './pages/ProfilePage/Profile'
import SecondaryLayout from './components/MainLayout/SecondaryLayout'
import CoachApplyPage from './pages/CoachApplyPage/CoachApply'
import AdminDashboard from './pages/AdminDashboardPage/AdminDashboard'
import ApplicationPage from './pages/ApplicationPage/Application'

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
            <Route path='/analytics' element={<AnalyticsPage />} />
            <Route path='/coachApply' element={<CoachApplyPage />} />
            <Route path='/adminDashboard' element={<AdminDashboard />} />
            <Route path='/profile/:userId' element={<ProfilePage />} />
            <Route path='/application/:applicationId' element={<ApplicationPage />} />
          </Route>

          <Route element={<SecondaryLayout />}>
            <Route path='/profile/' element={<ProfilePage />} />
          </Route>
        </Route>

      </Routes>

    </BrowserRouter>
  )
}

export default App
