import '../models/models.js';
import mongoose from 'mongoose';
import { getMp3 } from './streamer.js';
import mongodb from 'mongodb';
const Tier = mongoose.model('Tier');
const Song = mongoose.model('Song');

export async function index(req, res) {
    const errorMessage = req.session.errorMessage;
    try {
        const tiers = await Tier.find({}).sort({ position: 'ascending' }).populate({
            path: 'trackList', populate: {
                path: 'versions', populate: {
                    path: 'songs'
                }
            }
        });
        res.render('index', {tiers, errorMessage});
    } catch (err) {
        res.send(err);
    }
}

export async function playMp3(req,res) {

    const id = req.params.id.split('.')[0];
    const thisSong = await Song.findOne({ _id: id });
    let mp3Id = new mongodb.ObjectID(thisSong.mp3);

    try {
        const stream = getMp3(mp3Id);
        if (stream) {
            res.type('audio/mpeg');
            res.set({
                'Accept-Ranges': 'bytes',
                'Content-Length': thisSong.length
            });
            stream.pipe(res);
        } else {
            req.session.errorMessage = 'Could not find mp3 for song with id ' + thisSong.id;
            res.set({status:404});
        }
    } catch (err) {
        req.session.errorMessage = err.message;
        res.redirect('/');
    }
}