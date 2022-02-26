import express from 'express';
import mongodb from 'mongodb';

import { Readable } from 'stream';
import { bucket } from './audio.js';

const router = express.Router();

router.post('/recordings/combine', async (req, res) => {
  const { recordingList } = req.body;
  let file = [];
  const streamSequentially = (id) => {
    const mp3Id = new mongodb.ObjectID(id);
    const stream = bucket.openDownloadStream(mp3Id);

    stream.on('data', (chunk) => {
      file.push(chunk);
    });

    stream.on('end', () => {
      if (recordingList.length) {
        streamSequentially(recordingList.pop(0));
      } else {
        file = Buffer.concat(file);
        res.send(file);
      }
    });
  };

  streamSequentially(recordingList.pop(0));
});

router.get('/recordings/:id', (req, res) => {
  const { id } = req.params;
  let mp3Id = new mongodb.ObjectID(id);

  const stream = bucket.openDownloadStream(mp3Id);

  // read the whole stream to an array and then send the buffer with the response for safari
  let file = [];
  stream.pipe(res);
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
