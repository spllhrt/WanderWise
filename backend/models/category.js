const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Please Enter category name'],
        trim: true,
        maxLength: [100, 'Category name cannot exceed 100 characters']
    },
    images: [
        {
            public_id:{
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }
    ],
    createdAt:{
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Category', categorySchema);