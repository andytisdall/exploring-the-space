import express from 'express';
import mongoose from 'mongoose';

import { requireAuth } from '../middlewares/require-auth.js';
import { currentUser } from '../middlewares/current-user.js';

const Title = mongoose.model('Title');
const Version = mongoose.model('Version');
const PlaylistSong = mongoose.model('PlaylistSong');
const Song = mongoose.model('Song');

const router = express.Router();

router.post('/versions', currentUser, requireAuth, async (req, res) => {
  const { name, notes, title, current } = req.body;
  const newVersion = new Version({ name, notes, current });
  await newVersion.save();

  const parentTitle = await Title.findById(title);
  parentTitle.versions.push(newVersion);

  if (current) {
    parentTitle.selectedVersion = newVersion.id;
    parentTitle.selectedBounce = null;
  }
  await parentTitle.save();

  return res.status(201).send(newVersion);
});

router.get('/versions/:titleId', async (req, res) => {
  const title = await Title.findById(req.params.titleId).populate('versions');

  res.status(200).send(title.versions);
});

router.patch('/versions/:id', currentUser, requireAuth, async (req, res) => {
  const { id } = req.params;
  const { name, notes, current, titleId } = req.body;

  const thisVersion = await Version.findById(id);

  if (name) {
    thisVersion.name = name;
  }
  thisVersion.notes = notes;

  if (!thisVersion.current && current) {
    const title = await Title.findById(titleId);
    title.selectedVersion = id;
    if (thisVersion.songs.length) {
      const ids = thisVersion.songs.map(mongoose.Types.ObjectId);
      const bounces = await Song.find({ _id: { $in: ids } });
      title.selectedBounce = bounces.find((b) => b.latest).id;
    }
    await title.save();
  }
  thisVersion.current = current;

  await thisVersion.save();

  res.send(thisVersion);
});

router.post('/versions/delete', currentUser, requireAuth, async (req, res) => {
  const { versionId, titleId } = req.body;

  let thisVersion = await Version.findById(versionId);
  const parentTitle = await Title.findById(titleId);
  if (parentTitle) {
    await Title.updateOne({ _id: titleId }, { $pull: { versions: versionId } });
  }

  const playlistSongs = await PlaylistSong.find({ version: versionId });

  playlistSongs.forEach(async (pls) => {
    pls.version = null;
    await pls.save();
  });

  await Version.deleteOne({ _id: versionId });

  res.send(thisVersion);
});

export { router as versionRouter };
