import express from 'express';
import mongoose from 'mongoose';

import { requireAuth } from '../middlewares/require-auth.js';
import { currentUser } from '../middlewares/current-user.js';
import { deleteTier } from './deleteItem.js';

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

    if (thisTier.position > position) {
        const changePosition = otherTiers.filter(tier => tier.position >= position && tier.position < thisTier.position);
        changePosition.forEach(async (tier) => {
            tier.position = tier.position + 1;
            await tier.save();
        });
    } else if (thisTier.position < position) {
        const changePosition = otherTiers.filter(tier => tier.position > thisTier.position && tier.position <= position);
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

    const deletedTier = await deleteTier(tierId, currentBand);

    res.send(deletedTier);

});

export { router as tierRouter };