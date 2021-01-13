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
            const { songDate, songComments, songLocation } = req.body;
            const newSong = new Song({});
            try {
                await Title.updateOne({ _id: id }, {$push: { versions: newVersion }});
                await newVersion.save();
                res.redirect('/');
            } catch (err) {
                req.session.errorMessage = 'There was an error creating the version or updating the version list.';
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
