const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');

// Local Strategy
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            return done(null, false, { message: 'Invalid credentials' });
        }
        
        const isValidPassword = await user.checkPassword(password);
        if (!isValidPassword) {
            return done(null, false, { message: 'Invalid credentials' });
        }
        
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

// Google OAuth Strategy (only if credentials are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists
            let user = await User.findOne({ where: { google_id: profile.id } });
            
            if (!user) {
                // Check if user exists with same email
                user = await User.findOne({ where: { email: profile.emails[0].value } });
                
                if (user) {
                    // Update existing user with Google ID
                    await user.update({ google_id: profile.id });
                } else {
                    // Create new user
                    user = await User.create({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        google_id: profile.id
                    });
                }
            }
            
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));
}

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

module.exports = passport; 