import mongoose from 'mongoose';
import mongodb from 'mongodb';
import { deleteMp3 } from './streamer.js';
const Tier = mongoose.model('Tier');
const Title = mongoose.model('Title');
const Version = mongoose.model('Version');
const Song = mongoose.model('Song');


export default async function deleteItem(req, res) {

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
}
