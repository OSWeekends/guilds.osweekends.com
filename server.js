const express = require('express'),
    helmet = require('helmet'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    partials = require('express-partials'),
    config = require('./config'),
    logger = require('./lib/logger'),
    auth = require('./lib/auth');

const app = express();
app.set('view engine', 'ejs');

// Middelware
app.use(helmet());
app.use((req, res, next) => {
    logger.info(`[${new Date().getTime()}] | IP: ${req.connection.remoteAddress} | UserAgent: ${req.headers['user-agent']}`);
    next();
});
app.use(partials());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(session(config.session));
app.use(auth.passport.initialize());
app.use(auth.passport.session());
app.use(express.static(__dirname + '/public'));

// Routes
app.get('/', (req, res) => {
    res.render('index', {
        title: 'Welcome to Guilds.osweekends.com',
        message: '👋 Guilder!',
        user: req.user
    });
});

app.get('/profile', auth.ensureAuthenticated, (req, res) => {
    res.render('profile', {
        user: req.user,
        data: req.user._json
    });
});

app.get('/login', (req, res) => {
    res.render('login', {
        user: req.user
    });
});

app.get('/auth/github', auth.passport.authenticate('github', {
    scope: ['user:email']
}));

app.get('/auth/github/callback',
    auth.passport.authenticate('github', {
        failureRedirect: '/login'
    }), (req, res) => {
        res.redirect('/profile');
    });

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});


// Port
app.listen(config.port, () => {
    logger.info(`[INFO] Server listening on port ${config.port}!`);
});