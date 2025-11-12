const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/discord', (req, res, next) => {
    if (!process.env.CLIENT_SECRET || process.env.CLIENT_SECRET.trim() === '') {
        return res.status(503).send(`
            <html>
            <head>
                <title>OAuth nicht konfiguriert</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
                    .error { background: #fee; border: 2px solid #c33; padding: 20px; border-radius: 10px; }
                    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
                    h1 { color: #c33; }
                </style>
            </head>
            <body>
                <div class="error">
                    <h1>⚠️ Discord OAuth nicht konfiguriert</h1>
                    <p><strong>CLIENT_SECRET fehlt!</strong></p>
                    <p>Um das Web-Interface nutzen zu können, musst du:</p>
                    <ol>
                        <li>Gehe zum <a href="https://discord.com/developers/applications" target="_blank">Discord Developer Portal</a></li>
                        <li>Wähle deine Application aus</li>
                        <li>Gehe zu <strong>OAuth2</strong> → <strong>General</strong></li>
                        <li>Kopiere das <strong>CLIENT SECRET</strong></li>
                        <li>Füge es in die <code>.env</code> Datei ein: <code>CLIENT_SECRET=dein_secret_hier</code></li>
                        <li>Starte das Interface neu</li>
                    </ol>
                    <p>Siehe <code>SETUP_GUIDE.md</code> für weitere Details.</p>
                </div>
            </body>
            </html>
        `);
    }
    passport.authenticate('discord')(req, res, next);
});

router.get('/discord/callback',
    passport.authenticate('discord', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/dashboard');
    }
);

router.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

module.exports = router;
