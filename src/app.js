import mongoose from 'mongoose';
import session from 'express-session';
import express from 'express';
import 'express-async-errors';
import fileUpload from 'express-fileupload';
import { Router } from './routes/band.js';
import { bandRouter } from './routes/band.js';
import { bandRouter } from './routes/band.js';
import { bandRouter } from './routes/band.js';
import { bandRouter } from './routes/band.js';
import { playlistRouter } from './routes/playlist.js';
import { signinRouter } from './routes/signin.js';
import { signupRouter } from './routes/signup.js';
import { signoutRouter } from './routes/signout.js';
import { bandRouter } from './routes/band.js';
import { userRouter } from './routes/user.js';
import { errorHandler } from './middlewares/error-handler.js';

// import {mongoKey} from './mongo-key.js'


const app = express();

app.use(express.static('public'));

app.use(express.urlencoded({extended: true}));
app.use(express.json())
app.use(session({secret: 'secret', resave: false, saveUninitialized: false}));
app.use(fileUpload());



// const mongo = mongoKey;
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


app.use(signinRouter);
app.use(signupRouter);
app.use(signoutRouter);
app.use(userRouter);



app.use(createBandRouter);
app.get('/audio/download/:id', downloadMp3)
app.get('/audio/:id', playMp3);
app.use(editRouter);
app.post('/:bandName/delete', deleteItem);




app.use(addItemRouter);
app.use(playlistRouter);

app.use(bandIndexRouter);
app.use(playlistDetailRouter);


app.use(errorHandler);

app.listen(3000, () => {
    console.log('Express app started');
});
