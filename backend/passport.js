const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/user'); // Import user model


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ email: profile.emails[0].value });


        if (!user) {
            // Create a new user if not found
            user = new User({
                username: profile.displayName,
                email: profile.emails[0].value,
                profileImage: profile.photos[0].value,
            });
            await user.save();
        }
        done(null, user);
    } catch (error) {
        done(error, null);
    }
}));


// To keep the user logged in, serialize the user
passport.serializeUser((user, done) => {
    done(null, user.id);
});


// Deserialize the user when requested
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});
