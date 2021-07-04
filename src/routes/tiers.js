import express from 'express';
import mongoose from 'mongoose';

import { requireAuth } from '../middlewares/require-auth.js';
import { currentUser } from '../middlewares/current-user.js';

const Band = mongoose.model('Band');
const Tier = mongoose.model('Tier');
const router = express.Router();

router.post('/tiers', currentUser, requireAuth, async (req, res) => {

    const { tierName, parentId } = req.body;
    const newTier = new Tier({name: tierName});
    try {
        const band = await Band.findById(parentId).populate('trackList');
        if (band.trackList.length) {
            newTier.position = band.trackList.length;
        } else {
            newTier.position = 0;
        }
        band.trackList.push(newTier);
        await band.save();
        await newTier.save();
    } catch (err) {
        throw new Error('Could not create that tier.');
    }
    return res.status(201).send(newTier);
});


router.get('/tiers/:bandName', async (req, res) => {

    let bandName = req.params.bandName
    if (bandName === 'apprehenchmen') {
        bandName = 'Apprehenchmen';
    }

    const band = await Band.findOne({ name: bandName }).populate('trackList');

    if (!band) {
        throw new Error('Band does not exist');
    }

    res.status(200).send(band.tiers);


});

export { router as tierRouter };