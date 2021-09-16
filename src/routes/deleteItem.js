import mongoose from 'mongoose';
import mongodb from 'mongodb';
import { Band } from '../models/band.js';
import { bucket } from './audio.js';
const Tier = mongoose.model('Tier');
const Title = mongoose.model('Title');
const Version = mongoose.model('Version');
const Bounce = mongoose.model('Song');
const Playlist = mongoose.model('Playlist');
const PlaylistSong = mongoose.model('PlaylistSong');

export const deleteTier = async (id, band) => {
    let thisTier = await Tier.findById(id);
    await Band.updateOne({ _id: band }, { $pull: {tiers: id} });

    const changePosition = await Tier.find({ position: { $gt: thisTier.position }});
    changePosition.forEach(async (tier) => {
        tier.position = tier.position - 1;
        await tier.save();
    });
    await Tier.deleteOne({ _id: id });
    return thisTier;
};

export const deletePlaylist = async (id, band) => {
    let thisPlaylist = await Playlist.findById(id);
    await Band.updateOne({ _id: band }, { $pull: { playlists: id } });
    const changePosition = await Playlist.find({ position: { $gt: thisPlaylist.position }});
    changePosition.forEach(async (pl) => {
        pl.position = pl.position - 1;
        await pl.save();
    });
    await Playlist.deleteOne({ _id: id });
    return thisPlaylist;
};

export const deleteTitle = async (id, parentId) => {
    const thisTitle = await Title.findById(id);

    const parentTier = await Tier.findById(parentId);
    if (parentTier) {
        await Tier.updateOne({ _id: parentId }, { $pull: { trackList: id } });
    }

    await Title.deleteOne({ _id: id });
    return thisTitle
};


export const deleteVersion = async (id, parentId) => {
    let thisVersion = await Version.findById(id);
    const parentTitle = await Title.findById(parentId);
    if (parentTitle) {
        await Title.updateOne({ _id: parentId }, { $pull: { versions: id } });
    }

    const playlistSongs = await PlaylistSong.find({ version: id });

    playlistSongs.forEach(async pls => {
        pls.version = null;
        await pls.save();
    });

    await Version.deleteOne({ _id: id });
    return thisVersion; 
};

export const deleteBounce = async (id, parentId) => {
    const thisBounce = await Bounce.findById(id);
    const mp3Id = new mongodb.ObjectID(thisBounce.mp3);
    const parentVersion = await Version.findById(parentId);
    if (parentVersion) {
        await Version.updateOne({ _id: parentId }, { $pull: { songs: id } });
    }
    const playlistSongs = await PlaylistSong.find({ bounce: id });

    playlistSongs.forEach(async pls => {
        pls.bounce = null;
        await pls.save();
    });

    deleteMp3(mp3Id);
    await Bounce.deleteOne({ _id: id });
    return thisBounce;
};


const deleteMp3 = (mp3Id) => {
    
    bucket.delete(mp3Id, (err) => {
        if (err) {
            return err;
        } else {
            console.log('mp3 deleted');
            return;
        }
    });


}