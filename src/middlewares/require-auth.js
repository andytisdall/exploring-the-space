
import { User } from '../models/user.js';

export const requireAuth = async (req, res, next) => {
    // console.log(req.currentUser);
    if (!req.currentUser) {
        throw new Error('You must be signed in to do that');
    }

    if (req.body.currentBand) {
        const thisUser = await User.findById(req.currentUser.id);
        if (!thisUser.bands.includes(req.body.currentBand)) {
            throw new Error('User not authorized for this band');
        }
    }

    next();
};