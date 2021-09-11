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


router.post('/playlistsongs', currentUser, requireAuth, async (req, res) => {

    const { currentBand, playlistId, bounce, version, title } = req.body;
    const playlist = await Playlist.findById(playlistId);
    const newPlaylistSong = new PlaylistSong({
        title,
        version,
        bounce,
        position: playlist.songs.length + 1
    });
    await newPlaylistSong.save();
    playlist.songs.push(newPlaylistSong);
    await playlist.save();
    res.status(201).send(newPlaylistSong);
});


router.post('/:bandName/change-position', currentUser, requireAuth, async (req, res) => {
  
    const bandName = req.params.bandName;
    const { songId, newPosition, playlistId, newBounce } = req.body;
    const song = await PlaylistSong.findById(songId);
    if (!song) {
        throw new Error('Playlist song not found');
    }
    if (newPosition && newPosition !== song.position) {
        const oldPosition = song.position;
        let greaterPlaylistSongs;
        if (oldPosition > newPosition) {
            greaterPlaylistSongs = await PlaylistSong.find({
                playlist: playlistId,
                position: { $gte: newPosition, $lt: oldPosition }
            });
            greaterPlaylistSongs.forEach(async (gps) => {
                gps.position += 1;
                await gps.save();
            });
        } else if (oldPosition < newPosition) {
            greaterPlaylistSongs = await PlaylistSong.find({
                playlist: playlistId,
                position: { $gt: oldPosition, $lte: newPosition }
            });
            greaterPlaylistSongs.forEach(async (gps) => {
                gps.position -= 1;
                await gps.save();
            });
        }
        song.position = newPosition;
    }
    if (newBounce && newBounce !== songId) {
        const [versionId, bounceId] = newBounce.split('-');
        song.version = versionId;
        song.bounce = bounceId;
    }
    await song.save();
    res.redirect(`/${bandName}`);

});

router.post('/:bandName/delete-playlist-song', currentUser, requireAuth, async (req, res) => {
  
    const bandName = req.params.bandName;
    const { songId, playlistId } = req.body;
 
    const song = await PlaylistSong.findById(songId);
    
    const playlist = await Playlist.findById(playlistId).populate('songs');

    const greaterPlaylistSongs = playlist.songs.filter(s => s.position > song.position);
    greaterPlaylistSongs.forEach(async (gps) => {
        gps.position -= 1;
        await gps.save();
    });
    
    // await Playlist.updateOne({ _id: playlistId }, { $pull: {songs: songId} });

    playlist.songs = playlist.songs.filter(s => s.id !== song.id);
    await playlist.save();
    
    await PlaylistSong.deleteOne({ _id: songId });

    res.redirect(`/${bandName}`);

});

export { router as playlistSongRouter };