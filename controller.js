require('./models/Song');
const mongoose = require('mongoose');
const Tier = mongoose.model('Tier');
const Title = mongoose.model('Title');
const Version = mongoose.model('Version');

// const update = async () => {
//     const allSongs = await Title.find({});
//     // console.log(allSongs);
//     allSongs.forEach(async (song) => {
//         await Tier.findOneAndUpdate({ name: 'a'}, { $push: {'trackList': song} }, {useFindAndModify: false});
//     });
// };
// update();


exports.index = async (req, res) => {

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
        res.render('index', {tiers: tiers});
    } catch (err) {
        res.send(err);
    }


};

exports.addItem = async (req, res) => {


    const {dataID} = req.body;
    // console.log(dataID);
    const [dataType, id] = dataID.split('-')
    

    switch(dataType) {
        case 'tier':
            // console.log('gagaga')
            const { tierName } = req.body;
            const newTier = new Tier({name: tierName});
            await newTier.save((err) => {
                if (err) {
                    res.send(err);
                } else {
                    res.redirect('/');
                }
            });
            break;
        case 'title':
            // console.log(req.body);
            const { titleName } = req.body;
            const newTitle = new Title({title: titleName});
            Tier.updateOne({ _id: id }, {$push: { trackList: newTitle }}, (err) => {
                if (err) {
                    res.send(err);
                } else {
                    // console.log('hi');
                    newTitle.save((err) => {
                        //update track list of tier using id
                        if (err) {
                            res.send(err);
                        } else {
                            res.redirect('/');
                        }
                    });
                }
            });
        
                
            break;
        // case 'version':
        //     const { versionName, versionNotes } = req.body;
        //     const newVersion = new Version({name: versionName, notes: versionNotes});
        //     newVersion.save(async (err, song) => {
        //         //update track list of tier using id
        //         if (err) {
        //             res.send(err);
        //         } else {
        //             await Title.findOneAndUpdate({ _id: id }, { $push: { 'versions': song } }, { useFindAndModify: false }, (err) => {
        //                 if (err) {
        //                     res.send(err);
        //                 } else {
        //                     res.redirect('/');
        //                 }
        //             });
        //         }
        //     });
        //     break;
        default:
            res.send('data type invalid shit fuck');
    }
};

exports.deleteItem = async (req, res) => {
    // console.log(req.params);
    const rowType = req.params.rowtype;
    const id = req.params.id;
    switch (rowType) {
        case 'tier':
            Tier.deleteOne({ _id: id }, (err, tier) => {
                if (err) {
                    res.send(err);
                } else {
                    console.log('deleted ' + tier.name);
                    res.redirect('/');
                }
            });
            break;
        case 'title':
            const title = await Title.find({ _id: id });
            const parentId = req.params.parentid;
            Tier.updateOne({ _id: parentId }, { $pull: {trackList: title} }, async (err, tier) => {
                if (err) {
                    res.send(err);
                } else {
                    Title.deleteOne({ _id: id }, (err) => {               
                        if (err) {
                            res.send(err);                  
                        } else {
                            console.log('Deleted ' + title.name + ' from ' + tier.name );
                            res.redirect('/');
                        }
                    });
                }
            });
            break;
        default:
            console.log('i dunno');
    }
};
