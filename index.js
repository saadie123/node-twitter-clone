const path = require('path');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const hbs = require('hbs');
const expresshbs = require('express-handlebars');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const config = require('./config/secret');

const mainRoutes = require('./routes/main');

const app = express();
mongoose.Promise = global.Promise;
mongoose.connect(config.databaseURL);

app.engine('.hbs', expresshbs({ defaultLayout: 'layout', extname: '.hbs' }));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname,'public')));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));
app.use(session({
    secret: config.secret,
    resave: true,
    saveUninitialized: true
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.successMessage = req.flash('success_message');
    res.locals.error = req.flash('error');
    next();
});

app.use('/', mainRoutes);

app.use('*', (req, res) => {
    res.render('main/not-found');
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`App runnnig on port ${port}`);
});