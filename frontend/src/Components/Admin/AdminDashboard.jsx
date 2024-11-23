import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getUser, logout } from '../../utils/helpers'; // Ensure logout helper is imported
import MetaData from '../Layout/MetaData';
import { Grid, Card, CardContent, Typography, Button, Box } from '@mui/material';

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
            <Box sx={{ padding: '2rem' }}>
                <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
                <Typography variant="h6" color="textSecondary">
                    Welcome, {user?.name || 'Admin'} (Role: {user?.role})
                </Typography>

                <Grid container spacing={3} sx={{ marginTop: '2rem' }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <img src="images/package.png" alt="Packages" style={{ width: '60px', height: '60px' }} />
                                <Typography variant="h6" sx={{ marginTop: '1rem' }}>Total Packages</Typography>
                                <Typography variant="h5" color="primary">{stats.totalPackages}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <img src="images/user.png" alt="Users" style={{ width: '60px', height: '60px' }} />
                                <Typography variant="h6" sx={{ marginTop: '1rem' }}>Total Users</Typography>
                                <Typography variant="h5" color="primary">{stats.totalUsers}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <img src="images/review.png" alt="Reviews" style={{ width: '60px', height: '60px' }} />
                                <Typography variant="h6" sx={{ marginTop: '1rem' }}>Total Reviews</Typography>
                                <Typography variant="h5" color="primary">{stats.totalReviews}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <img src="images/booking.png" alt="Bookings" style={{ width: '60px', height: '60px' }} />
                                <Typography variant="h6" sx={{ marginTop: '1rem' }}>Total Bookings</Typography>
                                <Typography variant="h5" color="primary">{stats.totalBookings}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Logout Button */}
                <Box sx={{ textAlign: 'center', marginTop: '2rem' }}>
                    <Button variant="contained" color="secondary" onClick={handleLogout}>
                        Logout
                    </Button>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                    <Button variant="contained" color="primary" sx={{ margin: '0 1rem' }} component={Link} to="/package">
                        Explore Packages
                    </Button>
                    <Button variant="contained" color="secondary" sx={{ margin: '0 1rem' }} component={Link} to="/category">
                        Browse Categories
                    </Button>
                    <Button variant="contained" color="info" sx={{ margin: '0 1rem' }} component={Link} to="/user">
                        Meet Our Users
                    </Button>
                    <Button variant="contained" color="warning" sx={{ margin: '0 1rem' }} component={Link} to="/review">
                        View Reviews
                    </Button>
                </Box>
            </Box>
        </>
    );
};

export default AdminDashboard;
