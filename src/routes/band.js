import express from 'express';
import { User } from '../models/user.js';
import { Band } from '../models/band.js';
import { requireAuth } from '../middlewares/require-auth.js';
import { currentUser } from '../middlewares/current-user.js';

const router = express.Router();

router.post('/bands', currentUser, requireAuth, async (req, res) => {


    const { bandName } = req.body;

    const userId = req.currentUser.id;

    const existingBand = await Band.findOne({ name: bandName });

    if (existingBand) {
        throw new Error('This band name is taken.');
    }

    const band = new Band({
        name: bandName
    });

    await User.findOneAndUpdate({ _id: userId }, { $push: { bands: band }});
    await band.save();

    res.status(201).send(band);

});

router.get('/bands', async (req, res) => {

    const bands = await Band.find({});

    res.status(200).send(bands);

})

router.get('/bands/:bandId', async (req, res) => {


    const band = await Band.findById(req.params.bandId);

    if (!band) {
        throw new Error('Band does not exist');
    }

    res.status(200).send(band);

});

export { router as bandRouter };