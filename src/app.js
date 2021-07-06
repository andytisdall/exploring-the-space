import mongoose from 'mongoose';
import express from 'express';
import session from 'express-session';
import 'express-async-errors';
import fileUpload from 'express-fileupload';
import cors from 'cors';

import './models/models.js';
import './models/user.js';
import './models/band.js';

import { tierRouter } from './routes/tiers.js';
import { bandRouter } from './routes/band.js';
import { titleRouter } from './routes/titles.js';
import { versionRouter } from './routes/versions.js';
import { bounceRouter } from './routes/bounces.js';
import { playlistRouter } from './routes/playlist.js';
import { signinRouter } from './routes/signin.js';
import { signupRouter } from './routes/signup.js';
import { signoutRouter } from './routes/signout.js';
import { audioRouter } from './routes/audio.js';
import { userRouter } from './routes/user.js';

import { errorHandler } from './middlewares/error-handler.js';




const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(session({secret: 'secret', resave: false, saveUninitialized: false}));
app.use(express.json());
app.use(fileUpload());
app.use(cors());

// connect mongo database

const mongo = 'mongodb://localhost/greenhouse';

mongoose.connect(mongo, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

mongoose.connection.on('connected', () => {
    console.log('Connected to mongo instance');
});

mongoose.connection.on('error', (err) => {
    console.error('Error connecting to mongo');
    console.log(err);
});

app.use(bandRouter);

app.use(signinRouter);
app.use(signupRouter);
app.use(signoutRouter);
app.use(userRouter);


app.use(tierRouter);
app.use(titleRouter);
app.use(versionRouter);
app.use(bounceRouter);
app.use(audioRouter);


// app.use(editRouter);
// app.post('/:bandName/delete', deleteItem);


// app.use(playlistRouter);
// app.use(playlistDetailRouter);


app.use(errorHandler);

app.listen(3001, () => {
    console.log('Express running on port 3001');
});
