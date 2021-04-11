import '../models/models.js';
import '../models/user.js';
import '../models/band.js';
import express from 'express';
import { currentUser } from '../middlewares/current-user.js';
import {requireAuth} from '../middlewares/require-auth.js';
import { Band } from '../models/band.js'

const router = express.Router();

router.get('/', (req, res) => {
    res.redirect('/user');
});

router.get('/:bandName', currentUser, requireAuth, async (req, res) => {

    const errorMessage = req.session.errorMessage;

    const band = await Band.findOne({ name: req.params.bandName }).populate({      
        path: 'tiers', populate: {     
            path: 'trackList', populate: {
                path: 'versions', populate: {
                    path: 'songs'
                }
            }
        }   
    });

    res.render('index', {band, errorMessage});
});

export { router as indexRouter };
