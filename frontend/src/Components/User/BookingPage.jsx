import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    Container, Typography, Grid, Button, 
    TextField, Paper, Box 
} from '@mui/material';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import StarIcon from '@mui/icons-material/Star';
import StarOutlineIcon from '@mui/icons-material/StarOutline';

const BookingPage = () => {
    const { packageId, travelDates, numberOfTravelers, userId } = useLocation().state || {};
    const navigate = useNavigate();

    const [packageDetails, setPackageDetails] = useState(null);
    const [bookingData, setBookingData] = useState({
        packageId,
        travelDates,
        numberOfTravelers: numberOfTravelers || 1,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [reviewsError, setReviewsError] = useState(null);

    useEffect(() => {
        if (!packageId) {
            return setError('Package ID not provided.');
        }

        const fetchPackageDetails = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/package/${packageId}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                });
                const data = await res.json();

                if (res.ok) {
                    setPackageDetails(data.package);
                } else {
                    setError(data.message || 'Unable to fetch package details.');
                }

                // Fetch reviews
                const reviewsRes = await fetch(`http://localhost:5000/api/reviews/package/${packageId}`);
                const reviewsData = await reviewsRes.json();

                if (reviewsRes.ok) {
                    setReviews(reviewsData.reviews);
                } else {
                    setReviewsError(reviewsData.message || 'Unable to fetch reviews.');
                }
            } catch {
                setError('An unexpected error occurred.');
            } finally {
                setLoading(false);
                setReviewsLoading(false);
            }
        };

        fetchPackageDetails();
    }, [packageId]);

    const handleInputChange = (e) => {
        setBookingData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleBookNow = async () => {
        const { travelDates, numberOfTravelers } = bookingData;

        if (!travelDates || numberOfTravelers < 1) {
            return alert('Please provide valid travel dates and number of travelers.');
        }

        if (!userId) {
            return alert('User not logged in');
        }

        try {
            const res = await fetch('http://localhost:5000/api/booking/new', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    packageId,
                    travelDates,
                    numberOfTravelers,
                    userId,
                    packagePrice: packageDetails?.price * numberOfTravelers || 0,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                alert('Booking successful');
                navigate('/booking-history');
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch {
            alert('An error occurred while creating the booking.');
        }
    };

    if (loading) {
        return <p>Loading package details...</p>;
    }

    if (error) {
        return (
            <div>
                <p>Error: {error}</p>
                <Button variant="outlined" onClick={() => navigate(-1)}>
                    Go Back
                </Button>
            </div>
        );
    }

    const totalPrice = packageDetails?.price * bookingData.numberOfTravelers;

    return (
        <Container>
            {/* Header Section */}
            <Box sx={{ textAlign: 'center', marginBottom: 3 }}>
                <Typography variant="h3" gutterBottom>
                    {packageDetails.name}
                </Typography>
                <Typography variant="h6" color="textSecondary">
                    {packageDetails.description}
                </Typography>
            </Box>

            {/* Details and Form Section */}
            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Carousel>
                        {packageDetails.images?.map((img, idx) => (
                            <div key={idx}>
                                <img
                                    src={img.url}
                                    alt={`Package Image ${idx}`}
                                    style={{ maxHeight: '400px', objectFit: 'cover' }}
                                />
                            </div>
                        ))}
                    </Carousel>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
                        <Typography variant="h5">
                            Price per Traveler: ${packageDetails.price}
                        </Typography>
                        <Typography variant="h6" sx={{ marginTop: 2 }}>
                            Total Price: ${totalPrice.toFixed(2)}
                        </Typography>
                        <Typography variant="body1" sx={{ marginTop: 2 }}>
                            <strong>Locations:</strong> {packageDetails.locations?.join(', ') || 'N/A'}
                        </Typography>
                    </Paper>

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Travel Dates"
                                type="date"
                                name="travelDates"
                                value={bookingData.travelDates}
                                onChange={handleInputChange}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Number of Travelers"
                                type="number"
                                name="numberOfTravelers"
                                min="1"
                                value={bookingData.numberOfTravelers}
                                onChange={handleInputChange}
                                fullWidth
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ marginTop: 3 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={handleBookNow}
                        >
                            Book Now
                        </Button>
                    </Box>
                </Grid>
            </Grid>

            {/* Additional Information */}
            <Box sx={{ marginTop: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Features
                </Typography>
                <Paper elevation={2} sx={{ padding: 3 }}>
                    <ul>
                        {packageDetails.features?.length > 0 ? (
                            packageDetails.features.map((feature, idx) => (
                                <li key={idx}>{feature}</li>
                            ))
                        ) : (
                            <Typography>No features available.</Typography>
                        )}
                    </ul>
                </Paper>
            </Box>

            <Box sx={{ marginTop: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Itinerary
                </Typography>
                <Paper elevation={2} sx={{ padding: 3 }}>
                    <Typography>{packageDetails.itinerary}</Typography>
                </Paper>
            </Box>

            <Box sx={{ marginTop: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Status
                </Typography>
                <Paper elevation={2} sx={{ padding: 3 }}>
                    <Typography>{packageDetails.status}</Typography>
                </Paper>
            </Box>

            {/* Reviews Section */}
            <Box sx={{ marginTop: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Reviews
                </Typography>
                {reviewsLoading ? (
                    <Typography>Loading reviews...</Typography>
                ) : reviewsError ? (
                    <Typography color="error">{reviewsError}</Typography>
                ) : reviews.length === 0 ? (
                    <Typography>No reviews found for this package.</Typography>
                ) : (
                    reviews.map((review, idx) => (
                        <Paper
                            key={idx}
                            elevation={2}
                            sx={{ padding: 3, marginBottom: 2 }}
                        >
                            <Typography variant="body1">
                                <strong>{review.userID?.name || 'Anonymous'}</strong>
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', marginY: 1 }}>
                                <Typography variant="body2">
                                    <strong>Rating:</strong>
                                </Typography>
                                <Box sx={{ display: 'flex', marginLeft: 1 }}>
                                    {[...Array(5)].map((_, starIndex) =>
                                        starIndex < review.ratings ? (
                                            <StarIcon key={starIndex} color="primary" />
                                        ) : (
                                            <StarOutlineIcon key={starIndex} color="disabled" />
                                        )
                                    )}
                                </Box>
                            </Box>
                            <Typography variant="body2">
                                <strong>Comment:</strong> {review.comments}
                            </Typography>
                            {review.images?.length > 0 && (
                                <Carousel>
                                    {review.images.map((img, idx) => (
                                        <div key={idx}>
                                            <img
                                                src={img.url}
                                                alt={`Review Image ${idx}`}
                                                style={{ maxHeight: '300px', objectFit: 'cover' }}
                                            />
                                        </div>
                                    ))}
                                </Carousel>
                            )}
                            <Typography variant="caption" color="textSecondary">
                                {new Date(review.createdAt).toLocaleString()}
                            </Typography>
                        </Paper>
                    ))
                )}
            </Box>
        </Container>
    );
};

export default BookingPage;
