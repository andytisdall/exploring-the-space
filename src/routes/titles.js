import express from 'express';
import mongoose from 'mongoose';

import { requireAuth } from '../middlewares/require-auth.js';
import { currentUser } from '../middlewares/current-user.js';

const Tier = mongoose.model('Tier');
const Title = mongoose.model('Title');

const router = express.Router();

router.post('/titles', currentUser, requireAuth, async (req, res) => {
  const { title, tier } = req.body;
  const newTitle = new Title({ title });
  try {
    await newTitle.save();
    await Tier.updateOne({ _id: tier }, { $push: { trackList: newTitle } });
  } catch (err) {
    throw new Error(err.message);
  }
  return res.status(201).send(newTitle);
});

router.get('/titles/:tierId', async (req, res) => {
  const tier = await Tier.findById(req.params.tierId).populate('trackList');

  res.status(200).send(tier.trackList);
});

router.patch('/titles/:id', currentUser, requireAuth, async (req, res) => {
  const { id } = req.params;
  const { title, move, currentTier } = req.body;

  const thisTitle = await Title.findById(id);

  thisTitle.title = title;

  if (move) {
    const oldTier = await Tier.findById(currentTier);
    const newTier = await Tier.findById(move);
    oldTier.trackList = oldTier.trackList.filter((t) => {
      return t.toString() !== id;
    });
    newTier.trackList.push(id);
    oldTier.save();
    newTier.save();
  }

  thisTitle.save();

  res.send(thisTitle);
});

router.post('/titles/delete', currentUser, requireAuth, async (req, res) => {
  const { titleId, tierId } = req.body;

  const parentTier = await Tier.findById(tierId);
  if (parentTier) {
    await Tier.updateOne({ _id: tierId }, { $pull: { trackList: titleId } });
  }

  const thisTitle = await Title.findById(titleId);

  await Title.deleteOne({ _id: titleId });

  res.send(thisTitle);
});

export { router as titleRouter };
