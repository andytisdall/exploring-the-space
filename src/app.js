import mongoose from 'mongoose';
import session from 'express-session';
import express from 'express';
import 'express-async-errors';
import fileUpload from 'express-fileupload';
import path from 'path';
import moment from 'moment';
import { indexRouter  } from './routes/index.js';
import { deleteItem } from './routes/deleteItem.js';
import { addItem } from './routes/addItem.js';
import { editItem, changeSong, changeVersion } from './routes/editItem.js';
import { createPlaylist, createPlaylistSong, deletePlaylist, deletePlaylistSong } from './routes/playlist.js';
import { signinRouter } from './routes/signin.js';
import { signupRouter } from './routes/signup.js';
import { signoutRouter } from './routes/signout.js';
import { createBandRouter } from './routes/createBand.js';
import { playMp3 } from './routes/streamer.js';
import { userRouter } from './routes/user.js';
import { currentUser } from './middlewares/current-user.js';
import { requireAuth } from './middlewares/require-auth.js';

import { errorHandler } from './middlewares/error-handler.js';

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


app.use(signinRouter);
app.use(signupRouter);
app.use(signoutRouter);

app.use(userRouter);

app.use(createBandRouter);

app.get('/audio/:id', playMp3);

app.post('/change-song', changeSong);
app.post('/change-version', changeVersion);

// app.post('/playlist/create', createPlaylist);
// app.post('/playlist/create-song', createPlaylistSong);
// app.post('/playlist/delete', deletePlaylist);
// app.post('/playlist/delete-song', deletePlaylistSong);


app.post('/:bandName/delete', deleteItem);
app.post('/:bandName/edit', editItem);
app.use(indexRouter);
app.post('/:bandName', currentUser, requireAuth, addItem);



app.use(errorHandler);

app.listen(3000, () => {
    console.log('Express app started');
});