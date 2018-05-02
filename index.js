const path = require('path');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const hbs = require('hbs');
const expresshbs = require('express-handlebars');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const passport = require('passport');
const passportSocketIO = require('passport.socketio');
const cookieParser = require('cookie-parser');
const config = require('./config/secret');

const date = require('./helpers/date');

const mainRoutes = require('./routes/main');
const userRoutes = require('./routes/user');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const sessionStore = new MongoStore({ url:config.databaseURL, autoReconnect: true });
mongoose.Promise = global.Promise;
mongoose.connect(config.databaseURL);

app.engine('.hbs', expresshbs({ defaultLayout: 'layout', extname: '.hbs', helpers: {date} }));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname,'public')));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));
app.use(session({
    secret: config.secret,
    resave: true,
    saveUninitialized: true,
    store: sessionStore
}));
app.use(flash());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
const onAuthorizeSuccess = (data, accept) => {
    console.log("Successful connection");
    accept();
}
const onAuthorizeFail = (data, message, error, accept) => {
    console.log("Failed connection");
    if(error) accept(new Error(message));
}
io.use(passportSocketIO.authorize({
    cookieParser,
    key: 'connect.sid',
    secret: config.secret,
    store: sessionStore,
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail
}));

app.use((req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.successMessage = req.flash('success_message');
    res.locals.error = req.flash('error');
    next();
});


require('./realtime/io')(io);

app.use('/', mainRoutes);
app.use('/user', userRoutes);

app.use('*', (req, res) => {
    res.render('main/not-found');
});

const port = process.env.PORT || 5000;
http.listen(port, () => {
    console.log(`App runnnig on port ${port}`);
});