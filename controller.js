require('./models/Song');
const mongoose = require('mongoose');
const Tier = mongoose.model('Tier');
const Title = mongoose.model('Title');
const Version = mongoose.model('Version');
const Song = mongoose.model('Song');
const streamer = require('./streamer');



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
    const [dataType, id] = dataID.split('-')
    

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
            const { versionName, versionNotes } = req.body;
            const newVersion = new Version({name: versionName, versionNotes});
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
            

            if (songLatest) {
                try {
                    const parentVersion = await Version.findOne({ _id: id }).populate('songs');
                    let songList = parentVersion.songs;
                    let oldLatest = songList.find(s => s.latest);
                    if (oldLatest) {
                        await Song.updateOne({_id: oldLatest._id}, {latest: false});
                    }
                    newSong.latest = true;
                } catch {
                    req.session.errorMessage = 'There was an updating the latest tag.';
                    res.redirect('/');
                    break;
                }
            }
            try {
                await Version.updateOne({ _id: id }, {$push: { songs: newSong }});
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

    const cascade = async (type, id) => {
        try {
            if (type === 'tier') {
                let thisTier = await Tier.findOne({_id: id}).populate('trackList');
                thisTier.trackList.forEach(async (title) => {                
                    cascade('title', title.id);
                    await Title.deleteOne({ _id: title.id });
                });
            } else if (type === 'title') {
                let thisTitle = await Title.findOne({_id: id}).populate('versions');
                // console.log(thisTitle);
                thisTitle.versions.forEach(async (version) => {                
                    cascade('version', version.id);
                    await Version.deleteOne({ _id: version.id });
                });
            } else if (type === 'version') {
                let thisVersion = await Version.findOne({_id: id}).populate('songs');
                thisVersion.songs.forEach(async (song) => {                
                    await Song.deleteOne({ _id: song.id});
                });
            }
            console.log('cascaded');
        } catch {
            console.log('somthing happened with the cascade function');
        }
    };


    req.session.errorMessage = '';
    // console.log(req.params);
    const rowType = req.params.rowtype;
    const id = req.params.id;
    switch (rowType) {
        case 'tier':
            try {
                cascade('tier', id);
                await Tier.deleteOne({ _id: id });
                res.redirect('/');
            } catch (err) {
                req.session.errorMessage = 'Could not delete the tier or update the tier trackist.';
                res.redirect('/');
            }
            break;
        case 'title':
            try {
                const title = await Title.find({ _id: id });
                const versions = title.versions;
                const parentId = req.params.parentid;
                cascade('title', id);
                await Tier.updateOne({ _id: parentId }, { $pull: {trackList: title} });
                await Title.deleteOne({ _id: id });
                res.redirect('/');
            } catch (err) {
                req.session.errorMessage = 'Could not delete the title or update the tier trackist.';
                res.redirect('/');
            }
            break;
        default:
            console.log('i dunno');
    }
};

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

exports.playMp3 = async (req,res) => {

    const id = req.params.id.split('.')[0];
    const thisSong = await Song.findOne({ _id: id });
    const stream = streamer.getMp3(thisSong.mp3);

    // console.log(stream);

    res.type('audio/mpeg');

    // stream.on('data', (chunk) => {
    //     res.write(chunk);
    // });
    
    // stream.on('error', () => {
    //     res.sendStatus(404);
    // });
    
    // stream.on('end', () => {
    //     res.end();
    // });

    stream.pipe(res);



};