import express from 'express';
import mongoose from 'mongoose';

import { requireAuth } from '../middlewares/require-auth.js';
import { currentUser } from '../middlewares/current-user.js';
import { deleteTitle } from './deleteItem.js'

const Tier = mongoose.model('Tier');
const Title = mongoose.model('Title');

const router = express.Router();

router.post('/titles', currentUser, requireAuth, async (req, res) => {

    const { title, tier } = req.body;
    const newTitle = new Title({title});
    try {
        await Tier.updateOne({ _id: tier }, {$push: { trackList: newTitle }});
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

router.patch('/titles/:id', currentUser, requireAuth, async (req, res) => {

    const { id } = req.params;
    const { title } = req.body;

    const thisTitle = await Title.findById(id);

    if (title) {
        thisTitle.title = title;
    }
    await thisTitle.save();

    res.send(thisTitle);

});

router.post('/titles/delete', currentUser, requireAuth, async (req, res) => {
    const { titleId, tierId } = req.body;

    const deletedTitle = await deleteTitle(titleId, tierId);

    res.send(deletedTitle);

});

export { router as titleRouter };