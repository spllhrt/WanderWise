const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    packageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
        required: true,
    },
    travelDates: {
        type: Date,
        required: [true, 'Please provide the start date of the trip'],
    },
    numberOfTravelers: {
        type: Number,
        required: [true, 'Please specify the number of travelers'],
        min: [1, 'Number of travelers must be at least 1'],
    },
    packagePrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    bookingStatus: {
        type: String,
        enum: ['confirmed', 'pending', 'canceled', 'processing', 'success'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});


bookingSchema.methods.checkout = async function() {
    this.bookingStatus = 'confirmed';
    await this.save(); 
    return this; 
};

bookingSchema.methods.checkout = async function() {
    if (this.bookingStatus === 'confirmed' || this.bookingStatus === 'processing') {
        throw new Error('Booking is already processed or confirmed.');
    }

     this.bookingStatus = 'processing';
    await this.save();
   
    const ticket = {
        message: `You have successfully checked out your booking!`,
        bookingDetails: {
            name: this.user.name, 
            package: this.packageId.name,
            numberOfTravelers: this.numberOfTravelers,
            totalPrice: this.totalPrice,
            travelDate: this.travelDates,
        },
        confirmationMessage: `Please show this confirmation to confirm that you have successfully checked out.`
    };

    return ticket;
};

module.exports = mongoose.model('Booking', bookingSchema);
