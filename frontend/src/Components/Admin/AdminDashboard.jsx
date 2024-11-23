import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getUser, logout } from '../../utils/helpers'; // Ensure logout helper is imported
import MetaData from '../Layout/MetaData';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const user = getUser(); // Get the currently logged-in user from local storage or app state

    const [stats, setStats] = useState({
        totalPackages: 0,
        totalUsers: 0,
        totalReviews: 0,
        totalBookings: 0,
    });

    useEffect(() => {
        // Redirect if the user is not an admin
        if (!user || user.role !== 'admin') {
            navigate('/login');
        }

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
                toast.error('Failed to load admin dashboard statistics');
            }
        };

        fetchStats();
    }, [user, navigate]);

    const handleLogout = () => {
        // Show confirmation dialog before logging out
        const confirmLogout = window.confirm('Are you sure you want to logout?');
        if (confirmLogout) {
            logout(() => {
                navigate('/login'); // Redirect to login after successful logout
                toast.success('You have successfully logged out');
            });
        }
    };

    return (
        <>
            <MetaData title="Admin Dashboard" />
            <div className="dashboard-container">
                <h1 className="dashboard-title">Admin Dashboard</h1>
                <p>Welcome, {user?.name || 'Admin'} (Role: {user?.role})</p>

                <div className="stats-grid">
                    <Link to="/package" className="stat-card">
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

                {/* Logout Button */}
                <button className="logout-button" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </>
    );
};

export default AdminDashboard;
