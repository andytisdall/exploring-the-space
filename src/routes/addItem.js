// import { addMp3 } from './streamer.js';
// import mongoose from 'mongoose';
// import express from 'express';
// import { requireAuth } from '../middlewares/require-auth.js';
// import { currentUser } from '../middlewares/current-user.js';

// const Tier = mongoose.model('Tier');
// const Title = mongoose.model('Title');
// const Version = mongoose.model('Version');
// const Bounce = mongoose.model('Bounce');
// const Band = mongoose.model('Band');


// const router = express.Router();

// router.post('/:bandName', currentUser, requireAuth, async (req, res) => {

//     console.log(req.body);

//     const bandName = req.params.bandName;

//     const {dataID} = req.body;
//     const [dataType, id] = dataID.split('-');

//     switch(dataType) {
//         case 'tier':
//             const { tierName } = req.body;
//             const newTier = new Tier({name: tierName});
//             try {
//                 await Band.findOneAndUpdate({ name: bandName }, { $push: { tiers: newTier }});
//                 const allTiers = await Tier.find({}).sort({ position: 'descending' });
//                 if (allTiers[0]) {
//                     newTier.position = allTiers[0].position + 1;
//                 } else {
//                     newTier.position = 1;
//                 }
//                 await newTier.save();
//             } catch (err) {
//                 req.session.errorMessage = 'Could not create that tier.';
//             }
//             return res.redirect(`/${bandName}`);
//         case 'title':
//             const { titleName } = req.body;
//             const newTitle = new Title({title: titleName});
//             try {
//                 await Tier.updateOne({ _id: id }, {$push: { trackList: newTitle }});
//                 await newTitle.save();
//                 res.redirect(`/${bandName}`);
//             } catch (err) {
//                 req.session.errorMessage = 'There was an error creating the title or updating the tier tracklist.';
//                 res.redirect(`/${bandName}`);
//             }
//             break;
//         case 'version':
//             const { versionName, versionNotes} = req.body;
//             const newVersion = new Version({name: versionName, notes: versionNotes});

//             const parentTitle = await Title.findOne({ _id: id }).populate('versions');
//             let versionList = parentTitle.versions;

//             if (req.body.versionCurrent) {

     
//                 let oldCurrent = versionList.find(v => v.current);
//                 if (oldCurrent) {
//                     await Version.updateOne({_id: oldCurrent._id}, {current: false});
//                 }
//                 newVersion.current = true;
  
//             } else if (!versionList.find(v => v.current)) {
//                 newVersion.current = true;
//             }
//             console.log(newVersion);
//             await newVersion.save();
//             await Title.updateOne({ _id: id }, {$push: { versions: newVersion }});

//             return res.redirect(`/${bandName}`);

//         case 'bounce':
//             // Increase timeout length for long uploads

//             req.socket.setTimeout(10 * 60 * 1000);

//             // Get parameters from post request and exit if there's an existing bounce with that date.

//             const { bounceDate, bounceComments, duration } = req.body;
//             const vers = await Version.findOne({ _id: id });
//             let duplicateDate = vers.bounces.find(b => b.date === bounceDate);
//             if (duplicateDate) {
//                 req.session.errorMessage = 'There is already a bounce with that date.'
//                 res.redirect(`/${bandName}`);
//                 return;
//             }

//             // Create a new bounce object with the parameters we have

//             const newBounce = new Bounce({date: bounceDate, comments: bounceComments, size: req.files.bounceFile.size, duration});



//             // Create upload stream object
//             const stream = addMp3(req.files.bounceFile);

//             stream.on('error', (err) => {
//                 req.session.errorMessage = 'error uploading mp3';
//                 res.redirect(`/${bandName}`);
//             });

//             // Finish up on completed upload
//             stream.on('finish', async () => {

//                 // Get id of mp3 from stream object
//                 newBounce.mp3 = stream.id;

//                 // Add bounce to parent version's bounce list
//                 await Version.updateOne({ _id: id }, {$push: { bounces: newBounce }});

//                 // Update the latest tag in the parent's bounce list
//                 const parentVersion = await Version.findOne({ _id: id }).populate('bounces');
//                 let bounceList = parentVersion.bounces;
//                 if (req.body.bounceLatest) {

//                     let oldLatest = bounceList.find(s => s.latest);
//                     if (oldLatest) {
//                         await Bounce.updateOne({_id: oldLatest._id}, {latest: false});
//                     }
//                     newBounce.latest = true;
                    
//                 } else if (!bounceList.find(s => s.latest)) {
//                     newBounce.latest = true;
//                 }

//                 // Finally save new bounce object
//                 await newBounce.save();

//                 console.log('Uploaded & created bounce record:', newBounce);
//                 // axios request prevents redirect by express
//                 return res.status(201).send({});
//             });
//             break;
//         default:
//             throw new Error('got invalid info for adding an item');
//     }
// });

// export { router as addItemRouter };