import express from 'express';
import mongodb from 'mongodb';
import { encode } from 'base64-arraybuffer';

import { Readable } from 'stream';
import { bucket } from './audio.js';

const router = express.Router();

router.get('/recordings/:id', async (req, res) => {
  req.socket.setTimeout(10 * 60 * 1000);
  const { id } = req.params;
  let mp3Id = new mongodb.ObjectID(id);
  let stream;

  try {
    stream = bucket.openDownloadStream(mp3Id);
  } catch (err) {
    throw new Error(err.message);
  }

  let file = [];

  res.status(200).set({
    'Content-Type': 'audio/mpeg',
  });

  stream.on('data', (chunk) => {
    file.push(chunk);
  });

  stream.on('error', (err) => {
    throw new Error(err.message);
  });

  stream.on('end', () => {
    try {
      file = Buffer.concat(file);
      // const base64String = encode(file);
      // if (id === '62185a527b5729c1544b147f') {
      //   console.log('file encoded');
      // }
      // res.send(base64String);
      res.send(file);
    } catch (err) {
      throw new Error(err.message);
    }
  });
});

router.post('/recordings/', async (req, res) => {
  req.socket.setTimeout(10 * 60 * 1000);

  const file = req.files.file;

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
    console.log('saved recording');

    return res.status(201).send(stream.id);
  });
});

router.post('/recordings/delete', (req, res) => {
  const { id } = req.body;
  let mp3Id = new mongodb.ObjectID(id);
  bucket.delete(mp3Id, (err) => {
    if (err) {
      throw new Error('Error attempting to delete mp3');
    } else {
      console.log('mp3 deleted');
    }
  });
  res.send(id);
});

export { router as recordingsRouter };
