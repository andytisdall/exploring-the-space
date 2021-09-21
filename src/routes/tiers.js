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
            newTier.position = band.tiers.length + 1;
        } else {
            newTier.position = 1;
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

router.patch('/tiers/:id', currentUser, requireAuth, async (req, res) => {

    const { id } = req.params;
    const { name, position, currentBand } = req.body;

    const thisTier = await Tier.findById(id);

    const band = await Band.findById(currentBand).populate('tiers')

    const otherTiers = band.tiers;

    const oldPosition = thisTier.position;

    if (oldPosition > position) {
        const changePosition = otherTiers.filter(tier => tier.position >= position && tier.position < oldPosition);
        changePosition.forEach(async (tier) => {
            tier.position = tier.position + 1;
            await tier.save();
        });
    } else if (oldPosition < position) {
        const changePosition = otherTiers.filter(tier => tier.position > oldPosition && tier.position <= position);
        changePosition.forEach(async (tier) => {
            tier.position = tier.position - 1;
            await tier.save();
        });
    }
    thisTier.position = position;

    if (name) {
        thisTier.name = name;
    }

    await thisTier.save();

    res.send(thisTier);

});

router.post('/tiers/delete', currentUser, requireAuth, async (req, res) => {
    const { tierId, currentBand } = req.body;

    let thisTier = await Tier.findById(tierId);

    const band = Band.findById(currentBand).populate('tiers');

    if (band) {
        await Band.updateOne({ _id: currentBand }, { $pull: {tiers: tierId} });
    }

    const changePosition = band.tiers.filter(t => t.position > thisTier.position);
    changePosition.forEach(async (tier) => {
        tier.position = tier.position - 1;
        await tier.save();
    });
    await Tier.deleteOne({ _id: tierId });

    res.send(thisTier);

});

export { router as tierRouter };