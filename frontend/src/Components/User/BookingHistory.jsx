import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../../utils/helpers';
import {
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

    const handleReviewOpen = (bookingId) => {
        setReviewDetails({ bookingId, rating: 0, comments: '' });
        setOpenReviewDialog(true);
    };

    const handleReviewClose = () => {
        setOpenReviewDialog(false);
    };

    const handleReviewSubmit = async () => {
        const { bookingId, rating, comments } = reviewDetails;

        if (!rating || !comments) {
            alert('Please provide both a rating and a comment.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/review/new`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ userID: getUser()._id, packageId: bookingId, comments, ratings: rating }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Review submitted successfully.');
                setOpenReviewDialog(false);
            } else {
                alert(`Failed to submit review: ${data.message}`);
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Error submitting the review.');
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Booking History
            </Typography>
            {bookings.length > 0 ? (
                <Grid container spacing={3}>
                    {bookings.map((booking) => (
                        <Grid item xs={12} sm={6} md={4} key={booking._id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">{booking.packageId.name}</Typography>
                                    <Typography variant="body1">Travel Dates: {booking.travelDates}</Typography>
                                    <Typography variant="body2">Number of Travelers: {booking.numberOfTravelers}</Typography>
                                    <Typography variant="body2">Total Price: ${booking.totalPrice}</Typography>
                                    <Typography variant="body2">
                                        Status: {booking.bookingStatus}
                                    </Typography>
                                    <div>
                                        {booking.bookingStatus === 'pending' && (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => checkoutBooking(booking._id)}
                                            >
                                                Checkout
                                            </Button>
                                        )}
                                        {booking.bookingStatus === 'success' && (
                                            <div>
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
                                                    onClick={() => handleReviewOpen(booking._id)}
                                                >
                                                    Leave a Review
                                                </Button>
                                            </div>
                                        )}
                                        {booking.bookingStatus !== 'success' && (
                                            <Button
                                                variant="outlined"
                                                color="secondary"
                                                onClick={() => cancelBooking(booking._id)}
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Typography>No bookings found.</Typography>
            )}

            {/* Review Dialog */}
            <Dialog open={openReviewDialog} onClose={handleReviewClose}>
                <DialogTitle>Leave a Review</DialogTitle>
                <DialogContent>
                    <Rating
                        value={reviewDetails.rating}
                        onChange={(event, newValue) => setReviewDetails({ ...reviewDetails, rating: newValue })}
                    />
                    <TextField
                        label="Comments"
                        multiline
                        rows={4}
                        fullWidth
                        value={reviewDetails.comments}
                        onChange={(e) => setReviewDetails({ ...reviewDetails, comments: e.target.value })}
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

            {ticketReady && ticket && (
                <Dialog open={ticketReady} onClose={() => setTicketReady(false)}>
                    <DialogTitle>Booking Confirmation</DialogTitle>
                    <DialogContent>
                        <Typography>{ticket.message}</Typography>
                        <Typography>Package: {ticket.bookingDetails.package}</Typography>
                        <Typography>Travel Date: {ticket.bookingDetails.travelDate}</Typography>
                        <Typography>Number of Travelers: {ticket.bookingDetails.numberOfTravelers}</Typography>
                        <Typography>Total Price: ${ticket.bookingDetails.totalPrice}</Typography>
                        <Typography>{ticket.confirmationMessage}</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setTicketReady(false)} color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </div>
    );
};

export default BookingHistory;
