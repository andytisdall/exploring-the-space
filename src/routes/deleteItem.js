import mongoose from 'mongoose';
import mongodb from 'mongodb';
import { deleteMp3 } from './streamer.js';
const Tier = mongoose.model('Tier');
const Title = mongoose.model('Title');
const Version = mongoose.model('Version');
const Song = mongoose.model('Song');


export const deleteItem = async (req, res) => {

    const deleteTier = async (id) => {
        let thisTier = await Tier.findOne({_id: id}).populate('trackList');
        thisTier.trackList.forEach(async (title) => {                
            deleteTitle(title.id);
        });
        const changePosition = await Tier.find({ position: { $gt: thisTier.position }});
        changePosition.forEach(async (tier) => {
            await Tier.updateOne({ _id: tier.id }, { position: tier.position-1 });
        });
        await Tier.deleteOne({ _id: id });
    };

    const deleteTitle = async (id, parentId=null) => {
        let thisTitle = await Title.findOne({_id: id}).populate('versions');
        thisTitle.versions.forEach(async (version) => {                
            deleteVersion(version.id);
        });
        if (parentId) {
            await Tier.updateOne({ _id: parentId }, { $pull: {trackList: id} });
        }
        await Title.deleteOne({ _id: id });
    };


    const deleteVersion = async (id, parentId=null) => {
        let thisVersion = await Version.findOne({ _id: id }).populate('songs');
        thisVersion.songs.forEach(async (song) => {          
            deleteSong(song.id);
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
    };

    const deleteSong = async (id, parentId=null) => {
        const song = await Song.findOne({ _id: id });
        const mp3Id = new mongodb.ObjectID(song.mp3);
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
        deleteMp3(mp3Id);
        await Song.deleteOne({ _id: id });
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
            deleteTier(id);
            res.redirect('/');
            break;
        case 'title':
            deleteTitle(id, parentId);
            res.redirect('/');
            break;
        case 'version':
            deleteVersion(id, parentId);
            res.redirect('/');
            break;
        case 'song':
            deleteSong(id, parentId);
            res.redirect('/');
            break;
        default:
            console.log('incorrect data type for deletion');
    }
}
