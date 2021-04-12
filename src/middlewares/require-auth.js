import { Band } from '../models/band.js';
import { User } from '../models/user.js';

export const requireAuth = async (req, res, next) => {
    // console.log(req.currentUser);
    if (!req.currentUser) {
        throw new Error('You must be signed in to do that');
    }

    if (req.params.bandName) {
        const thisUser = await User.findById(req.currentUser.id);
        const band = await Band.findOne({ name: req.params.bandName });
        if (!band) {
            throw new Error('band not found');
        }
        if (!thisUser.bands.includes(band.id)) {
            console.log('yes')
            throw new Error('User not authorized for this band');
        }
    }

    next();
};