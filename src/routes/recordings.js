import express from 'express';
import mongodb from 'mongodb';
import audioEncoder from 'audio-encoder';
import lamejs from 'lamejs';
import { Blob } from 'buffer';
import { Lame } from 'node-lame';
import wav from 'wav';
import audioconcat from 'audioconcat';

import { Readable } from 'stream';
import { bucket } from './audio.js';

const router = express.Router();

router.post('/recordings/combine', async (req, res) => {
  const { recordingList } = req.body;
  let file = [];
  const streamSequentially = (id) => {
    const mp3Id = new mongodb.ObjectID(id);
    const stream = bucket.openDownloadStream(mp3Id);
    const mp3Data = [];
    const mp3Encoder = new lamejs.Mp3Encoder(1, 441000, 128);
    const sampleBlockSize = 1152;

    const output = [];
    // let header = true;
    // const reader = new wav.Reader();

    // stream.on('data', (chunk) => {
    //   file.push(chunk);
    // let punk = new Int16Array(chunk);
    // const array = new Int16Array(chunk);
    // const mp3buf = mp3Encoder.encodeBuffer(array);
    // mp3Data.push(new Int8Array(mp3buf));
    // });

    stream.on('data', (chunk) => {
      file.push(chunk);
    });

    stream.on('end', () => {
      file = Buffer.concat(file);

      const encoder = new Lame({
        output: 'buffer',
        bitrate: 128,
      }).setBuffer(file);

      encoder
        .encode()
        .then(() => {
          const buffer = encoder.getBuffer();
          output.push(buffer);
        })
        .catch((err) => {
          throw new Error(err.message);
        });

      if (recordingList.length) {
        file = [];
        streamSequentially(recordingList.shift());
      } else {
        audioconcat(output)
          .concat('combined.mp3')
          .on('end', (combined) => {
            res.send(combined);
          });
      }
    });
  };

  streamSequentially(recordingList.shift());
  // stream.pipe(reader);

  // file = Buffer.concat(file);
  // file = new ArrayBuffer(file);

  // const wav = lamejs.WavHeader.readHeader(new DataView(file));
  // // file = new Int16Array(file);

  // // const sampleBlockSize = 576;

  // // for (let i = 0; i < file.length; i += sampleBlockSize) {
  // //   const chunk = file.subarray(i, i + sampleBlockSize);
  // //   const mp3Buf = mp3Encoder.encodeBuffer(chunk);

  // // }
  // var samples = new Int16Array(file);
  // let remaining = samples.length;
  // for (let i = 0; remaining >= sampleBlockSize; i += sampleBlockSize) {
  //   const sampleChunk = samples.subarray(i, i + sampleBlockSize);
  //   const mp3buf = mp3Encoder.encodeBuffer(sampleChunk);
  //   if (mp3buf.length > 0) {
  //     mp3Data.push(new Int8Array(mp3buf));
  //   }
  //   remaining -= sampleBlockSize;
  // }
  // const lastChunk = mp3Encoder.flush();
  // if (lastChunk.length) {
  //   mp3Data.push(new Int8Array(lastChunk));
  // }
  // res.set({
  //   'Content-Type': 'audio/mpeg',
  // });
  // const encoder = new Lame({
  //   output: 'buffer',
  //   bitrate: 128,
  // }).setBuffer(file);

  // encoder
  //   .encode()
  //   .then(() => {
  //     const buffer = encoder.getBuffer();
  //     res.send(buffer);
  //   })
  //   .catch((err) => {
  //     throw new Error(err.message);
  //   });
  // const blob = new Blob(mp3Data, { type: 'audio/mpeg' });
  // // console.log(1);
  // };

  // streamSequentially(recordingList.shift());
});

router.get('/recordings/:id', (req, res) => {
  const { id } = req.params;
  let mp3Id = new mongodb.ObjectID(id);
  let file = [];
  const stream = bucket.openDownloadStream(mp3Id);
  // stream.on('data', (chunk) => {
  //   file.push(chunk);
  //   // let punk = new Int16Array(chunk);
  //   // const array = new Int16Array(chunk);
  //   // const mp3buf = mp3Encoder.encodeBuffer(array);
  //   // mp3Data.push(new Int8Array(mp3buf));
  // });

  // stream.on('end', () => {
  //   file = Buffer.concat(file);
  //   res.send(file);
  // });

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
