import mongoose from 'mongoose';
import mongodb from 'mongodb';
import { Band } from '../models/band.js';
import { bucket } from './audio.js';
const Tier = mongoose.model('Tier');
const Title = mongoose.model('Title');
const Version = mongoose.model('Version');
const Bounce = mongoose.model('Song');

export const deleteTier = async (id, band) => {
    let thisTier = await Tier.findById(id);
    await Band.updateOne({ _id: band }, { $pull: {tiers: id} });
    thisTier.trackList.forEach((title) => {                
        deleteTitle(title);
    });
    const changePosition = await Tier.find({ position: { $gt: thisTier.position }});
    changePosition.forEach(async (tier) => {
        tier.position = tier.position - 1;
        await tier.save();
    });
    await Tier.deleteOne({ _id: id });
    return thisTier;
};

const deleteTitle = async (id, parentId=null) => {
    let thisTitle = await Title.findOne({_id: id});
    thisTitle.versions.forEach(async (version) => {                
        deleteVersion(version);
    });
    if (parentId) {
        await Tier.updateOne({ _id: parentId }, { $pull: {trackList: id} });
    }
    await Title.deleteOne({ _id: id });
};


const deleteVersion = async (id, parentId=null) => {
    let thisVersion = await Version.findOne({ _id: id });
    thisVersion.bounces.forEach(async (bounce) => {          
        deleteBounce(bounce);
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

const deleteBounce = async (id, parentId=null) => {
    const bounce = await Bounce.findOne({ _id: id });
    const mp3Id = new mongodb.ObjectID(bounce.mp3);
    if (parentId) {
        await Version.updateOne({ _id: parentId }, { $pull: {bounces: id} });
        if (bounce.latest) {
            let parentVersion = await Version.findOne({ _id: parentId }).populate('bounces');
            let bounceList = parentVersion.bounces;
            if (bounceList.length >= 1) {
                await Bounce.updateOne({ _id: bounceList[bounceList.length-1] }, { latest: true });
            }
        }
    }
    deleteMp3(mp3Id);
    await Bounce.deleteOne({ _id: id });
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