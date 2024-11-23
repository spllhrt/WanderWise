const express = require('express');
const router = express.Router();

const { 
    newBooking, 
    bookingHistory, // Import the new controller function
    allBookings, 
    deleteBooking, 
    updateBookingStatus, 
    totalBookings, 
    totalRevenue, 
    revenuePerUser, 
    checkoutBooking // Import checkoutBooking
} = require('../controllers/pbooking'); // Adjust the path if needed

// User routes
router.post('/booking/new', newBooking);

router.post('/booking/history', bookingHistory); // Added route for "Booking History"

// Add the checkout route for users to process the booking
router.post('/booking/checkout/:id', checkoutBooking); // Checkout route for booking by ID

// Admin routes
router.get('/admin/bookings', allBookings);
router.route('/admin/booking/:id')
    .delete(deleteBooking)
    .put(updateBookingStatus);

// Aggregated data routes (Admin only)
router.get('/admin/total-bookings', totalBookings);
router.get('/admin/total-revenue', totalRevenue);
router.get('/admin/revenue-per-user', revenuePerUser);

module.exports = router;
