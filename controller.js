require('./models/Song');
const mongoose = require('mongoose');
const Tier = mongoose.model('Tier');
const Title = mongoose.model('Title');
const Version = mongoose.model('Version');
const Song = mongoose.model('Song');

// const update = async () => {
//     const allSongs = await Title.find({});
//     // console.log(allSongs);
//     allSongs.forEach(async (song) => {
//         await Tier.findOneAndUpdate({ name: 'a'}, { $push: {'trackList': song} }, {useFindAndModify: false});
//     });
// };
// update();


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
            const { songDate, songComments, songFile, songLatest } = req.body;
            const newSong = new Song({date: songDate, comments: songComments, file: songFile});
            if (songLatest) {
                try {
                    const parentVersion = await Version.find({ _id: id }).populate('songs');
                    let songList = parentVersion[0].songs;
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
                req.session.errorMessage = 'There was an error creating the bounce.';
                res.redirect('/');
            }
            break;
        default:
            res.send('data type invalid shit fuck');
    }
};

exports.deleteItem = async (req, res) => {
    req.session.errorMessage = '';
    // console.log(req.params);
    const rowType = req.params.rowtype;
    const id = req.params.id;
    switch (rowType) {
        case 'tier':
            try {
                await Tier.deleteOne({ _id: id });
                res.redirect('/');
            } catch (err) {
                req.session.errorMessage = 'Could not delete the tier or update the tier trackist.';
                res.redirect('/');
            }
            break;
        case 'title':
            try {
                await Title.deleteOne({ _id: id });
                const title = await Title.find({ _id: id });
                const parentId = req.params.parentid;
                await Tier.updateOne({ _id: parentId }, { $pull: {trackList: title} });
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
    try {
        await Song.updateOne({ _id: newLatest }, { latest: true });
        await Song.updateOne({ _id: currentLatest }, { latest: false });
        res.redirect('/');
    } catch {
        req.session.errorMessage = 'could not change latest status';
        res.redirect('/');
    }

};
