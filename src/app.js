import { index, playMp3  } from './controller.js';
import deleteItem from './deleteItem.js';
import addItem from './addItem.js';
import { editItem, changeLatest, changeVersion } from './editItem.js';
import { createPlaylist, createPlaylistSong, deletePlaylist, deletePlaylistSong } from './playlist.js';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import session from 'express-session';
import express from 'express';
import fileUpload from 'express-fileupload';
import path from 'path';
import moment from 'moment';


const app = express();

app.use(express.static('images'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({secret: 'secret', resave: false, saveUninitialized: false}));
app.use(fileUpload());

app.set('views', path.join(path.resolve(), './views'));
app.set('view engine', 'pug');

app.locals.moment = moment;

const mongo = 'mongodb://localhost/greenhouse';

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


app.get('/', index);
app.get('/delete/:rowtype/:id/:parentid?', deleteItem);
app.get('/audio/:id', playMp3);
app.post('/', addItem);
app.post('/edit', editItem);
app.post('/changelatest', changeLatest);
app.post('/change-version', changeVersion);
app.post('/playlist/create', createPlaylist);
app.post('/playlist/create-song', createPlaylistSong);
app.post('/playlist/delete', deletePlaylist);
app.post('/playlist/delete-song', deletePlaylistSong);

app.listen(3000);