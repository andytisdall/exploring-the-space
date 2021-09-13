import express from 'express';
import mongoose from 'mongoose';

import { requireAuth } from '../middlewares/require-auth.js';
import { currentUser } from '../middlewares/current-user.js';
import { deleteVersion } from './deleteItem.js';

const Title = mongoose.model('Title');
const Version = mongoose.model('Version');

const router = express.Router();

router.post('/versions', currentUser, requireAuth, async (req, res) => {

    const { name, notes, title, current } = req.body;
    const newVersion = new Version({ name, notes, current });
    await newVersion.save();

    const parentTitle = await Title.findById(title);
    parentTitle.versions.push(newVersion);
    await parentTitle.save();

    return res.status(201).send(newVersion);
});


router.get('/versions/:titleId', async (req, res) => {


    const title = await Title.findById(req.params.titleId).populate('versions');

    res.status(200).send(title.versions);


});

router.patch('/versions/:id', currentUser, requireAuth, async (req, res) => {

    const { id } = req.params;
    const { name, notes, current } = req.body;

    const thisVersion = await Version.findById(id);

    if (name) {
        thisVersion.name = name;
    }
    thisVersion.notes = notes;
    thisVersion.current = current;

    await thisVersion.save();

    res.send(thisVersion);

});

router.post('/versions/delete', currentUser, requireAuth, async (req, res) => {
    const { versionId, titleId } = req.body;

    const deletedVersion = await deleteVersion(versionId, titleId);

    res.send(deletedVersion);

});

export { router as versionRouter };