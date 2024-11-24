import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getUser, logout } from '../../utils/helpers';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Container,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    CardActionArea, // Add for hover effect and clickability
} from '@mui/material';

const UserDashboard = () => {
    const [user, setUser] = useState(null);
    const [packages, setPackages] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({
        category: '',
        page: 1,
    });
    
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch user data and packages on mount
    useEffect(() => {
        const loggedInUser = getUser();
        if (!loggedInUser || loggedInUser.role !== 'user') {
            alert('Please log in.');
            navigate('/login');
            return;
        }
        setUser(loggedInUser);

        const fetchPackages = async () => {
            try {
                setLoading(true); // Start loading when fetching packages
                const { data } = await axios.get('http://localhost:5000/api/packages', {
                    params: {
                        page: filters.page,
                        ...(filters.category && { category: filters.category })
                    },
                });
                setPackages(data.packages);
                setLoading(false); // Stop loading once data is fetched
            } catch (error) {
                console.error('Error fetching packages:', error.response?.data || error.message);
                setLoading(false);
            }
        };

        fetchPackages();
    }, [filters, navigate]);

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/categories');
                setCategories(data.categories);
            } catch (error) {
                console.error('Error fetching categories:', error.response?.data || error.message);
            }
        };
        fetchCategories();
    }, []);

    const handleCategoryChange = (event) => {
        setFilters({ ...filters, category: event.target.value });
    };

    const filteredPackages = packages.filter((pkg) => {
        const inPriceRange =
            (minPrice === '' || pkg.price >= parseFloat(minPrice)) &&
            (maxPrice === '' || pkg.price <= parseFloat(maxPrice));
        
        return inPriceRange;
    });

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

        const selectedPackage = packages.find((pkg) => pkg._id === pkgId);
        if (!selectedPackage) {
            alert('Package not found.');
            return;
        }

        navigate('/booking', {
            state: {
                packageId: selectedPackage._id,
                travelDates: '',
                numberOfTravelers: 1,
                price: selectedPackage.price,
                userId: user._id,
            },
        });
    };

    return (
        <>
            {/* Navbar */}
            <AppBar position="sticky" color="primary">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        User Dashboard
                    </Typography>
                    <Button color="inherit" onClick={() => navigate('/user-dashboard')}>
                        Dashboard
                    </Button>
                    <Button color="inherit" onClick={() => navigate('/booking-history')}>
                        Booking History
                    </Button>
                    <Button color="inherit" onClick={handleLogout}>
                        Logout
                    </Button>
                    <img
                        src="/images/profile.png"
                        alt="Profile"
                        style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            marginLeft: '10px',
                            marginRight: '10px',
                            cursor: 'pointer',
                        }}
                        onClick={() => navigate('/profile')}
                    />
                </Toolbar>
            </AppBar>

            {/* Dashboard Content */}
            <Container sx={{ marginTop: '2rem' }}>
                <div className="dashboard-container">
                    {user ? (
                        <>
                           <Typography variant="h4" gutterBottom>
                            <b>Welcome to WanderWise</b>!
                            </Typography>
                            <Typography variant="body1" gutterBottom style={{ fontStyle: 'italic' }}>
                            {user.name}
                        </Typography>

                        {/* Filters and Packages Layout */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
                            {/* Filters Section */}
                            <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: '8px' }}>
                                <Typography variant="h6" gutterBottom>
                                    Filters
                                </Typography>
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        value={filters.category}
                                        label="Category"
                                        onChange={handleCategoryChange}
                                    >
                                        <MenuItem value="">All</MenuItem>
                                        {categories.map((category) => (
                                            <MenuItem key={category._id} value={category._id}>
                                                {category.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="Min Price"
                                    type="number"
                                    fullWidth
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    sx={{ mb: 2 }}
                                    InputProps={{
                                        inputProps: { min: 0 },
                                    }}
                                />
                                <TextField
                                    label="Max Price"
                                    type="number"
                                    fullWidth
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    InputProps={{
                                        inputProps: { min: 0 },
                                    }}
                                />
                            </Box>

                            {/* Packages Section */}
                            <Box>
                                <Typography variant="h5" gutterBottom>
                                    Available Packages
                                </Typography>
                                {loading ? (
                                    <Typography>Loading packages...</Typography>
                                ) : filteredPackages.length > 0 ? (
                                    <Grid container spacing={4}>
                                        {filteredPackages.map((pkg) => (
                                            <Grid item xs={12} sm={6} md={4} key={pkg._id}>
                                                <Card sx={{ minWidth: 250, display: 'flex', flexDirection: 'column' }}>
                                                    <CardActionArea onClick={() => handleBookNow(pkg._id)}>
                                                        <CardMedia
                                                            component="img"
                                                            height="200"
                                                            image={pkg.images[0]?.url || '/images/default-package.jpg'}
                                                            alt={pkg.name}
                                                            sx={{
                                                                objectFit: 'cover',
                                                                borderTopLeftRadius: 2,
                                                                borderTopRightRadius: 2,
                                                            }}
                                                        />
                                                        <CardContent>
                                                            <Typography variant="h6" gutterBottom>
                                                                {pkg.name}
                                                            </Typography>
                                                            <Typography variant="body2" color="textSecondary" paragraph>
                                                                {pkg.description}
                                                            </Typography>
                                                            <Typography variant="body1">Price: ${pkg.price}</Typography>
                                                            <Button
                                                                variant="contained"
                                                                color="primary"
                                                                fullWidth
                                                            >
                                                                Book Now
                                                            </Button>
                                                        </CardContent>
                                                    </CardActionArea>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                ) : (
                                    <Typography>No packages available</Typography>
                                )}
                            </Box>
                        </Box>
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
