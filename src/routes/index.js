import '../models/models.js';
import mongoose from 'mongoose';
const Tier = mongoose.model('Tier');

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
// 
