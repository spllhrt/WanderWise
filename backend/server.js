const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const session = require('express-session');
const passport = require('passport');
require('dotenv').config()




const authRoutes = require('./routes/auth'); // Ensure correct path
const categoryRoutes = require('./routes/category');
const packageRoutes = require('./routes/package');
const reviewRoutes = require('./routes/reviews');
const responseRoutes = require('./routes/response');
const pbookingRoutes = require('./routes/pbooking');
const wishlistRoutes = require('./routes/wishlist');


const app = express();
app.use(express.json());



// MongoDB connection URI
const uri = 'mongodb+srv://hayet:hayet123@cluster0.4hcp3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';


mongoose.connect(uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Error connecting to MongoDB:', err));


// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT','PATCH', 'DELETE'],
}));


// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


// Body parsing middleware
app.use(express.json());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// Session middleware
app.use(session({
  secret: 'your-secret-key', // Use a strong secret key for your app
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, httpOnly: true } // Make sure cookie is httpOnly and secure is false for development
}));


// Passport initialization middleware
app.use(passport.initialize());
app.use(passport.session());


require('./passport'); // This ensures passport is set up with the Google strategy


// Routes
app.use('/api/auth', authRoutes); // Correct route for authentication
app.use('/api/', categoryRoutes);
app.use('/api/', packageRoutes);
app.use('/api/', reviewRoutes);
app.use('/api/', responseRoutes);
app.use('/api/', pbookingRoutes);
app.use('/api/', wishlistRoutes);



const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
