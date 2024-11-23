import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, logout } from '../../utils/helpers';
import { AppBar, Toolbar, Typography, Button, Container, Grid, Card, CardContent, CardMedia } from '@mui/material';

const UserDashboard = () => {
    const [user, setUser] = useState(null);
    const [packages, setPackages] = useState([]); 
    const [bookingData, setBookingData] = useState({
        travelDates: '',
        numberOfTravelers: 1
    }); 
    const navigate = useNavigate();

    useEffect(() => {
        const loggedInUser = getUser();

        if (!loggedInUser || loggedInUser.role !== 'user') {
            alert('Please log in.');
            navigate('/login');
        } else {
            setUser(loggedInUser);
        }

        const fetchPackages = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/packages');
                if (!response.ok) {
                    throw new Error('Failed to fetch packages');
                }

                const data = await response.json();
                if (data.success && data.packages) {
                    setPackages(data.packages); 
                } else {
                    console.error('Failed to fetch packages:', data.message);
                }
            } catch (error) {
                console.error('Error fetching packages:', error);
            }
        };

        fetchPackages(); 
    }, [navigate]);

    const handleLogout = () => {
        logout(() => {
            navigate('/login');
        });
    };

    const handleBookNow = (pkgId) => {
        if (!user || !user._id) {
            alert('User information is missing. Please log in again.');
            return;
        }

        const selectedPackage = packages.find(pkg => pkg._id === pkgId);
        if (!selectedPackage) {
            alert('Package not found.');
            return;
        }

        navigate('/booking', {
            state: {
                packageId: selectedPackage._id,
                travelDates: bookingData.travelDates,
                numberOfTravelers: bookingData.numberOfTravelers,
                price: selectedPackage.price,
                userId: user._id 
            }
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBookingData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    return (
        <>
            {/* Navbar */}
            <AppBar position="sticky" color="primary">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        User Dashboard
                    </Typography>
                    <Button color="inherit" onClick={() => navigate('/dashboard')}>Dashboard</Button>
                    <Button color="inherit" onClick={() => navigate('/booking-history')}>Booking History</Button>
                    <Button color="inherit" onClick={handleLogout}>Logout</Button>
                </Toolbar>
            </AppBar>

            {/* Dashboard Content */}
            <Container sx={{ marginTop: '2rem' }}>
                <div className="dashboard-container">
                    {user ? (
                        <>
                            <Typography variant="h4" gutterBottom>
                                Welcome to Your Dashboard, {user.name}!
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                Your email: {user.email}
                            </Typography>

                            <div className="packages-list">
                                <Typography variant="h5" gutterBottom>
                                    Available Packages
                                </Typography>
                                {packages.length > 0 ? (
                                    <Grid container spacing={4}>
                                        {packages.map(pkg => (
                                            <Grid item xs={12} sm={6} md={4} key={pkg._id}>
                                                <Card>
                                                    <CardMedia
                                                        component="img"
                                                        height="200"
                                                        image={pkg.images[0].url}
                                                        alt={pkg.name}
                                                    />
                                                    <CardContent>
                                                        <Typography variant="h6">{pkg.name}</Typography>
                                                        <Typography variant="body2" color="textSecondary" paragraph>
                                                            {pkg.description}
                                                        </Typography>
                                                        <Typography variant="body1">
                                                            Price: ${pkg.price}
                                                        </Typography>
                                                        <Button 
                                                            variant="contained" 
                                                            color="primary" 
                                                            onClick={() => handleBookNow(pkg._id)} 
                                                            fullWidth
                                                        >
                                                            Book Now
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                ) : (
                                    <Typography>No packages available</Typography>
                                )}
                            </div>
                        </>
                    ) : (
                        <Typography>Loading...</Typography>
                    )}
                </div>
            </Container>
        </>
    );
};

export default UserDashboard;
