import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getUser, logout } from '../../utils/helpers'; // Ensure logout helper is imported
import MetaData from '../Layout/MetaData';
import { Grid, Card, CardContent, Typography, Button, Box, TextField } from '@mui/material';
import { Line } from 'react-chartjs-2'; // Chart.js Line chart component
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';


// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


const AdminDashboard = () => {
    const navigate = useNavigate();
    const user = getUser(); // Get the currently logged-in user from local storage or app state


    const [stats, setStats] = useState({
        totalPackages: 0,
        totalUsers: 0,
        totalReviews: 0,
        totalBookings: 0,
    });
    const [bookingStats, setBookingStats] = useState([]);
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: '',
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


                setBookingStats(bookingsRes.data.bookings); // Save bookings data for chart


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


    // Filter bookings based on date range
    const filterBookingsByDate = () => {
        if (dateRange.startDate && dateRange.endDate) {
            const filteredBookings = bookingStats.filter(booking => {
                const bookingDate = new Date(booking.date);
                return bookingDate >= new Date(dateRange.startDate) && bookingDate <= new Date(dateRange.endDate);
            });
            return filteredBookings;
        }
        return bookingStats;
    };


    const prepareChartData = () => {
        const filteredBookings = filterBookingsByDate();
   
        // Use the format 'YYYY-MM' to show months in a consistent way
        const monthlyData = {};
   
        // Initialize months of the year to handle all months even if no bookings exist
        const monthsOfYear = [
            "2024-01", "2024-02", "2024-03", "2024-04", "2024-05", "2024-06",
            "2024-07", "2024-08", "2024-09", "2024-10", "2024-11", "2024-12"
        ];
   
        // Initialize all months to 0 bookings
        monthsOfYear.forEach(month => {
            monthlyData[month] = { bookings: 0, revenue: 0 };
        });
   
        // Count bookings and revenue by month
        filteredBookings.forEach(booking => {
            const travelDate = new Date(booking.travelDates);
           
            // Ensure valid date
            if (isNaN(travelDate)) {
                console.warn(`Invalid date for booking: ${booking.id}, skipping this booking.`);
                return;
            }
   
            const monthKey = travelDate.toISOString().slice(0, 7); // YYYY-MM format
   
            // Increment bookings and revenue for the month
            if (monthlyData[monthKey]) {
                monthlyData[monthKey].bookings += 1;
                monthlyData[monthKey].revenue += booking.totalPrice;
            }
        });
   
        // Calculate cumulative bookings and revenue
        let cumulativeBookings = 0;
        let cumulativeRevenue = 0;
   
        const sortedMonths = monthsOfYear;  // Fixed months for the year (even those with no bookings)
        const sortedBookings = sortedMonths.map(month => {
            cumulativeBookings += monthlyData[month].bookings;
            return cumulativeBookings;
        });
   
        const sortedRevenue = sortedMonths.map(month => {
            cumulativeRevenue += monthlyData[month].revenue;
            return cumulativeRevenue;
        });
   
        return {
            labels: sortedMonths, // X-axis values (Months)
            datasets: [
                {
                    label: 'Bookings',
                    data: sortedBookings, // Y-axis values (Cumulative Bookings)
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                },
                {
                    label: 'Revenue',
                    data: sortedRevenue, // Y-axis values (Cumulative Revenue)
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: true,
                },
            ],
        };
    };
   
   
   
   




    const handleDateChange = (event) => {
        const { name, value } = event.target;
        setDateRange(prev => ({ ...prev, [name]: value }));
    };


    return (
        <>
            <MetaData title="Admin Dashboard" />
            <Box sx={{ padding: '2rem' }}>
                <Typography variant="h4" gutterBottom>WanderWise</Typography>
                <Typography variant="h6" color="textSecondary">
                    Welcome, {user?.name || 'Admin'} (Role: {user?.role})
                </Typography>


                <Grid container spacing={3} sx={{ marginTop: '2rem' }}>
    {/* Dashboard Cards (Total Packages, Users, etc.) */}
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




               


                {/* Sales Chart */}
<Box sx={{ marginTop: '3rem', maxWidth: '600px', margin: '0 auto' }}>
    <Typography variant="h5" gutterBottom>Sales (Bookings and Revenue) Over Time</Typography>
    <Line
        data={prepareChartData()}
        options={{ responsive: true }}
        height={300} // Chart height
        width={500} // Chart width
    />
</Box>




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
    <Button variant="contained" color="success" sx={{ margin: '0 1rem' }} component={Link} to="/book">
        View Bookings
    </Button>
</Box>


            </Box>
        </>
    );
};


export default AdminDashboard;
