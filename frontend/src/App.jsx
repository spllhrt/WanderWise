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
import Home from './Components/Home';
import Navbar from './Components/Navbar/navbar';
import Dashboard from './Components/Dashboard/dashboard';
import UserDashboard from './Components/User/UserDashboard';
import AdminDashboard from './Components/Admin/AdminDashboard';
import BookingPage from './Components/User/BookingPage';
import BookingHistory from './Components/User/BookingHistory';


function App() {
  return (
    <GoogleOAuthProvider clientId="958980366765-2ikfmbalrmr9ai8mjjsurpvh0okvaarb.apps.googleusercontent.com">
      <Router> 

        <Routes>
          {/* Only include Login and Register routes */}
          <Route path="/login" element={<Login />} exact="true" />
          <Route path="/register" element={<Register />} exact="true" />
          <Route path="/category" element={<Category />} exact="true" />
          <Route path="/package" element={<Package />} exact="true" />
          <Route path="/user" element={<User />} exact="true" />
          <Route path="/review" element={<Review />} exact="true" />
          <Route path="/" element={<Home />} exact="true" />
          <Route path="/dashboard" element={<Dashboard />} exact="true" />
          <Route path="/user-dashboard" element={<UserDashboard />} exact />
          <Route path="/admin-dashboard" element={<AdminDashboard />} exact />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/booking-history" element={<BookingHistory />} />
        </Routes>
      </Router>
      <ToastContainer />
    </GoogleOAuthProvider>
  );
}


export default App;