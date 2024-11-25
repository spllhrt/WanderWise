import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Container,
    Typography,
    Grid,
    Button,
    Paper,
    Box,
    FormControlLabel,
    Checkbox,
} from '@mui/material';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import StarIcon from '@mui/icons-material/Star';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';




<style><ErrorMessage
    name="travelDates"
    component="div"
    style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}
/>
<ErrorMessage
    name="numberOfTravelers"
    component="div"
    style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}
/>
</style>












const BookingPage = () => {
    const { packageId, travelDates, numberOfTravelers, userId } = useLocation().state || {};
    const navigate = useNavigate();




    const [packageDetails, setPackageDetails] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [selectedRatings, setSelectedRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [reviewsError, setReviewsError] = useState(null);




    useEffect(() => {
        if (!packageId) {
            setError('Package ID not provided.');
            return;
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




    const handleRatingChange = (rating) => {
        setSelectedRatings((prevRatings) =>
            prevRatings.includes(rating)
                ? prevRatings.filter((r) => r !== rating)
                : [...prevRatings, rating]
        );
    };




    const filteredReviews = reviews.filter((review) =>
        selectedRatings.length === 0 || selectedRatings.includes(review.ratings)
    );




    const validationSchema = Yup.object().shape({
        travelDates: Yup.date()
            .required('Travel dates are required.')
            .min(new Date(), 'Travel date cannot be in the past.'),
        numberOfTravelers: Yup.number()
            .required('Number of travelers is required.')
            .min(1, 'At least one traveler is required.'),
    });
   




    const handleBookNow = async (values) => {
        const { travelDates, numberOfTravelers } = values;




        if (!userId) {
            alert('User not logged in.');
            return;
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




    const totalPrice = packageDetails?.price * 1;




    return (
        <Container>
            <Box sx={{ textAlign: 'center', marginBottom: 3 }}>
                <Typography variant="h3" gutterBottom>
                    {packageDetails?.name}
                </Typography>
                <Typography variant="h6" color="textSecondary">
                    {packageDetails?.description}
                </Typography>
            </Box>




            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Carousel>
                        {packageDetails?.images?.map((img, idx) => (
                            <div key={idx}>
                                <img
                                    src={img.url}
                                    alt={`Package Image ${idx}`}
                                    style={{ maxHeight: '400px', objectFit: 'cover', width: '100%' }}
                                />
                            </div>
                        ))}
                    </Carousel>
                </Grid>




                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
                        <Typography variant="h5">
                            Price per Traveler: ${packageDetails?.price}
                        </Typography>
                        <Typography variant="h6" sx={{ marginTop: 2 }}>
                            Total Price: ${totalPrice.toFixed(2)}
                        </Typography>
                    </Paper>




                    <Formik
                        initialValues={{
                            travelDates: travelDates || '',
                            numberOfTravelers: numberOfTravelers || 1,
                        }}
                        validationSchema={validationSchema}
                        onSubmit={(values) => handleBookNow(values)}
                    >
                        {({ handleSubmit }) => (
                            <Form onSubmit={handleSubmit}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Field
                                            as="input"
                                            type="date"
                                            name="travelDates"
                                            className="form-control"
                                        />
                                        <ErrorMessage name="travelDates" component="div" className="error-message" />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Field
                                            as="input"
                                            type="number"
                                            name="numberOfTravelers"
                                            min="1"
                                            className="form-control"
                                        />
                                        <ErrorMessage name="numberOfTravelers" component="div" className="error-message" />
                                    </Grid>
                                </Grid>
                                <Box sx={{ marginTop: 3 }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                    >
                                        Book Now
                                    </Button>
                                </Box>
                            </Form>
                        )}
                    </Formik>
                </Grid>
            </Grid>


            {/* Additional Information */}
            <Box sx={{ marginTop: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Features
                </Typography>
                <Paper elevation={2} sx={{ padding: 3 }}>
                    <ul>
                        {packageDetails?.features?.length > 0 ? (
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
                    <Typography>{packageDetails?.itinerary}</Typography>
                </Paper>
            </Box>

            <Box sx={{ marginTop: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Status
                </Typography>
                <Paper elevation={2} sx={{ padding: 3 }}>
                    <Typography>{packageDetails?.status}</Typography>
                </Paper>
            </Box>

            <Box sx={{ marginTop: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Filter Reviews by Rating
                </Typography>
                {[1, 2, 3, 4, 5].map((rating) => (
                    <FormControlLabel
                        key={rating}
                        control={
                            <Checkbox
                                checked={selectedRatings.includes(rating)}
                                onChange={() => handleRatingChange(rating)}
                                name={`rating-${rating}`}
                            />
                        }
                        label={`Rating ${rating} Stars`}
                    />
                ))}
            </Box>




            <Box sx={{ marginTop: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Reviews
                </Typography>
                {reviewsLoading ? (
                    <Typography>Loading reviews...</Typography>
                ) : reviewsError ? (
                    <Typography color="error">{reviewsError}</Typography>
                ) : filteredReviews.length === 0 ? (
                    <Typography>No reviews found for this package.</Typography>
                ) : (
                    filteredReviews.map((review, idx) => (
                        <Paper key={idx} elevation={2} sx={{ padding: 3, marginBottom: 2 }}>
                            <Typography variant="body1">
                                <strong>{review.userID?.name || 'Anonymous'}</strong>
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                {review.comments}
                            </Typography>
                            <Box sx={{ marginTop: 1 }}>
                                {[...Array(5)].map((_, starIdx) => (
                                    <span key={starIdx}>
                                        {starIdx < review.ratings ? (
                                            <StarIcon color="primary" />
                                        ) : (
                                            <StarOutlineIcon color="disabled" />
                                        )}
                                    </span>
                                ))}
                            </Box>
                        </Paper>
                    ))
                )}
            </Box>
        </Container>
    );
};




export default BookingPage;


