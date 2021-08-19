import express from 'express';
import mongoose from 'mongoose';

import { Readable } from 'stream';
import { bucket } from './audio.js';
import { requireAuth } from '../middlewares/require-auth.js';
import { currentUser } from '../middlewares/current-user.js';


const Song = mongoose.model('Song');
const Version = mongoose.model('Version');

const router = express.Router();

router.post('/bounces', currentUser, requireAuth, async (req, res) => {

    // Increase timeout length for long uploads

    req.socket.setTimeout(10 * 60 * 1000);

    // Get parameters from post request and exit if there's an existing bounce with that date.

    const { bounceDate, bounceComments, duration, parentId } = req.body;
    const parentVersion = await Version.findOne({ _id: parentId }).populate('bounces');
    let duplicateDate = parentVersion.bounces.find(b => b.date === bounceDate);
    if (duplicateDate) {
        throw new Error('Duplicate date found in the version list');
    }

    const file = req.files.bounceFile;

    // Create a new bounce object form values

    const newBounce = new Bounce({date: bounceDate, comments: bounceComments, size: file.size, duration});



    // Create upload stream object
    let stream = bucket.openUploadStream(file.name);

    const readableStream = new Readable();
    readableStream.push(file.data);
    readableStream.push(null);
    readableStream.pipe(stream);


    stream.on('error', (err) => {
        throw new Error('Error uploading mp3!')
    });

    // Finish up on completed upload
    stream.on('finish', async () => {

        // Get id of mp3 from stream object
        newBounce.mp3 = stream.id;

        
        

        // Update the latest tag in the parent's bounce list

        let bounceList = parentVersion.bounces;
        if (req.body.bounceLatest) {

            let oldLatest = bounceList.find(b => b.latest);
            if (oldLatest) {
                await Song.updateOne({_id: oldLatest._id}, {latest: false});
            }
            newBounce.latest = true;
            
        } else if (!bounceList.find(b => b.latest)) {
            newBounce.latest = true;
        }

        // Add bounce to parent version's bounce list
        parentVersion.bounces.push(newBounce);

        // Finally save new bounce object
        await newBounce.save();
        await parentVersion.save();

        console.log('Uploaded & created bounce record:', newBounce);
        // axios request prevents redirect by express
        return res.status(201).send(newBounce);
    });

});


router.get('/bounces/:versionId', async (req, res) => {

    const version = await Version.findById(req.params.versionId).populate('songs');

    res.status(200).send(version.songs);

});

export { router as bounceRouter };