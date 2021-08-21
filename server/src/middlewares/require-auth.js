
import { User } from '../models/user.js';

export const requireAuth = async (req, res, next) => {
    if (!req.currentUser) {
        res.status(401);
        throw new Error('You must be signed in to do that');
    }

    const thisUser = await User.findById(req.currentUser.id);
    if (!thisUser) {
        res.status(404);
        throw new Error('User Not Found');
    }

    if (!thisUser.bands.includes(req.body.currentBand)) {
        res.status(401);
        throw new Error('User not authorized for this band');
    }

    next();
};