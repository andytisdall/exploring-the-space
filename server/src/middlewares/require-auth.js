
import { User } from '../models/user.js';

export const requireAuth = async (req, res, next) => {
    if (!req.currentUser) {
        throw new Error('You must be signed in to do that');
    }

    const thisUser = await User.findById(req.currentUser.id);
    if (!thisUser) {
        throw new Error('User Not Found');
    }

    if (!thisUser.bands.includes(req.body.currentBand)) {
        throw new Error('User not authorized for this band');
    }

    next();
};