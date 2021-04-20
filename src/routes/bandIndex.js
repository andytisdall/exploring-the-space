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

    let bandName = req.params.bandName

    if (bandName === 'apprehenchmen') {
        bandName = 'Apprehenchmen';
    }

    const band = await Band.findOne({ name: bandName }).populate({      
        path: 'tiers', populate: {     
            path: 'trackList', populate: {
                path: 'versions', populate: {
                    path: 'songs'
                }
            }
        }   
    });

    const playlists = await Band.findOne({ name: bandName }).populate({
        path: 'playlists', populate: {
            path: 'songs'
        }
    });


    if (!band) {
        return res.redirect('/signin');
    }

    if (req.currentUser) {

        const thisUser = await User.findById(req.currentUser.id);

        if (thisUser.bands.includes(band.id)) {
            res.render('index', {band, playlists, errorMessage});
        } else {
            res.render('guestIndex', { band, playlists, errorMessage });
        }

    } else {
        res.render('guestIndex', { band, playlists, errorMessage });
    }


});

export { router as bandIndexRouter };
