import mongoose from 'mongoose';
import express from 'express';
import { currentUser } from '../middlewares/current-user.js';
import { requireAuth } from '../middlewares/require-auth.js';
import { Band } from '../models/band.js';
import { Playlist, PlaylistSong } from '../models/models.js';


const router = express.Router();

router.get('/playlistsongs/:playlistId', async (req, res) => {

    const playlist = await Playlist.findById(req.params.playlistId)
        .populate({
            path: 'songs',
            populate: ['title', 'version', 'bounce'],
            options: { sort: 'position' }
        });

    res.status(200).send(playlist.songs);


});

export { router as playlistSongRouter };