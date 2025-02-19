import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../../utils/helpers';
import {
    AppBar,
    Toolbar,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Rating,
    Box
} from '@mui/material';


const BookingHistory = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ticket, setTicket] = useState(null);
    const [ticketReady, setTicketReady] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [openReviewDialog, setOpenReviewDialog] = useState(false);
    const [reviewDetails, setReviewDetails] = useState({
        bookingId: null,
        rating: 0,
        comments: '',
    });
    const navigate = useNavigate();


    useEffect(() => {
        const loggedInUser = getUser();


        if (!loggedInUser || !loggedInUser._id) {
            alert('Please log in to view your booking history.');
            navigate('/login');
            return;
        }


        const fetchBookingHistory = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/booking/history', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({ userId: loggedInUser._id }),
                });


                const data = await response.json();


                if (response.ok) {
                    setBookings(data.bookings || []);
                } else {
                    alert(`Error fetching booking history: ${data.message}`);
                }
            } catch (error) {
                console.error('Error fetching booking history:', error);
                alert('Failed to fetch booking history.');
            } finally {
                setLoading(false);
            }
        };


        fetchBookingHistory();
    }, [navigate]);


    const cancelBooking = async (bookingId) => {
        const reason = prompt('Please provide a reason for cancellation:');
        if (!reason) return;


        setCancelReason(reason);


        try {
            const response = await fetch(`http://localhost:5000/api/admin/booking/${bookingId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ reason }),
            });


            const data = await response.json();


            if (response.ok) {
                setBookings((prev) => prev.filter((booking) => booking._id !== bookingId));
                alert('Booking successfully canceled.');
            } else {
                alert(`Failed to cancel booking: ${data.message}`);
            }
        } catch (error) {
            console.error('Error cancelling booking:', error);
            alert('Error cancelling the booking.');
        }
    };


    const checkoutBooking = async (bookingId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/booking/checkout/${bookingId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });


            const data = await response.json();


            if (response.ok) {
                const updatedBookings = bookings.map((booking) =>
                    booking._id === bookingId ? { ...booking, bookingStatus: 'success' } : booking
                );
                setBookings(updatedBookings);


                const updatedBooking = updatedBookings.find((b) => b._id === bookingId);
                if (updatedBooking) {
                    setTicket({
                        message: `You have successfully checked out your booking!`,
                        bookingDetails: {
                            package: updatedBooking.packageId.name,
                            numberOfTravelers: updatedBooking.numberOfTravelers,
                            totalPrice: updatedBooking.totalPrice,
                            travelDate: updatedBooking.travelDates,
                        },
                        confirmationMessage: `Please show this confirmation to confirm that you have successfully checked out.`,
                    });
                    setTicketReady(true);
                }
                alert('Booking successfully confirmed.');
            } else {
                alert(`Failed to confirm booking: ${data.message}`);
            }
        } catch (error) {
            console.error('Error confirming booking:', error);
            alert('Error confirming the booking.');
        }
    };


    const handleReviewOpen = (bookingId, packageId) => {
        setReviewDetails({ bookingId, packageId, rating: 0, comments: '' });
        setOpenReviewDialog(true);
    };


    const handleReviewClose = () => {
        setOpenReviewDialog(false);
    };


    const handleReviewSubmit = async () => {
        const { bookingId, packageId, rating, comments } = reviewDetails;
       
        if (!rating || !comments) {
            alert('Please provide both a rating and a comment.');
            return;
        }
    
        // You can send the comment to the backend to check for bad words.
        try {
            const response = await fetch(`http://localhost:5000/api/review/new`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    userID: getUser()._id,
                    packageId,
                    comments,
                    ratings: rating,  // Ensure 'ratings' is a number
                }),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                alert('Review submitted successfully.');
                setOpenReviewDialog(false);
            } else {
                // Show the message from backend if bad words were detected
                alert(data.message || 'Failed to submit review.');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Error submitting the review.');
        }
    };
    


    if (loading) return <CircularProgress />;


    return (
        <>
            {/* Navbar */}
            <AppBar position="sticky" color="primary">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        User Dashboard
                    </Typography>
                    <Button color="inherit" onClick={() => navigate('/user-dashboard')}>Dashboard</Button>
                    <Button color="inherit" onClick={() => navigate('/booking-history')}>Booking History</Button>
                    <Button color="inherit" onClick={() => navigate('/profile')}>Profile</Button>
                </Toolbar>
            </AppBar>


            <Box sx={{ padding: '20px', backgroundColor: '#f4f4f9' }}>
                <Typography variant="h4" align="center" sx={{ marginBottom: '30px', fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}>
                    Booking History
                </Typography>
               
                {bookings.length > 0 ? (
                    <Grid container spacing={3} justifyContent="center">
                        {bookings.map((booking) => (
                            <Grid item xs={12} sm={6} md={4} key={booking._id}>
                                <Card sx={{ boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}>
                                    <CardContent sx={{ padding: '20px' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            {booking.packageId.name}
                                        </Typography>
                                        <Typography variant="body1" sx={{ marginBottom: '8px' }}>
                                            Travel Dates: {booking.travelDates}
                                        </Typography>
                                        <Typography variant="body2" sx={{ marginBottom: '8px' }}>
                                            Number of Travelers: {booking.numberOfTravelers}
                                        </Typography>
                                        <Typography variant="body2" sx={{ marginBottom: '8px' }}>
                                            Total Price: ${booking.totalPrice}
                                        </Typography>
                                        <Typography variant="body2" sx={{ marginBottom: '16px' }}>
                                            Status: {booking.bookingStatus}
                                        </Typography>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            {booking.bookingStatus === 'success' ? (
                                                <>
                                                    <Button
                                                        variant="outlined"
                                                        color="primary"
                                                        onClick={() => {
                                                            setTicket({
                                                                message: 'Your ticket details are available.',
                                                                bookingDetails: {
                                                                    package: booking.packageId.name,
                                                                    numberOfTravelers: booking.numberOfTravelers,
                                                                    totalPrice: booking.totalPrice,
                                                                    travelDate: booking.travelDates,
                                                                },
                                                                confirmationMessage: 'This is your confirmed booking ticket.',
                                                            });
                                                            setTicketReady(true);
                                                        }}
                                                    >
                                                        View Ticket
                                                    </Button>
                                                    <Button
                                                        variant="contained"
                                                        color="secondary"
                                                        onClick={() => handleReviewOpen(booking._id, booking.packageId._id)}
                                                    >
                                                        Leave a Review
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    variant="outlined"
                                                    color="secondary"
                                                    onClick={() => cancelBooking(booking._id)}
                                                >
                                                    Cancel Booking
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Typography variant="h6" align="center">
                        You don't have any bookings yet.
                    </Typography>
                )}
            </Box>


            {/* Ticket Confirmation Dialog */}
            <Dialog open={ticketReady} onClose={() => setTicketReady(false)}>
                <DialogTitle>Booking Confirmation</DialogTitle>
                <DialogContent>
                    {ticket && (
                        <>
                            <Typography variant="body1">{ticket.message}</Typography>
                            <Box sx={{ marginTop: '20px', fontWeight: 'bold' }}>
                                <Typography variant="body2">Package: {ticket.bookingDetails.package}</Typography>
                                <Typography variant="body2">
                                    Number of Travelers: {ticket.bookingDetails.numberOfTravelers}
                                </Typography>
                                <Typography variant="body2">Total Price: ${ticket.bookingDetails.totalPrice}</Typography>
                                <Typography variant="body2">Travel Date: {ticket.bookingDetails.travelDate}</Typography>
                            </Box>
                            <Typography variant="body1" sx={{ marginTop: '15px' }}>
                                {ticket.confirmationMessage}
                            </Typography>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTicketReady(false)} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>


            {/* Review Dialog */}
            <Dialog open={openReviewDialog} onClose={handleReviewClose}>
                <DialogTitle>Leave a Review</DialogTitle>
                <DialogContent>
                    <Rating
                        name="simple-controlled"
                        value={reviewDetails.rating}
                        onChange={(event, newValue) => setReviewDetails({ ...reviewDetails, rating: newValue })}
                    />
                    <TextField
                        fullWidth
                        label="Comments"
                        variant="outlined"
                        multiline
                        rows={4}
                        value={reviewDetails.comments}
                        onChange={(e) =>
                            setReviewDetails({ ...reviewDetails, comments: e.target.value })
                        }
                        sx={{ marginTop: '20px' }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleReviewClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleReviewSubmit} color="primary">
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};


export default BookingHistory;


