import mongoose from 'mongoose';
import mongodb from 'mongodb';
import { deleteMp3 } from './streamer.js';
import { Band } from '../models/band.js';
const Tier = mongoose.model('Tier');
const Title = mongoose.model('Title');
const Version = mongoose.model('Version');
const Bounce = mongoose.model('Bounce');


export const deleteItem = async (req, res) => {

    const deleteTier = async (id, band) => {
        let thisTier = await Tier.findOne({_id: id}).populate('trackList');

        await Band.updateOne({ name: band }, { $pull: {tiers: id} });

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
        let thisVersion = await Version.findOne({ _id: id }).populate('bounces');
        thisVersion.bounces.forEach(async (bounce) => {          
            deleteBounce(bounce.id);
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

    req.session.errorMessage = '';

    const bandName = req.params.bandName;
    
    const rowType = req.body.rowtype;
    const id = req.body.id;
    let parentId;
    if (req.body.parentid) {
        parentId = req.body.parentid;
    }
    switch (rowType) {
        case 'tier':
            await deleteTier(id, bandName);
            res.redirect(`/${bandName}`);
            break;
        case 'title':
            await deleteTitle(id, parentId);
            res.redirect(`/${bandName}`);
            break;
        case 'version':
            await deleteVersion(id, parentId);
            res.redirect(`/${bandName}`);
            break;
        case 'bounce':
            await deleteBounce(id, parentId);
            res.redirect(`/${bandName}`);
            break;
        default:
            console.log('incorrect data type for deletion');
    }
}
