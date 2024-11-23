const Booking = require('../models/pbooking');
const Package = require('../models/package');

// Create a new booking
exports.newBooking = async (req, res) => {
    const { packageId, travelDates, numberOfTravelers, userId, packagePrice } = req.body;

    try {
        // Fetch the package details from the database
        const package = await Package.findById(packageId);

        // If package is not found, return an error
        if (!package) {
            return res.status(404).json({ message: 'Package not found' });
        }

        // Use the package price from the database
        const totalPrice = packagePrice * numberOfTravelers;

        // Create a new booking with the fetched package price
        const booking = await Booking.create({
            packageId,
            travelDates,
            numberOfTravelers,
            packagePrice,
            totalPrice,
            user: userId // Assuming the user is authenticated
        });

        // Return the success response with the booking details
        return res.status(200).json({
            success: true,
            booking
        });
    } catch (error) {
        return res.status(400).json({ message: 'Error creating booking', error: error.message });
    }
};

// Get booking history for a specific user
exports.bookingHistory = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    try {
        // Find bookings for the specified user
        const bookings = await Booking.find({ user: userId }).populate('packageId', 'name price');

        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ success: false, message: 'No bookings found for this user' });
        }

        return res.status(200).json({
            success: true,
            bookings
        });
    } catch (error) {
        console.error('Error fetching booking history:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};





// Get all bookings (admin)
exports.allBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().populate('user packageId');
        let totalRevenue = 0;
        bookings.forEach(booking => {
            totalRevenue += booking.totalPrice;
        });

        return res.status(200).json({
            success: true,
            totalRevenue,
            bookings
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error retrieving all bookings', error: error.message });
    }
};

// Delete a booking
exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'No booking found with this ID' });
        }
        return res.status(200).json({
            success: true,
            message: 'Booking deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting booking', error: error.message });
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'No booking found' });
        }
        if (booking.bookingStatus === 'confirmed') {
            return res.status(400).json({ message: 'Booking already confirmed' });
        }

        booking.bookingStatus = req.body.status;
        await booking.save();

        return res.status(200).json({
            success: true,
            booking
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error updating booking status', error: error.message });
    }
};

// Total bookings count
exports.totalBookings = async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();
        return res.status(200).json({
            success: true,
            totalBookings
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error counting total bookings', error: error.message });
    }
};

// Total revenue
exports.totalRevenue = async (req, res) => {
    try {
        const revenue = await Booking.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalPrice" }
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            totalRevenue: revenue[0]?.totalRevenue || 0
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error calculating total revenue', error: error.message });
    }
};

// Revenue per user
exports.revenuePerUser = async (req, res) => {
    try {
        const revenuePerUser = await Booking.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            { $unwind: "$userDetails" },
            {
                $group: {
                    _id: "$userDetails.name",
                    totalRevenue: { $sum: "$totalPrice" }
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);

        return res.status(200).json({
            success: true,
            revenuePerUser
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error calculating revenue per user', error: error.message });
    }
};







exports.checkoutBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;

     
        const booking = await Booking.findById(bookingId).populate('user packageId');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        
        if (booking.bookingStatus === 'processing' || booking.bookingStatus === 'confirmed') {
            return res.status(400).json({ message: 'Booking already processed or confirmed' });
        }

       
        booking.bookingStatus = 'processing';
        await booking.save();

       
        const ticket = await booking.checkout(); 

        return res.status(200).json({
            message: 'Booking successfully checked out and status updated to "processing"',
            ticket,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message || 'Failed to checkout booking' });
    }
};