import { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

import Login from './Components/User/Login';
import Register from './Components/User/Register';
import Category from './Components/CRUD/Category';
import Package from './Components/CRUD/Package';
import User from './Components/CRUD/User';
import Review from './Components/CRUD/Review';
import Profile from './Components/User/Profile';
import Dashboard from './Components/Dashboard/Dashboard';
import UserDashboard from './Components/User/UserDashboard';
import AdminDashboard from './Components/Admin/AdminDashboard';
import BookingManagement from './Components/Admin/BookingStatus'; 
import BookingPage from './Components/User/BookingPage';
import BookingHistory from './Components/User/BookingHistory';

function App() {
  return (
    <GoogleOAuthProvider clientId="958980366765-2ikfmbalrmr9ai8mjjsurpvh0okvaarb.apps.googleusercontent.com">
      <Router> 
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Login />} /> {/* Default to login if no other route */}
          
          {/* User Routes */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/booking-history" element={<BookingHistory />} />
          
          {/* Admin Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/book" element={<BookingManagement />} />
          
          {/* CRUD Routes */}
          <Route path="/category" element={<Category />} />
          <Route path="/package" element={<Package />} />
          <Route path="/user" element={<User />} />
          <Route path="/review" element={<Review />} />

          {/* Additional User Dashboard */}
          <Route path="/user-dashboard" element={<UserDashboard />} />
        </Routes>
      </Router>
      <ToastContainer />
    </GoogleOAuthProvider>
  );
}

export default App;
