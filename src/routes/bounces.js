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
const Title = mongoose.model('Title');

const router = express.Router();

const saveMp3 = (file) => {
  // Create upload stream object
  let stream = bucket.openUploadStream(file.name);

  const readableStream = new Readable();
  readableStream.push(file.data);
  readableStream.push(null);
  readableStream.pipe(stream);

  return new Promise((resolve, reject) => {
    stream.on('error', (err) => {
      reject(err);
    });
    stream.on('finish', () => resolve(stream.id));
  });
};

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

  // Create a new bounce object

  const newBounce = new Song({
    date,
    comments,
    size: file.size,
    duration,
    latest,
  });

  const streamId = await saveMp3(file);
  // Get id of mp3 from stream object
  newBounce.mp3 = streamId;

  // Add bounce to parent version's bounce list
  parentVersion.songs.push(newBounce);

  // Finally save new bounce object
  await newBounce.save();
  await parentVersion.save();
  console.log('Uploaded & created bounce record:', newBounce);

  return res.status(201).send(newBounce);
});

router.get('/bounces/:versionId', async (req, res) => {
  const version = await Version.findById(req.params.versionId).populate(
    'songs'
  );

  res.status(200).send(version.songs);
});

router.patch('/bounces/:id', currentUser, requireAuth, async (req, res) => {
  const { id } = req.params;
  const { date, comments, duration, latest, titleId } = req.body;

  const thisBounce = await Song.findById(id);

  if (!thisBounce) {
    res.status(404);
    throw new Error('bounce not found');
  }

  thisBounce.comments = comments;
  thisBounce.date = date;
  if (latest && !thisBounce.latest) {
    const title = await Title.findById(titleId);
    title.selectedBounce = id;
    await title.save();
  }
  thisBounce.latest = latest;

  if (req.files) {
    const file = req.files.file;

    const streamId = await saveMp3(file);
    // delete old mp3
    const mp3Id = new mongodb.ObjectID(thisBounce.mp3);
    bucket.delete(mp3Id, async (err) => {
      if (err) {
        throw new Error('Error attempting to delete mp3');
      } else {
        console.log('mp3 deleted');

        // Get id of mp3 from stream object
        thisBounce.mp3 = streamId;
        // Edit bounce object form values
        thisBounce.size = file.size;
        thisBounce.duration = duration;
        await thisBounce.save();

        res.send(thisBounce);
      }
    });
  } else {
    await thisBounce.save();
    res.send(thisBounce);
  }
});

router.post('/bounces/delete', currentUser, requireAuth, async (req, res) => {
  const { bounceId, versionId } = req.body;
  console.log(req.body);

  const thisBounce = await Song.findById(bounceId);
  const mp3Id = new mongodb.ObjectID(thisBounce.mp3);
  const parentVersion = await Version.findById(versionId);
  if (parentVersion) {
    await Version.updateOne({ _id: versionId }, { $pull: { songs: bounceId } });
  }
  const playlistSongs = await PlaylistSong.find({ bounce: bounceId });

  await Promise.all(
    playlistSongs.map((pls) => {
      pls.bounce = null;
      return pls.save();
    })
  );

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
