import express from 'express';
import mongoose from 'mongoose';
import mongodb from 'mongodb';

import { Readable } from 'stream';
import { bucket } from './audio.js';
import { requireAuth } from '../middlewares/require-auth.js';
import { currentUser } from '../middlewares/current-user.js';

const Song = mongoose.model('Song');
const Version = mongoose.model('Version');
const PlaylistSong = mongoose.model('PlaylistSong');

const router = express.Router();

router.post('/bounces', currentUser, requireAuth, async (req, res) => {
  // Increase timeout length for long uploads

  req.socket.setTimeout(10 * 60 * 1000);

  // Get parameters from post request and exit if there's an existing bounce with that date.

  const { date, comments, duration, version, latest } = req.body;
  const parentVersion = await Version.findById(version).populate('songs');
  if (parentVersion.songs) {
    let duplicateDate = parentVersion.songs.find((b) => b.date === date);
    if (duplicateDate) {
      throw new Error('Duplicate date found in the version list');
    }
  }

  const file = req.files.file;

  // Create a new bounce object form values

  const newBounce = new Song({
    date,
    comments,
    size: file.size,
    duration,
    latest,
  });

  // Create upload stream object
  let stream = bucket.openUploadStream(file.name);

  const readableStream = new Readable();
  readableStream.push(file.data);
  readableStream.push(null);
  readableStream.pipe(stream);

  stream.on('error', (err) => {
    throw new Error('Error uploading mp3!');
  });

  // Finish up on completed upload
  stream.on('finish', async () => {
    // Get id of mp3 from stream object
    newBounce.mp3 = stream.id;

    // Add bounce to parent version's bounce list
    parentVersion.songs.push(newBounce);

    // Finally save new bounce object
    await newBounce.save();
    await parentVersion.save();

    console.log('Uploaded & created bounce record:', newBounce);

    return res.status(201).send(newBounce);
  });
});

router.get('/bounces/:versionId', async (req, res) => {
  const version = await Version.findById(req.params.versionId).populate(
    'songs'
  );

  res.status(200).send(version.songs);
});

router.patch('/bounces/:id', currentUser, requireAuth, async (req, res) => {
  const { id } = req.params;
  const { date, comments, duration, latest } = req.body;

  const thisBounce = await Song.findById(id);

  thisBounce.comments = comments;
  thisBounce.date = date;
  thisBounce.latest = latest;

  //

  if (req.files) {
    const file = req.files.file;

    // delete old mp3

    const mp3Id = new mongodb.ObjectID(thisBounce.mp3);

    // Edit bounce object form values

    thisBounce.size = file.size;
    thisBounce.duration = duration;

    // Create upload stream object
    let stream = bucket.openUploadStream(file.name);

    const readableStream = new Readable();
    readableStream.push(file.data);
    readableStream.push(null);
    readableStream.pipe(stream);

    stream.on('error', (err) => {
      throw new Error('Error uploading mp3!');
    });

    // Finish up on completed upload
    stream.on('finish', async () => {
      bucket.delete(mp3Id, async (err) => {
        if (err) {
          throw new Error('Error attempting to delete mp3');
        } else {
          console.log('mp3 deleted');

          // Get id of mp3 from stream object
          thisBounce.mp3 = stream.id;
          await thisBounce.save();

          res.send(thisBounce);
        }
      });
    });
  } else {
    await thisBounce.save();
    res.send(thisBounce);
  }
});

router.post('/bounces/delete', currentUser, requireAuth, async (req, res) => {
  const { bounceId, versionId } = req.body;

  const thisBounce = await Song.findById(bounceId);
  const mp3Id = new mongodb.ObjectID(thisBounce.mp3);
  const parentVersion = await Version.findById(versionId);
  if (parentVersion) {
    await Version.updateOne({ _id: versionId }, { $pull: { songs: bounceId } });
  }
  const playlistSongs = await PlaylistSong.find({ bounce: bounceId });

  playlistSongs.forEach(async (pls) => {
    pls.bounce = null;
    await pls.save();
  });

  bucket.delete(mp3Id, (err) => {
    if (err) {
      throw new Error('Error attempting to delete mp3');
    } else {
      console.log('mp3 deleted');
    }
  });

  await Song.deleteOne({ _id: bounceId });

  res.send(thisBounce);
});

export { router as bounceRouter };
