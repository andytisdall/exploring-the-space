import express from 'express';
import mongoose from 'mongoose';

import { requireAuth } from '../middlewares/require-auth.js';
import { currentUser } from '../middlewares/current-user.js';

const Band = mongoose.model('Band');
const Tier = mongoose.model('Tier');
const router = express.Router();

router.post('/tiers', currentUser, requireAuth, async (req, res) => {

    const { tierName, currentBand } = req.body;
    const newTier = new Tier({name: tierName});
    try {
        const band = await Band.findById(currentBand).populate('tiers');
        if (band.tiers.length) {
            newTier.position = band.tiers.length;
        } else {
            newTier.position = 0;
        }
        band.tiers.push(newTier);
        await band.save();
        await newTier.save();
    } catch (err) {
        throw new Error('Could not create that tier.');
    }
    return res.status(201).send(newTier);
});


router.get('/tiers/:id', async (req, res) => {

    const id = req.params.id;

    const band = await Band.findById(id).populate({
        path: 'tiers',
        options: { sort: 'postion' }
    });

    if (!band) {
        throw new Error('Band does not exist');
    }

    res.status(200).send(band.tiers);


});

router.patch('/tiers/:id', async (req, res) => {

    const { tierName, tierPosition } = req.body;

    const thisTier = await Tier.findOne({ _id: id });
    if (thisTier.position > tierPosition) {
        const changePosition = await Tier.find({
                position: { $gt: tierPosition-1, $lt: thisTier.position}
            });
        changePosition.forEach(async (tier) => {
            tier.position++;
            await tier.save();
            // await Tier.updateOne(
            //     { _id: tier.id },
            //     { position: tier.position+1 });
        });
        thisTier.position = tierPosition;
        // await Tier.updateOne({ _id: id }, { position: tierPosition });
        console.log(`Moving ${thisTier.position} to ${tierPosition}`);
    } else if (thisTier.position < tierPosition) {
        const changePosition = await Tier.find({ position: { $gt: thisTier.position, $lt: tierPosition+1 } });
        changePosition.forEach(async (tier) => {
            tier.position = tier.position -1;
            // await Tier.updateOne({ _id: tier.id }, { position: tier.position-1 });
        });
        thisTier.position = tierPosition;
        await Tier.updateOne({ _id: id }, { position: tierPosition });
        console.log(`Moving ${thisTier.position} to ${tierPosition}`);
    }

    await Tier.updateOne({ _id: id }, { name: tierName });
    res.redirect(`/${bandName}`);


});

export { router as tierRouter };