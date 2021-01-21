require('./models/Song');
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
        const tiers = await Tier.find({}).populate({
            path: 'trackList', populate: {
                path: 'versions', populate: {
                    path: 'songs'
                }
            }
        });
        // console.log(tiers);
        // console.log('index');
        res.render('index', {tiers, errorMessage});
    } catch (err) {
        res.send(err);
    }


};

exports.addItem = async (req, res) => {

    req.session.errorMessage = '';

    const {dataID} = req.body;
    // console.log(dataID);
    const [dataType, id] = dataID.split('-');
    

    switch(dataType) {
        case 'tier':
            // console.log('gagaga')
            const { tierName } = req.body;
            const newTier = new Tier({name: tierName});
            try {
                await newTier.save();
                res.redirect('/');
            } catch (err) {
                req.session.errorMessage = 'Could not create that tier.';
                res.redirect('/');
            }
            break;
        case 'title':
            // console.log(req.body);
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
            // console.log(req.body);
            const { versionName, versionNotes, versionCurrent } = req.body;
            const newVersion = new Version({name: versionName, versionNotes});

            const parentTitle = await Title.findOne({ _id: id }).populate('versions');
            let versionList = parentTitle.versions;

            if (versionCurrent) {
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
                req.session.errorMessage = 'There was an error creating the version or updating the version list.';
                res.redirect('/');
            }
            break;
        case 'song':
            // console.log(req.body);
            const { songDate, songComments, songLatest } = req.body;
            const newSong = new Song({date: songDate, comments: songComments});

            newSong.mp3 = await streamer.addMp3(req.files.songFile);

            const parentVersion = await Version.findOne({ _id: id }).populate('songs');
            let songList = parentVersion.songs;

            if (songLatest) {
                try {
                    let oldLatest = songList.find(s => s.latest);
                    if (oldLatest) {
                        await Song.updateOne({_id: oldLatest._id}, {latest: false});
                    }
                    newSong.latest = true;
                } catch {
                    req.session.errorMessage = 'There was an error updating the latest tag.';
                    res.redirect('/');
                    break;
                }
            } else if (!songList.find(s => s.latest)) {
                newSong.latest = true;
            }
            try {
                await Version.updateOne({ _id: id }, {$push: { songs: newSong }});
                console.log('Creating song record:', newSong);
                await newSong.save();
                res.redirect('/');
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
                    await Title.deleteOne({ _id: title.id });

                });
                await Tier.deleteOne({ _id: id });
            } else if (type === 'title') {
                let thisTitle = await Title.findOne({_id: id}).populate('versions');
                // console.log(thisTitle);
                thisTitle.versions.forEach(async (version) => {                
                    cascade('version', version.id);
                    await Version.deleteOne({ _id: version.id });
                });
                await Tier.updateOne({ _id: parentId }, { $pull: {trackList: id} });
                await Title.deleteOne({ _id: id });
            } else if (type === 'version') {
                let thisVersion = await Version.findOne({_id: id}).populate('songs');
                thisVersion.songs.forEach(async (song) => {          
                    await Song.deleteOne({ _id: song.id});
                });
                await Title.updateOne({ _id: parentId }, { $pull: {versions: id} });
                await Version.deleteOne({ _id: id });   
            } else if (type === 'song') {
                const song = await Song.findOne({ _id: id });
                const mp3Id = new ObjectID(song.mp3);
                await Version.updateOne({ _id: parentId }, { $pull: {songs: id} });
                await Song.deleteOne({ _id: id });
                streamer.deleteMp3(mp3Id);
            }
            console.log('cascaded');
        } catch {
            console.log('somthing happened with the cascade function');
        }
        console.log('deleted record, children and references');
    };


    req.session.errorMessage = '';
    const rowType = req.params.rowtype;
    const id = req.params.id;
    let parentId;
    if (req.params.parentId) {
        parentId = req.params.parentid;
    }
    switch (rowType) {
        case 'tier':
            try {
                cascade('tier', id);
                res.redirect('/');
            } catch (err) {
                req.session.errorMessage = 'Could not delete the tier or update the tier trackist.';
                res.redirect('/');
            }
            break;
        case 'title':
            try {
                // const title = await Title.find({ _id: id });
                cascade('title', id, parentId);
                res.redirect('/');
            } catch (err) {
                req.session.errorMessage = 'Could not delete the title or update the tier trackist.';
                res.redirect('/');
            }
            break;
        case 'version':
            try {
                // const version = await Version.findOne({ _id: id });
                cascade('version', id, parentId);
                res.redirect('/');
            } catch (err) {
                req.session.errorMessage = 'Could not delete the version or update the title version list.';
                res.redirect('/');
            }
            break;
        case 'song':
            try {
                cascade('song', id, parentId);
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
            const { tierName } = req.body;
            try {
                await Tier.updateOne({ _id: id }, { name: tierName });
                res.redirect('/');
            } catch (err) {
                req.session.errorMessage = err.message;
                res.redirect('/');
            }
            break;
        case 'title':
            const { titleName } = req.body;
            try {
                await Title.updateOne({ _id: id }, { name: titleName });
                res.redirect('/');
            } catch (err) {
                req.session.errorMessage = err.message;
                res.redirect('/');
            }
            break;
        case 'version':
            const { versionName, versionNotes, versionCurrent } = req.body;
            try {
                await Version.updateOne({ _id: id }, { name: versionName, notes: versionNotes, current: versionCurrent });
                res.redirect('/');
            } catch (err) {
                req.session.errorMessage = err.message;
                res.redirect('/');
            }
            break;
        case 'song':
            const { songDate, songComments, songLatest } = req.body;
            try {
                await Song.updateOne({ _id: id }, { date: songDate, comments: songComments, latest:songLatest });
                res.redirect('/');
            } catch (err) {
                req.session.errorMessage = err.message;
                res.redirect('/');
            }

            if (req.files.songFile) {
                let mp3 = await streamer.addMp3(req.files.songFile);
                await Song.updateOne({ _id: id}, )
            }

            const parentVersion = await Version.findOne({ _id: id }).populate('songs');
            let songList = parentVersion.songs;

            if (songLatest) {
                try {
                    let oldLatest = songList.find(s => s.latest);
                    if (oldLatest) {
                        await Song.updateOne({_id: oldLatest._id}, {latest: false});
                    }
                    newSong.latest = true;
                } catch {
                    req.session.errorMessage = 'There was an error updating the latest tag.';
                    res.redirect('/');
                    break;
                }
            } else if (!songList.find(s => s.latest)) {
                newSong.latest = true;
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
        res.type('audio/mpeg');
        stream.pipe(res);
    } catch {
        res.set({status: 404});
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