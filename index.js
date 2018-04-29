const path = require('path');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const hbs = require('hbs');
const expresshbs = require('express-handlebars');

const mainRoutes = require('./routes/main');

const app = express();

app.engine('.hbs', expresshbs({ defaultLayout: 'layout', extname: '.hbs' }));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname,'public')));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));

app.use('/', mainRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`App runnnig on port ${port}`);
});