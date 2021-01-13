const controller = require('./controller');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const pug = require('pug');
const session = require('express-session');
const express = require('express');

const app = express();

app.use(express.static('images'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({secret: 'secret', resave: false, saveUninitialized: false}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.locals.moment = require('moment');

const mongo = 'mongodb+srv://apprehenchmen:bethlehem@cluster0.xix0t.mongodb.net/<dbname>?retryWrites=true&w=majority';

mongoose.connect(mongo, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
    console.log('Connected to mongo instance');
});

mongoose.connection.on('error', (err) => {
    console.error('Error connecting to mongo');
    console.log(err);
});

app.get('/', controller.index);
app.get('/delete/:rowtype/:id/:parentid?', controller.deleteItem);
app.post('/', controller.addItem);
app.post('/changelatest', controller.changeLatest)


app.listen(3000);