import mongoose from 'mongoose';
const Tier = mongoose.model('Tier');
const Title = mongoose.model('Title');
const Version = mongoose.model('Version');
const Song = mongoose.model('Song');

export async function editItem(req, res) {

    req.session.errorMessage = '';
    const {dataID} = req.body;
    const [dataType, id] = dataID.split('-');

    switch (dataType) {

        case 'tier':
            const { tierName, tierPosition } = req.body;
            try {
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




export async function changeLatest(req, res) {

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

}

export async function changeVersion(req, res) {

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

}