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
  res.set({
    'Content-Type': 'audio/wav',
  });
  res.send(file);
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
