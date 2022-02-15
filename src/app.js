import '@babel/polyfill';

import mongoose from 'mongoose';
import express from 'express';
import 'express-async-errors';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import path from 'path';

import './models/models.js';
import './models/user.js';
import './models/band.js';

import { tierRouter } from './routes/tiers.js';
import { bandRouter } from './routes/band.js';
import { titleRouter } from './routes/titles.js';
import { versionRouter } from './routes/versions.js';
import { bounceRouter } from './routes/bounces.js';
import { playlistRouter } from './routes/playlist.js';
import { playlistSongRouter } from './routes/playlistSong.js';
import { authRouter } from './routes/auth.js';
import { audioRouter } from './routes/audio.js';
import { userRouter } from './routes/user.js';

import { errorHandler } from './middlewares/error-handler.js';

const __dirname = path.resolve();

const app = express();

let PORT;
let STATIC_FILES;

if (process.env.NODE_ENV === 'production') {
  PORT = '3000';
  STATIC_FILES = 'client/build';
} else {
  PORT = '3001';
  STATIC_FILES = 'client/public';
}

app.use(express.static(path.join(__dirname, STATIC_FILES)));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload());
app.use(cors());

// connect mongo database

const mongo = 'mongodb://localhost/greenhouse';

mongoose.connect(mongo, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

mongoose.connection.on('connected', () => {
  console.log('Connected to mongo instance');
});

mongoose.connection.on('error', (err) => {
  console.error('Error connecting to mongo');
  console.log(err);
});

// add /api to all routers so we don't get our urls mixed up with frontend

const apiRouter = express.Router({ mergeParams: true });

apiRouter.use(bandRouter);
apiRouter.use(authRouter);
apiRouter.use(userRouter);
apiRouter.use(tierRouter);
apiRouter.use(titleRouter);
apiRouter.use(versionRouter);
apiRouter.use(bounceRouter);
apiRouter.use(audioRouter);
apiRouter.use(playlistRouter);
apiRouter.use(playlistSongRouter);

apiRouter.use(errorHandler);

app.use('/api', apiRouter);

app.get('/*', (req, res) => {
  res.sendFile('client/build/index.html', { root: __dirname });
});

app.listen(PORT, () => {
  console.log(`Express running on port ${PORT}`);
});
