import { index  } from './routes/index.js';
import { deleteItem } from './routes/deleteItem.js';
import { addItem } from './routes/addItem.js';
import { editItem, changeSong, changeVersion } from './routes/editItem.js';
import { createPlaylist, createPlaylistSong, deletePlaylist, deletePlaylistSong } from './routes/playlist.js';
import { playMp3 } from './routes/streamer.js';
import mongoose from 'mongoose';
import session from 'express-session';
import express from 'express';
import fileUpload from 'express-fileupload';
import path from 'path';
import moment from 'moment';
// import {mongoKey} from './mongo-key.js'


const app = express();

app.use(express.static('src/static/images'));
app.use(express.urlencoded({extended: true}));
app.use(express.json())
app.use(session({secret: 'secret', resave: false, saveUninitialized: false}));
app.use(fileUpload());

app.set('views', path.join(path.resolve(), './src/views'));
app.set('view engine', 'pug');

app.locals.moment = moment;

// const mongo = mongoKey;
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
app.post('/change-song', changeSong);
app.post('/change-version', changeVersion);
app.post('/playlist/create', createPlaylist);
app.post('/playlist/create-song', createPlaylistSong);
app.post('/playlist/delete', deletePlaylist);
app.post('/playlist/delete-song', deletePlaylistSong);

app.listen(3000);