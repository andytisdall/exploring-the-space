import mongoose from 'mongoose';
import express from 'express';
import { currentUser } from '../middlewares/current-user.js';
import { requireAuth } from '../middlewares/require-auth.js';
import { Band } from '../models/band.js';
import { Playlist, PlaylistSong, Title, Version, Song } from '../models/models.js';


const router = express.Router();

router.get('/playlistsongs/:playlistId', async (req, res) => {

    const playlist = await Playlist.findById(req.params.playlistId).populate('songs');
        // .populate({
        //     path: 'songs',
        //     populate: ['title', 'version', 'bounce'],
        //     options: { sort: 'position' }
        // });

    res.status(200).send(playlist.songs);


});


router.post('/playlistsongs', currentUser, requireAuth, async (req, res) => {

    const { playlistId, bounce, version, title } = req.body;

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

    // newPlaylistSong.title = await Title.findById(title);
    // newPlaylistSong.version = await Version.findById(version);
    // newPlaylistSong.bounce = await Song.findById(bounce)

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

router.post('/playlistsongs/delete', currentUser, requireAuth, async (req, res) => {

    const { playlistSongId, playlistId } = req.body;

 
    const song = await PlaylistSong.findById(playlistSongId);
    
    const playlist = await Playlist.findById(playlistId);

    if (playlist) {
        playlist.songs = playlist.songs.filter(s => s.id !== song.id);
        await playlist.save();
    }
    
    await PlaylistSong.deleteOne({ _id: playlistSongId });

    res.send(song);

});

export { router as playlistSongRouter };