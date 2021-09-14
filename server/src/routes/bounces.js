import express from 'express';
import mongoose from 'mongoose';

import { Readable } from 'stream';
import { bucket } from './audio.js';
import { requireAuth } from '../middlewares/require-auth.js';
import { currentUser } from '../middlewares/current-user.js';
import { deleteBounce } from './deleteItem.js';


const Song = mongoose.model('Song');
const Version = mongoose.model('Version');

const router = express.Router();

router.post('/bounces', currentUser, requireAuth, async (req, res) => {

    // Increase timeout length for long uploads

    req.socket.setTimeout(10 * 60 * 1000);

    // Get parameters from post request and exit if there's an existing bounce with that date.

    const { date, comments, duration, version, latest } = req.body;
    const parentVersion = await Version.findById(version).populate('songs');
    if (parentVersion.songs)  {
        let duplicateDate = parentVersion.songs.find(b => b.date === date);
        if (duplicateDate) {
            throw new Error('Duplicate date found in the version list');
        }
    }

    const file = req.files.file;

    // Create a new bounce object form values

    const newBounce = new Song({date, comments, size: file.size, duration});



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

        let bounceList = parentVersion.songs;

        if (latest) {

            let oldLatest = bounceList.find(b => b.latest);
            if (oldLatest) {
                await Song.updateOne({_id: oldLatest._id}, {latest: false});
            }
            newBounce.latest = true;
            
        } else if (!bounceList.find(b => b.latest)) {
            newBounce.latest = true;
        }

        // Add bounce to parent version's bounce list
        parentVersion.songs.push(newBounce);

        // Finally save new bounce object
        await newBounce.save();
        await parentVersion.save();

        console.log('Uploaded & created bounce record:', newBounce);

        return res.status(201).send(newBounce);
    });

});


router.get('/bounces/:versionId', async (req, res) => {

    const version = await Version.findById(req.params.versionId).populate('songs');
    
    res.status(200).send(version.songs);

});


router.patch('/bounces/:id', currentUser, requireAuth, async (req, res) => {

    const { id } = req.params;
    const { date, comments, duration, latest } = req.body;

    const thisBounce = await Song.findById(id);

    thisBounce.comments = comments;
    thisBounce.date = date;

    if (latest) {
        thisBounce.latest = latest;
        Song.updateOne({ latest: true }, { latest: false });
    }

    if (req.files) {
        const file = req.files.file;

        // Edit bounce object form values

        thisBounce.size = file.size;
        thisBounce.duration = duration;

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
            thisBounce.mp3 = stream.id;
            await thisBounce.save();
            res.send(thisBounce);
        });

    } else {
        await thisBounce.save();
        res.send(thisBounce);
    }
});

router.post('/bounces/delete', currentUser, requireAuth, async (req, res) => {
    const { bounceId, versionId } = req.body;

    const deletedBounce = await deleteBounce(bounceId, versionId);

    res.send(deletedBounce);

});

export { router as bounceRouter };