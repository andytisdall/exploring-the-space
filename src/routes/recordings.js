import express from 'express';
import { Lame } from 'node-lame';
import audioconcat from 'audioconcat';
import fs from 'fs';

const mediaDir = './src/media';

const router = express.Router();

router.post('/recordings/combine', async (req, res) => {
  const { recordingList } = req.body;

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
      res.set({
        'Content-Type': 'audio/mpeg',
      });
      res.send(file);
    });
});

router.get('/recordings/:id', (req, res) => {
  const { id } = req.params;
  const file = fs.readFileSync(`${mediaDir}/${id}.wav`);

  const parts = req.headers.range.replace(/bytes=/, '').split('-');
  const partialstart = parts[0];
  const partialend = parts[1];
  const start = parseInt(partialstart, 10);
  const end = partialend ? parseInt(partialend, 10) : file.length - 1;
  const chunksize = end - start + 1;

  res.set({
    'Accept-Ranges': 'bytes',
    'Content-Length': chunksize,
    'Content-Type': 'audio/wav',
    'Content-Range': 'bytes ' + start + '-' + end + '/' + file.length,
  });

  // chrome sends the first range request as bytes=0-
  // and it wants the whole file
  if (
    ((start === 0 || start === end - 1) && !partialend) ||
    chunksize === file.length
  ) {
    res.send(file);
  } else {
    // for partial chrome requests and
    // for the initial safari request
    const partialFile = file.slice(start, end - 1);
    res.status(206);
    res.send(partialFile);
  }
});

router.post('/recordings/', async (req, res) => {
  req.socket.setTimeout(10 * 60 * 1000);
  const file = req.files.file;
  const newId = Math.floor(Math.random() * 10000000);
  fs.writeFileSync(
    `${mediaDir}/${newId}.wav`,
    Buffer.from(new Uint8Array(file.data))
  );

  res.send(`${newId}`);
});

router.post('/recordings/delete', (req, res) => {
  const { id } = req.body;
  fs.unlinkSync(`${mediaDir}/${id}.wav`);
  res.send(`${id}`);
});

export { router as recordingsRouter };
