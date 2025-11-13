require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

// Passport Discord OAuth
if (process.env.CLIENT_SECRET && process.env.CLIENT_SECRET.trim() !== '') {
    passport.use(new DiscordStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.OAUTH_CALLBACK_URL,
        scope: ['identify', 'guilds']
    }, (accessToken, refreshToken, profile, done) => {
        profile.accessToken = accessToken;
        return done(null, profile);
    }));

    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((obj, done) => done(null, obj));

    app.use(passport.initialize());
    app.use(passport.session());
} else {
    console.warn('⚠️ CLIENT_SECRET nicht konfiguriert! Discord OAuth ist deaktiviert.');
    console.warn('📖 Siehe SETUP_GUIDE.md für Anweisungen.');
}

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/admin', require('./routes/admin'));

console.log('✅ JSON-Datenbank (Interface) initialisiert');

// Server starten
const PORT = process.env.WEB_PORT || 8080;
app.listen(PORT, () => {
    console.log(`✅ Web-Interface läuft auf http://localhost:${PORT}`);
});
