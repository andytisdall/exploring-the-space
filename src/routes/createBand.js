import express from 'express';
import { User } from '../models/user.js';
import { Band } from '../models/band.js';
import { requireAuth } from '../middlewares/require-auth.js';
import { currentUser } from '../middlewares/current-user.js';

const router = express.Router();

router.post('/create-band', currentUser, requireAuth, async (req, res) => {

    req.session.errorMessage = '';

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

    res.redirect(`/${bandName}`);

});

export { router as createBandRouter };