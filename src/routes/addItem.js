import { addMp3 } from './streamer.js';
import mongoose from 'mongoose';
import express from 'express';
import { requireAuth } from '../middlewares/require-auth.js';
import { currentUser } from '../middlewares/current-user.js';

const Tier = mongoose.model('Tier');
const Title = mongoose.model('Title');
const Version = mongoose.model('Version');
const Song = mongoose.model('Song');
const Band = mongoose.model('Band');


const router = express.Router();

router.post('/:bandName', currentUser, requireAuth, async (req, res) => {

    console.log(req.body);

    const bandName = req.params.bandName;

    const {dataID} = req.body;
    const [dataType, id] = dataID.split('-');

    switch(dataType) {
        case 'tier':
            const { tierName } = req.body;
            const newTier = new Tier({name: tierName});
            try {
                await Band.findOneAndUpdate({ name: bandName }, { $push: { tiers: newTier }});
                const allTiers = await Tier.find({}).sort({ position: 'descending' });
                if (allTiers[0]) {
                    newTier.position = allTiers[0].position + 1;
                } else {
                    newTier.position = 1;
                }
                await newTier.save();
            } catch (err) {
                req.session.errorMessage = 'Could not create that tier.';
            }
            return res.redirect(`/${bandName}`);
        case 'title':
            const { titleName } = req.body;
            const newTitle = new Title({title: titleName});
            try {
                await Tier.updateOne({ _id: id }, {$push: { trackList: newTitle }});
                await newTitle.save();
                res.redirect(`/${bandName}`);
            } catch (err) {
                req.session.errorMessage = 'There was an error creating the title or updating the tier tracklist.';
                res.redirect(`/${bandName}`);
            }
            break;
        case 'version':
            const { versionName, versionNotes} = req.body;
            const newVersion = new Version({name: versionName, notes: versionNotes});

            const parentTitle = await Title.findOne({ _id: id }).populate('versions');
            let versionList = parentTitle.versions;

            if (req.body.versionCurrent) {

     
                let oldCurrent = versionList.find(v => v.current);
                if (oldCurrent) {
                    await Version.updateOne({_id: oldCurrent._id}, {current: false});
                }
                newVersion.current = true;
  
            } else if (!versionList.find(v => v.current)) {
                newVersion.current = true;
            }
            console.log(newVersion);
            await newVersion.save();
            await Title.updateOne({ _id: id }, {$push: { versions: newVersion }});

            return res.redirect(`/${bandName}`);

        case 'song':
            // Increase timeout length for long uploads

            req.socket.setTimeout(10 * 60 * 1000);

            // Get parameters from post request and exit if there's an existing bounce with that date.

            const { songDate, songComments, duration } = req.body;
            const vers = await Version.findOne({ _id: id });
            let duplicateDate = vers.songs.find(s => s.date === songDate);
            if (duplicateDate) {
                req.session.errorMessage = 'There is already a bounce with that date.'
                res.redirect(`/${bandName}`);
                return;
            }

            // Create a new song object with the parameters we have

            const newSong = new Song({date: songDate, comments: songComments, size: req.files.songFile.size, duration});



            // Create upload stream object
            const stream = addMp3(req.files.songFile);

            stream.on('error', (err) => {
                req.session.errorMessage = 'error uploading mp3';
                res.redirect(`/${bandName}`);
            });

            // Finish up on completed upload
            stream.on('finish', async () => {

                // Get id of mp3 from stream object
                newSong.mp3 = stream.id;

                // Add song to parent version's song list
                await Version.updateOne({ _id: id }, {$push: { songs: newSong }});

                // Update the latest tag in the parent's song list
                const parentVersion = await Version.findOne({ _id: id }).populate('songs');
                let songList = parentVersion.songs;
                if (req.body.songLatest) {

                    let oldLatest = songList.find(s => s.latest);
                    if (oldLatest) {
                        await Song.updateOne({_id: oldLatest._id}, {latest: false});
                    }
                    newSong.latest = true;
                    
                } else if (!songList.find(s => s.latest)) {
                    newSong.latest = true;
                }

                // Finally save new song object
                await newSong.save();

                console.log('Uploaded & created song record:', newSong);
                // axios request prevents redirect by express
                return res.status(201).send({});
            });
            break;
        default:
            throw new Error('got invalid info for adding an item');
    }
});

export { router as addItemRouter };