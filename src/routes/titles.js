import express from 'express';
import mongoose from 'mongoose';

import { requireAuth } from '../middlewares/require-auth.js';
import { currentUser } from '../middlewares/current-user.js';

const Tier = mongoose.model('Tier');
const Title = mongoose.model('Title');

const router = express.Router();

router.post('/titles', currentUser, requireAuth, async (req, res) => {

    const { titleName, parentId } = req.body;
    const newTitle = new Title({title: titleName});
    try {
        await Tier.updateOne({ _id: parentId }, {$push: { trackList: newTitle }});
        await newTitle.save();
    } catch (err) {
        throw new Error('There was an error creating the title or updating the tier tracklist.');
    }
    return res.status(201).send(newTitle);
});


router.get('/titles/:tierId', async (req, res) => {

    const tier = await Tier.findById(req.params.tierId).populate('trackList');

    res.status(200).send(tier.trackList);


});

export { router as titleRouter };