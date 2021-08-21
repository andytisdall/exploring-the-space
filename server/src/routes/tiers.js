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

router.patch('/tiers/:id', currentUser, requireAuth, async (req, res) => {

    const { id } = req.params;
    const { name, position } = req.body;

    const thisTier = await Tier.findOne({ _id: id });
    if (thisTier.position > position) {
        const changePosition = await Tier.find({
                position: { $gte: position, $lt: thisTier.position }
            });
        changePosition.forEach(async (tier) => {
            tier.position = tier.position + 1;
            await tier.save();
            // await Tier.updateOne(
            //     { _id: tier.id },
            //     { position: tier.position+1 });
        });
        console.log(`Moving ${thisTier.position} to ${position}`);
        thisTier.position = position;
        // await Tier.updateOne({ _id: id }, { position: position });

    } else if (thisTier.position < position) {
        const changePosition = await Tier.find({ position: { $gt: thisTier.position, $lte: position } });
        changePosition.forEach(async (tier) => {
            tier.position = tier.position - 1;
            // await Tier.updateOne({ _id: tier.id }, { position: tier.position-1 });
            await tier.save();
        });
        console.log(`Moving ${thisTier.position} to ${position}`);
        thisTier.position = position;
        await Tier.updateOne({ _id: id }, { position: position });

    }
    if (name) {
        thisTier.name = name;
    }
    await thisTier.save();

    res.send(thisTier);

});

router.delete('/tiers', currentUser, requireAuth, async (req, res) => {
    const { tierId, currentBand } = req.body;

    const deletedTier = deleteTier(tierId, currentBand);

    res.send(deletedTier);

});

export { router as tierRouter };