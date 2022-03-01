import express from 'express';
import mongodb from 'mongodb';
import audioEncoder from 'audio-encoder';
import lamejs from 'lamejs';
import { Blob } from 'buffer';
import { Lame } from 'node-lame';
import wav from 'wav';
import audioconcat from 'audioconcat';
import audioCombiner from '../services/audio-combiner';
import FileReader from 'filereader';

import { Readable } from 'stream';
import { bucket } from './audio.js';
import fs from 'fs';

const mediaDir = './src/media';

const router = express.Router();

router.post('/recordings/combine', async (req, res) => {
  const { recordingList } = req.body;
  // const streamSequentially = (id) => {
  //   const mp3Id = new mongodb.ObjectID(id);
  //   const stream = bucket.openDownloadStream(mp3Id);
  //   const mp3Data = [];
  //   const mp3Encoder = new lamejs.Mp3Encoder(1, 441000, 128);
  //   const sampleBlockSize = 1152;
  //   let veryFirstChunk = null;
  //   let firstChunk = true;
  //   let output = [];
  //   // let header = true;
  //   // const reader = new wav.Reader();

  //   // stream.on('data', (chunk) => {
  //   //   file.push(chunk);
  //   // let punk = new Int16Array(chunk);
  //   // const array = new Int16Array(chunk);
  //   // const mp3buf = mp3Encoder.encodeBuffer(array);
  //   // mp3Data.push(new Int8Array(mp3buf));
  //   // });

  //   stream.on('data', (chunk) => {
  //     let piece = chunk;
  //     if (firstChunk) {
  //       piece = chunk.slice(44);
  //       firstChunk = false;
  //       if (!veryFirstChunk) {
  //         veryFirstChunk = piece;
  //       }
  //     }
  //     file.push(piece);
  //     // // console.log(chunk.length);
  //   });

  //   stream.on('end', () => {
  //     if (recordingList.length) {
  //       firstChunk = true;
  //       streamSequentially(recordingList.shift());
  //     } else {
  //       file.unshift(veryFirstChunk);
  //       file = Buffer.concat(file);
  recordingList.forEach((id) => {
    const encoder = new Lame({
      output: `${mediaDir}/${id}.mp3`,
      bitrate: 128,
    }).setFile(`${mediaDir}/${id}.wav`);

    encoder.encode();
  });

  const mp3List = recordingList.map((id) => {
    return `${mediaDir}/${id}.mp3`;
  });

  audioconcat(mp3List)
    .concat(`${mediaDir}/combined.mp3`)
    .on('end', () => {
      mp3List.forEach((mp3) => {
        fs.unlinkSync(mp3);
      });
      const file = fs.readFileSync(`${mediaDir}/combined.mp3`);
      res.send(file);
    });

  //   }
  // });
  // };

  // streamSequentially(recordingList.shift());
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
  // let mp3Id = new mongodb.ObjectID(id);
  // let file = [];
  // const stream = bucket.openDownloadStream(mp3Id);
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
  const file = fs.readFileSync(`${mediaDir}/${id}.wav`);

  res.send(file);
});

router.post('/recordings/', async (req, res) => {
  req.socket.setTimeout(10 * 60 * 1000);

  const file = req.files.file;

  // const fileReader = new FileReader();
  // fileReader.onload = (e) => {
  const newId = Math.floor(Math.random() * 10000000);
  fs.writeFileSync(
    `${mediaDir}/${newId}.wav`,
    Buffer.from(new Uint8Array(file.data))
  );
  res.send(`${newId}`);
  // };
  // fileReader.readAsArrayBuffer(file.data);

  // Create upload stream object
  // let stream = bucket.openUploadStream(file.name);

  // const readableStream = new Readable();
  // readableStream.push(file.data);
  // readableStream.push(null);
  // readableStream.pipe(stream);

  // stream.on('error', (err) => {
  //   throw new Error('Error uploading mp3!');
  // });

  // // Finish up on completed upload
  // stream.on('finish', async () => {
  //   console.log('saved recording');

  //   return res.status(201).send(stream.id);
  // });
});

router.post('/recordings/delete', (req, res) => {
  const { id } = req.body;
  // let mp3Id = new mongodb.ObjectID(id);
  // bucket.delete(mp3Id, (err) => {
  //   if (err) {
  //     throw new Error('Error attempting to delete mp3');
  //   } else {
  //     console.log('mp3 deleted');
  //   }
  // });
  fs.unlinkSync(`${mediaDir}/${id}.wav`);
  res.send(`${id}`);
});

export { router as recordingsRouter };
