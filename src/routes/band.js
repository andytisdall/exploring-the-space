import express from 'express';
import { User } from '../models/user.js';
import { Band } from '../models/band.js';
import { requireAuth } from '../middlewares/require-auth.js';
import { currentUser } from '../middlewares/current-user.js';

const router = express.Router();

router.post('/bands', currentUser, async (req, res) => {
  const { bandName } = req.body;

  const userId = req.currentUser.id;

  const existingBand = await Band.findOne({ name: bandName });

  if (existingBand) {
    throw new Error('This band name is taken.');
  }

  const band = new Band({
    name: bandName,
    url: bandName.replace(/ /g, '').toLowerCase(),
  });

  await User.findOneAndUpdate({ _id: userId }, { $push: { bands: band } });
  await band.save();

  res.status(201).send(band);
});

router.patch('/bands/', currentUser, requireAuth, async (req, res) => {
  const { name, currentBand } = req.body;

  const band = await Band.findById(currentBand);

  band.name = name;
  band.url = name.replace(/ /g, '').toLowerCase();

  await band.save();

  res.send(band);
});

router.get('/bands', async (req, res) => {
  const bands = await Band.find({});

  res.status(200).send(bands);
});

router.get('/bands/:bandName', async (req, res) => {
  let bandName = req.params.bandName;
  const band = await Band.findOne({ url: bandName });

  if (!band) {
    throw new Error('Band does not exist');
  }

  res.status(200).send(band);
});

router.post('/bands/delete', currentUser, requireAuth, async (req, res) => {
  const { currentBand } = req.body;
  const user = req.currentUser;

  const band = await Band.findById(currentBand);
  const bands = user.bands.filter((id) => id !== currentBand);
  user.bands = bands;
  await user.save();

  await Band.deleteOne({ _id: currentBand });
  res.send(band);
});

export { router as bandRouter };
