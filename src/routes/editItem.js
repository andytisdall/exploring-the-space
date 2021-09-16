import mongoose from 'mongoose';
import express from 'express';
import { currentUser } from '../middlewares/current-user.js';
import { requireAuth } from '../middlewares/require-auth.js';
import { addMp3, deleteMp3 } from './streamer.js';
import mongodb from 'mongodb';

const Tier = mongoose.model('Tier');
const Title = mongoose.model('Title');
const Version = mongoose.model('Version');
const Bounce = mongoose.model('Bounce');

const router = express.Router();

router.post('/:bandName/edit', currentUser, requireAuth, async (req, res) => {

    const bandName = req.params.bandName;
    const {dataID} = req.body;
    const [dataType, id] = dataID.split('-');

    switch (dataType) {

        case 'tier':
            const { tierName, tierPosition } = req.body;

            const thisTier = await Tier.findOne({ _id: id });
            if (thisTier.position > tierPosition) {
                const changePosition = await Tier.find({
                        position: { $gt: tierPosition-1, $lt: thisTier.position}
                    });
                console.log(changePosition);
                changePosition.forEach(async (tier) => {
                    await Tier.updateOne(
                        { _id: tier.id },
                        { position: tier.position+1 });
                });
                await Tier.updateOne({ _id: id }, { position: tierPosition });
                console.log(`Moving ${thisTier.position} to ${tierPosition}`);
            } else if (thisTier.position < tierPosition) {
                const changePosition = await Tier.find({ position: { $gt: thisTier.position, $lt: tierPosition+1 } });
                changePosition.forEach(async (tier) => {
                    await Tier.updateOne({ _id: tier.id }, { position: tier.position-1 });
                });
                await Tier.updateOne({ _id: id }, { position: tierPosition });
                console.log(`Moving ${thisTier.position} to ${tierPosition}`);
            }

            await Tier.updateOne({ _id: id }, { name: tierName });
            res.redirect(`/${bandName}`);

            break;
        case 'title':
            const { titleName, moveTier, parentID } = req.body;
       
            await Title.updateOne({ _id: id }, { title: titleName });
 
            if (moveTier !== parentID) {
           
                await Tier.updateOne({ _id: parentID }, { $pull: { trackList: id } });
                await Tier.updateOne({ _id: moveTier }, { $push: { trackList: id } });
                res.redirect(`/${bandName}`);

            } else {
                res.redirect(`/${bandName}`);
            }
            break;
        case 'version':
            const { versionName, versionNotes } = req.body;
            // let current = false;
            // if (req.body.versionCurrent) {
            //     current = true;
            // }

            await Version.updateOne({ _id: id }, { name: versionName, notes: versionNotes });
            res.redirect(`/${bandName}`);
  
            break;
        case 'bounce':
            //Get data
            const { bounceDate, bounceComments, versionID } = req.body;
            //Exit if this date exists in the version's bounce list
            const vers = await Version.findOne({ _id: versionID });
            let duplicateDate = vers.bounces.find(b => b.date === bounceDate);
            if (duplicateDate) {
                req.session.errorMessage = 'There is already a bounce with that date.'
                res.redirect(`/${bandName}`);
                return;
            }
            //Update bounce with new data

            await Bounce.updateOne({ _id: id }, { date: bounceDate, comments: bounceComments });

            
            // Update mp3 if there's a new one
            if (req.files) {
                req.socket.setTimeout(10 * 60 * 1000);
                const stream = addMp3(req.files.bounceFile);
                stream.on('error', (err) => {
                    req.session.errorMessage = 'error uploading mp3';
                    res.redirect(`/${bandName}`);
                    return;
                });
                stream.on('finish', async () => {

                    //update mp3 id for bounce
                    let mp3 = stream.id;
                    let oldMp3 = await Bounce.findOne({ _id: id }).mp3;
                    await Bounce.updateOne({ _id: id }, { mp3, size: req.files.bounceFile.size, duration: req.body.duration });
                    console.log('Uploaded new mp3');
                    // Delete old mp3
                    let mp3Id = new mongodb.ObjectID(oldMp3);
                    deleteMp3(mp3Id);
                });
            }

            //update latest tag for parent version
            let latest = false;
            if (req.body.bounceLatest) {
                latest = true;
            }
            const parentVersion = await Version.findOne({ _id: versionID }).populate('bounces');
            let oldLatest = parentVersion.bounces.find(s => s.latest);
            if (latest) {

                if (oldLatest) {
                    await Bounce.updateOne({_id: oldLatest.id}, {latest: false});
                }

            } else if (!oldLatest) {
                latest = true;
            }

            // Update the bounce record with the new info


            await Bounce.updateOne({ _id: id }, { date: bounceDate, comments: bounceComments, latest });
            return res.redirect(`/${bandName}`);
        default:
            throw new Error('Incorrect data type for editing');
    }
});




router.post('/:bandName/change-song', async (req, res) => {

    const bandName = req.params.bandName;
    
    const { currentBounce, changeBounce } = req.body;

    await Bounce.updateOne({ _id: changeBounce }, { latest: true });
    await Bounce.updateOne({ _id: currentBounce }, { latest: false });
    res.redirect(`/${bandName}`);


});

router.post('/:bandName/change-version', async (req, res) => {
    

    const bandName = req.params.bandName;
    
    const { currentVersion, changeVersion } = req.body;

    await Version.updateOne({ _id: changeVersion }, { current: true });
    await Version.updateOne({ _id: currentVersion }, { current: false });
    res.redirect(`/${bandName}`);

});

export { router as editRouter };