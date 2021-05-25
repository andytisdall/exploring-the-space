import '../models/user.js';
import '../models/band.js';
import express from 'express';
import { Band } from '../models/band.js';
import { Playlist } from '../models/models.js';

const router = express.Router();

router.get('/:bandName/playlist/:playlistId', async (req, res) => {

    const errorMessage = req.session.errorMessage;
    req.session.errorMessage = '';

    let { bandName, playlistId } = req.params;


    if (bandName === 'apprehenchmen') {
        bandName = 'Apprehenchmen';
    }

    const band = await Band.findOne({ name: bandName });

    const playlist = await Playlist.findById(playlistId).populate({
        path: 'songs', populate: [
            { path: 'title', populate: { path: 'versions', populate: 'songs' } },
            'version',
            'bounce'
        ], options: { sort: 'position' }
    });
    

    if (!band) {
        throw new Error('Band does not exist')
    }

    if (!playlist) {
        throw new Error('Playlist does not exist')
    }


    res.render('playlist', {band, playlist, errorMessage});


});

export { router as playlistDetailRouter };
