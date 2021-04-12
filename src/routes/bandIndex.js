import '../models/models.js';
import '../models/user.js';
import '../models/band.js';
import express from 'express';
import { currentUser } from '../middlewares/current-user.js';
import { Band } from '../models/band.js';
import { User } from '../models/user.js';

const router = express.Router();

router.get('/:bandName', currentUser, async (req, res) => {

    const errorMessage = req.session.errorMessage;
    req.session.errorMessage = '';

    const band = await Band.findOne({ name: req.params.bandName }).populate({      
        path: 'tiers', populate: {     
            path: 'trackList', populate: {
                path: 'versions', populate: {
                    path: 'songs'
                }
            }
        }   
    });

    if (!band) {
        return res.redirect('/signin');
    }

    if (req.currentUser) {

        const thisUser = await User.findById(req.currentUser.id);

        if (thisUser.bands.includes(band.id)) {
            res.render('index', {band, errorMessage});
        } else {
            res.render('guestIndex', { band, errorMessage });
        }

    } else {
        res.render('guestIndex', { band, errorMessage });
    }


});

export { router as bandIndexRouter };
