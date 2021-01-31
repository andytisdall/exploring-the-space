require('./models/models');
const mongoose = require('mongoose');
const Tier = mongoose.model('Tier');
const Title = mongoose.model('Title');
const Version = mongoose.model('Version');
const Song = mongoose.model('Song');
const streamer = require('./streamer');
const ObjectID = require('mongodb').ObjectID;



exports.index = async (req, res) => {
    const errorMessage = req.session.errorMessage;
    try {
        const tiers = await Tier.find({}).sort({ position: 'ascending' }).populate({
            path: 'trackList', populate: {
                path: 'versions', populate: {
                    path: 'songs'
                }
            }
        });
        res.render('index', {tiers, errorMessage});
    } catch (err) {
        res.send(err);
    }


};

exports.addItem = async (req, res) => {

    req.session.errorMessage = '';

    const {dataID} = req.body;
    const [dataType, id] = dataID.split('-');

    switch(dataType) {
        case 'tier':
            const { tierName } = req.body;
            const newTier = new Tier({name: tierName});
            try {
                const allTiers = await Tier.find({}).sort({ position: 'descending' });
                if (allTiers[0]) {
                    newTier.position = allTiers[0].position + 1;
                } else {
                    newTier.position = 1;
                }
                await newTier.save();
                res.redirect('/');
            } catch (err) {
                req.session.errorMessage = 'Could not create that tier.';
                res.redirect('/');
            }
            break;
        case 'title':
            const { titleName } = req.body;
            const newTitle = new Title({title: titleName});
            try {
                await Tier.updateOne({ _id: id }, {$push: { trackList: newTitle }});
                await newTitle.save();
                res.redirect('/');
            } catch (err) {
                req.session.errorMessage = 'There was an error creating the title or updating the tier tracklist.';
                res.redirect('/');
            }
            break;
        case 'version':
            const { versionName, versionNotes} = req.body;
            const newVersion = new Version({name: versionName, notes: versionNotes});

            const parentTitle = await Title.findOne({ _id: id }).populate('versions');
            let versionList = parentTitle.versions;

            if (req.body.versionCurrent) {
                try {
                    let oldCurrent = versionList.find(v => v.current);
                    if (oldCurrent) {
                        await Version.updateOne({_id: oldCurrent._id}, {current: false});
                    }
                    newVersion.current = true;
                } catch {
                    req.session.errorMessage = 'There was an error updating the current tag.';
                    res.redirect('/');
                    break;
                }
            } else if (!versionList.find(v => v.current)) {
                newVersion.current = true;
            }

            try {
                await Title.updateOne({ _id: id }, {$push: { versions: newVersion }});
                await newVersion.save();
                res.redirect('/');
            } catch (err) {
                req.session.errorMessage = err.message;
                res.redirect('/');
            }
            break;
        case 'song':
            // Increase timeout length for long uploads

            req.socket.setTimeout(10 * 60 * 1000);

            // Get parameters from post request and exit if there's an existing bounce with that date.

            const { songDate, songComments } = req.body;
            const vers = await Version.findOne({ _id: id });
            let duplicateDate = vers.songs.find(s => s.date === songDate);
            if (duplicateDate) {
                req.session.errorMessage = 'There is already a bounce with that date.'
                res.redirect('/');
                return;
            }

            // Create a new song object with the parameters we have

            const newSong = new Song({date: songDate, comments: songComments, length: req.files.songFile.size});

            try {

                // Create upload stream object
                const stream = streamer.addMp3(req.files.songFile);

                stream.on('error', (err) => {
                    req.session.errorMessage = 'error uploading mp3';
                    res.redirect('/');
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
                        try {
                            let oldLatest = songList.find(s => s.latest);
                            if (oldLatest) {
                                await Song.updateOne({_id: oldLatest._id}, {latest: false});
                            }
                            newSong.latest = true;
                        } catch {
                            req.session.errorMessage = 'There was an error updating the latest tag.';
                            res.redirect('/');
                            return;
                        }
                    } else if (!songList.find(s => s.latest)) {
                        newSong.latest = true;
                    }
  
                    // Finally save new song object
                    await newSong.save();

                    console.log('Uploaded & created song record:', newSong);
                    res.redirect('/');
                });
            } catch (err) {
                req.session.errorMessage = err.message;
                res.redirect('/');
            }
            break;
        default:
            res.send('data type invalid shit fuck');
    }
};

exports.deleteItem = async (req, res) => {

    const cascade = async (type, id, parentId=null) => {
        try {
            if (type === 'tier') {
                let thisTier = await Tier.findOne({_id: id}).populate('trackList');
                thisTier.trackList.forEach(async (title) => {                
                    cascade('title', title.id);
                });
                const changePosition = await Tier.find({ position: { $gt: thisTier.position }});
                changePosition.forEach(async (tier) => {
                    await Tier.updateOne({ _id: tier.id }, { position: tier.position-1 });
                });
                await Tier.deleteOne({ _id: id });
            } else if (type === 'title') {
                let thisTitle = await Title.findOne({_id: id}).populate('versions');
                thisTitle.versions.forEach(async (version) => {                
                    cascade('version', version.id);
                });
                if (parentId) {
                    await Tier.updateOne({ _id: parentId }, { $pull: {trackList: id} });
                }
                await Title.deleteOne({ _id: id });
            } else if (type === 'version') {
                let thisVersion = await Version.findOne({ _id: id }).populate('songs');
                thisVersion.songs.forEach(async (song) => {          
                    cascade('song', song.id);
                });
                if (parentId) {
                    await Title.updateOne({ _id: parentId }, { $pull: {versions: id} });
                    if (thisVersion.current) {
                        let parentTitle = await Title.findOne({ _id: parentId }).populate('versions');
                        let versionList = parentTitle.versions;
                        if (versionList.length > 1) {
                            await Version.updateOne({ _id: versionList[versionList.length-1] }, { current: true });
                        }
                    }
                }
                await Version.deleteOne({ _id: id });   
            } else if (type === 'song') {
                const song = await Song.findOne({ _id: id });
                const mp3Id = new ObjectID(song.mp3);
                if (parentId) {
                    await Version.updateOne({ _id: parentId }, { $pull: {songs: id} });
                    if (song.latest) {
                        let parentVersion = await Version.findOne({ _id: parentId }).populate('songs');
                        let songList = parentVersion.songs;
                        if (songList.length >= 1) {
                            await Song.updateOne({ _id: songList[songList.length-1] }, { latest: true });
                        }
                    }
                }
                streamer.deleteMp3(mp3Id);
                await Song.deleteOne({ _id: id });
            }
            console.log('cascaded');
        } catch (err) {
            console.log('somthing happened with the cascade function');
            console.log(err.message);
            return;
        }
        console.log('deleted record, children and references');
        return;
    };


    req.session.errorMessage = '';
    const rowType = req.params.rowtype;
    const id = req.params.id;
    let parentId;
    if (req.params.parentid) {
        parentId = req.params.parentid;
    }
    switch (rowType) {
        case 'tier':
            try {
                await cascade('tier', id);
                res.redirect('/');
            } catch (err) {
                req.session.errorMessage = 'Could not delete the tier or update the tier trackist.';
                res.redirect('/');
            }
            break;
        case 'title':
            try {
                // const title = await Title.find({ _id: id });
                await cascade('title', id, parentId);
                res.redirect('/');
            } catch (err) {
                req.session.errorMessage = 'Could not delete the title or update the tier trackist.';
                res.redirect('/');
            }
            break;
        case 'version':
            try {
                // const version = await Version.findOne({ _id: id });
                await cascade('version', id, parentId);
                res.redirect('/');
            } catch (err) {
                req.session.errorMessage = 'Could not delete the version or update the title version list.';
                res.redirect('/');
            }
            break;
        case 'song':
            try {
                await cascade('song', id, parentId);
                res.redirect('/');
            } catch (err) {
                req.session.errorMessage = err.message;
                res.redirect('/');
            }
            break;
        default:
            console.log('incorrect data type for deletion');
    }
};

exports.editItem = async (req, res) => {

    req.session.errorMessage = '';
    const {dataID} = req.body;
    const [dataType, id] = dataID.split('-');

    switch (dataType) {

        case 'tier':
            const { tierName, tierPosition } = req.body;
            try {
                const thisTier = await Tier.findOne({ _id: id });
                if (thisTier.position > tierPosition) {
                    const changePosition = await Tier.find({ position: { $gt: tierPosition-1, $lt: thisTier.position} });
                    console.log(changePosition);
                    changePosition.forEach(async (tier) => {
                        await Tier.updateOne({ _id: tier.id }, { position: tier.position+1 });
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
            } catch (err) {
                req.session.errorMessage = err.message;
                res.redirect('/');
                return;
            }
            try {
                await Tier.updateOne({ _id: id }, { name: tierName });
                res.redirect('/');
            } catch (err) {
                req.session.errorMessage = err.message;
                res.redirect('/');
            }
            break;
        case 'title':
            const { titleName, moveTier, parentID } = req.body;
            try {
                await Title.updateOne({ _id: id }, { title: titleName });
            } catch (err) {
                req.session.errorMessage = err.message;
                res.redirect('/');
            }
            if (moveTier !== parentID) {
                try {
                    await Tier.updateOne({ _id: parentID }, { $pull: { trackList: id } });
                    await Tier.updateOne({ _id: moveTier }, { $push: { trackList: id } });
                    res.redirect('/');
                } catch (err) {
                    req.session.errorMessage = err.message;
                    res.redirect('/');
                }
            } else {
                res.redirect('/');
            }
            break;
        case 'version':
            const { versionName, versionNotes } = req.body;
            let current = false;
            if (req.body.versionCurrent) {
                current = true;
            }
            // console.log(req.body);
            try {
                await Version.updateOne({ _id: id }, { name: versionName, notes: versionNotes, current });
                res.redirect('/');
            } catch (err) {
                req.session.errorMessage = err.message;
                res.redirect('/');
            }
            break;
        case 'song':
            //Get paramaters
            const { songDate, songComments, versionID } = req.body;
            //Exit if this date exists in the version's song list
            const vers = await Version.findOne({ _id: versionID });
            let duplicateDate = vers.songs.find(s => s.date === songDate);
            if (duplicateDate) {
                req.session.errorMessage = 'There is already a bounce with that date.'
                res.redirect('/');
                return;
            }
            //Update song with new data
            try {
                await Song.updateOne({ _id: id }, { date: songDate, comments: songComments });
            } catch {
                req.session.errorMessage = 'Not able to update song record.'
                res.redirect('/');
                return;
            }
            // Update mp3 if there's a new one
            if (req.files) {
                req.socket.setTimeout(10 * 60 * 1000);
                const stream = streamer.addMp3(req.files.songFile);
                stream.on('error', (err) => {
                    req.session.errorMessage = 'error uploading mp3';
                    res.redirect('/');
                    return;
                });
                stream.on('finish', async () => {

                    //update mp3 id for bounce
                    let mp3 = stream.id;
                    let oldMp3 = await Song.findOne({ _id: id }).mp3;
                    await Song.updateOne({ _id: id }, { mp3, length: req.files.songFile.size });
                    console.log('Uploaded new mp3');
                    // Delete old mp3
                    let mp3Id = new ObjectID(oldMp3);
                    streamer.deleteMp3(mp3Id);
                });
            }

            //update latest tag for parent version
            let latest = false;
            if (req.body.songLatest) {
                latest = true;
            }
            const parentVersion = await Version.findOne({ _id: versionID }).populate('songs');
            let oldLatest = parentVersion.songs.find(s => s.latest);
            if (latest) {
                try {
                    if (oldLatest) {
                        await Song.updateOne({_id: oldLatest.id}, {latest: false});
                    }
                } catch {
                    req.session.errorMessage = 'There was an error updating the latest tag.';
                    res.redirect('/');
                    return;
                }
            } else if (!oldLatest) {
                latest = true;
            }

            // Update the song record with the new info

            try {
                await Song.updateOne({ _id: id }, { date: songDate, comments: songComments, latest });
                res.redirect('/');
            } catch (err) {
                req.session.errorMessage = err.message;
                res.redirect('/');
            }
            break;
    }
}

exports.changeLatest = async (req, res) => {

    req.session.errorMessage = '';
    const { newLatest, currentLatest } = req.body;
    if (newLatest === currentLatest) {
        res.redirect('/');
        return;
    }
    try {
        await Song.updateOne({ _id: newLatest }, { latest: true });
        await Song.updateOne({ _id: currentLatest }, { latest: false });
        res.redirect('/');
    } catch {
        req.session.errorMessage = 'could not change latest status';
        res.redirect('/');
    }

};

exports.changeVersion = async (req, res) => {

    req.session.errorMessage = '';
    const { currentVersion, changeVersion } = req.body;
    if (currentVersion === changeVersion) {
        res.redirect('/');
        return;
    }
    try {
        await Version.updateOne({ _id: changeVersion }, { current: true });
        await Version.updateOne({ _id: currentVersion }, { current: false });
        res.redirect('/');
    } catch {
        req.session.errorMessage = 'could not change latest status';
        res.redirect('/');
    }

};

exports.playMp3 = async (req,res) => {

    const id = req.params.id.split('.')[0];
    const thisSong = await Song.findOne({ _id: id });
    let mp3Id = new ObjectID(thisSong.mp3);

    try {
        const stream = streamer.getMp3(mp3Id);
        if (stream) {
            res.type('audio/mpeg');
            res.set({
                'Accept-Ranges': 'bytes',
                'Content-Length': thisSong.length
            });
            stream.pipe(res);
        } else {
            req.session.errorMessage = 'Could not find mp3 for song with id ' + thisSong.id;
            res.set({status:404});
        }
    } catch (err) {
        req.session.errorMessage = err.message;
        res.redirect('/');
    }
    // stream.on('data', (chunk) => {
    //     res.write(chunk);
    // });
    
    // stream.on('error', () => {
    //     res.sendStatus(404);
    // });
    
    // stream.on('end', () => {
    //     res.end();
    // });
};