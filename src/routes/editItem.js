import mongoose from 'mongoose';
const Tier = mongoose.model('Tier');
const Title = mongoose.model('Title');
const Version = mongoose.model('Version');
const Song = mongoose.model('Song');

export const editItem = async (req, res) => {

   
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
            res.redirect('/');

            break;
        case 'title':
            const { titleName, moveTier, parentID } = req.body;
       
            await Title.updateOne({ _id: id }, { title: titleName });
 
            if (moveTier !== parentID) {
           
                await Tier.updateOne({ _id: parentID }, { $pull: { trackList: id } });
                await Tier.updateOne({ _id: moveTier }, { $push: { trackList: id } });
                res.redirect('/');

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

            await Version.updateOne({ _id: id }, { name: versionName, notes: versionNotes, current });
            res.redirect('/');
  
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

            await Song.updateOne({ _id: id }, { date: songDate, comments: songComments });

            
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

                if (oldLatest) {
                    await Song.updateOne({_id: oldLatest.id}, {latest: false});
                }

            } else if (!oldLatest) {
                latest = true;
            }

            // Update the song record with the new info


            await Song.updateOne({ _id: id }, { date: songDate, comments: songComments, latest });
            res.redirect('/');

            break;
    }
}




export const changeSong = async (req, res) => {

    
    const { currentSong, changeSong } = req.body;

    await Song.updateOne({ _id: changeSong }, { latest: true });
    await Song.updateOne({ _id: currentSong }, { latest: false });
    res.redirect('/');


}

export const changeVersion = async (req, res) => {
    

    
    const { currentVersion, changeVersion } = req.body;

    await Version.updateOne({ _id: changeVersion }, { current: true });
    await Version.updateOne({ _id: currentVersion }, { current: false });
    res.redirect('/');

}