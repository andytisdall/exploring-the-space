import express from 'express';
import mongoose from 'mongoose';
import mongodb from 'mongodb';
import moment from 'moment';

let bucket;

mongoose.connection.on('connected', () => {
  bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    chunkSizeBytes: 1024,
    bucketName: 'mp3s',
  });
  console.log('bucket online');
});

const Song = mongoose.model('Song');
const router = express.Router();

router.get('/audio/:id', async (req, res) => {
  const id = req.params.id.split('.')[0];
  const thisSong = await Song.findById(id);
  let mp3Id = new mongodb.ObjectID(thisSong.mp3);

  // fix so that safari can request ranges of the file

  const parts = req.headers.range.replace(/bytes=/, '').split('-');
  const partialstart = parts[0];
  const partialend = parts[1];
  const start = parseInt(partialstart, 10);
  const end = partialend ? parseInt(partialend, 10) : thisSong.size - 1;
  const chunksize = end - start + 1;

  res.set({
    'Accept-Ranges': 'bytes',
    'Content-Length': chunksize,
    'Content-Type': 'audio/mpeg',
    'Content-Range': 'bytes ' + start + '-' + end + '/' + thisSong.size,
  });

  // chrome sends the first range request as bytes=0-
  // and it wants the whole file
  if ((start === 0 || start === end - 1) && !partialend) {
    const stream = bucket.openDownloadStream(mp3Id);

    stream.on('error', (err) => {
      throw new Error('Could not find mp3');
    });

    stream.pipe(res);

    // safari sends a range request of bytes=0-1 and then one for bytes=0-(end of file)
  } else if (chunksize === thisSong.size) {
    const stream = bucket.openDownloadStream(mp3Id);

    // read the whole stream to an array and then send the buffer with the response for safari
    let file = [];
    stream.on('data', (chunk) => {
      file.push(chunk);
    });

    stream.on('error', (err) => {
      throw new Error('Could not find mp3');
    });

    stream.on('end', () => {
      file = Buffer.concat(file);
      res.send(file);
    });

    res.status(206);
  } else {
    // for partial chrome requests and
    // for the initial safari request
    const stream = bucket.openDownloadStream(mp3Id, { start, end: end - 1 });
    res.status(206);
    stream.pipe(res);
  }
});

router.get('/audio/download/:id/:title', async (req, res) => {
  const id = req.params.id;
  const title = req.params.title;
  const thisSong = await Song.findById(id);
  let mp3Id = new mongodb.ObjectID(thisSong.mp3);
  const stream = bucket.openDownloadStream(mp3Id);

  // read the whole stream to an array and then send the buffer with the response
  let file = [];

  res.status(200).set({
    'Content-Type': 'audio/mpeg',
    'Content-Disposition': `attachment; filename="${title} ${moment
      .utc(thisSong.date)
      .format('MM-DD-yy')}.mp3"`,
  });

  stream.on('data', (chunk) => {
    file.push(chunk);
  });

  stream.on('error', (err) => {
    throw new Error(err.message);
  });

  stream.on('end', () => {
    file = Buffer.concat(file);
    res.send(file);
  });
});

router.get('/audio/edit/:id', async (req, res) => {
  const id = req.params.id;
  const thisSong = await Song.findById(id);
  let mp3Id = new mongodb.ObjectID(thisSong.mp3);
  const stream = bucket.openDownloadStream(mp3Id);

  // read the whole stream to an array and then send the buffer with the response

  // const thing = new Writable();
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
    file = Buffer.concat(file);
    // let arraybuffer = Uint8Array.from(file).buffer;
    // res.send(arraybuffer);

    // res.send(file);
    res.send(file);
  });
});

export { router as audioRouter, bucket };
