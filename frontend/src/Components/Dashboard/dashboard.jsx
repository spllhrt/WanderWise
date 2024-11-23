import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Slider from 'react-slick';  
import './Dashboard.css';  // Updated styling


const Dashboard = () => {
    const [stats, setStats] = useState({
        totalPackages: 0,
        totalUsers: 0,
        totalReviews: 0,
        totalBookings: 0,
    });


    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [packagesRes, usersRes, reviewsRes, bookingsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/admin/packages'),
                    axios.get('http://localhost:5000/api/auth/admin/users'),
                    axios.get('http://localhost:5000/api/admin/reviews'),
                    axios.get('http://localhost:5000/api/admin/bookings'),
                ]);


                setStats({
                    totalPackages: packagesRes.data.packages.length,
                    totalUsers: usersRes.data.users.length,
                    totalReviews: reviewsRes.data.reviews.length,
                    totalBookings: bookingsRes.data.bookings.length,
                });
            } catch (err) {
                toast.error('Failed to load dashboard statistics');
            }
        };


        fetchStats();
    }, []);






    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Explore WanderWise</h1>


            <div className="promo-banner">
                <img src="images/travel1.jpg" alt="Explore new destinations" className="banner-image" />
                <div className="banner-text">
                    <h2>Discover Your Next Adventure</h2>
                    <p>Find the best packages and deals tailored just for you.</p>
                </div>
            </div>


            <div className="stats-grid">
                <Link to="/category" className="stat-card">
                    <img src="images/package.png" alt="Packages" className="stat-image" />
                    <h3>Total Packages</h3>
                    <p>{stats.totalPackages}</p>
                </Link>
                <Link to="/user" className="stat-card">
                    <img src="images/user.png" alt="Users" className="stat-image" />
                    <h3>Total Users</h3>
                    <p>{stats.totalUsers}</p>
                </Link>
                <Link to="/review" className="stat-card">
                    <img src="images/review.png" alt="Reviews" className="stat-image" />
                    <h3>Total Reviews</h3>
                    <p>{stats.totalReviews}</p>
                </Link>
                <Link to="/booking" className="stat-card">
                    <img src="images/booking.png" alt="Bookings" className="stat-image" />
                    <h3>Total Bookings</h3>
                    <p>{stats.totalBookings}</p>
                </Link>
            </div>


            <div className="action-buttons">
                <Link to="/package" className="btn btn-primary">
                    Explore Packages
                </Link>
                <Link to="/category" className="btn btn-secondary">
                    Browse Categories
                </Link>
                <Link to="/user" className="btn btn-info">
                    Meet Our Users
                </Link>
                <Link to="/review" className="btn btn-warning">
                    View Reviews
                </Link>
            </div>
        </div>
    );
};


export default Dashboard;


