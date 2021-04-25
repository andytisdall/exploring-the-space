import mongoose from 'mongoose';
import express from 'express';
import { currentUser } from '../middlewares/current-user.js';
import { requireAuth } from '../middlewares/require-auth.js';
import { Band } from '../models/band.js';
import { Playlist, PlaylistSong } from '../models/models.js';

const router = express.Router();

router.post('/:bandName/create-playlist', currentUser, requireAuth, async (req, res) => {

    const bandName = req.params.bandName;
    const { playlistName } = req.body;
    const band = await (await Band.findOne({ name: bandName })).populate('playlists');
    if (!band) {
        throw new Error('Band not found');
    }
    const duplicateName = band.playlists.find(playlist => playlist.name === playlistName);
    if (duplicateName) {
        throw new Error('Playlist name already exists');
    }
    const newPlaylist = new Playlist({ name: playlistName, position: band.playlists.length + 1 });
    await newPlaylist.save();

    band.playlists.push(newPlaylist);
    await band.save();

    res.redirect(`/${bandName}`);
 
});

router.post('/:bandName/create-playlist-song', currentUser, requireAuth, async (req, res) => {

    const bandName = req.params.bandName;
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
    res.redirect(`/${bandName}`);
});

// export async function deletePlaylistSong(req, res) {

//     const { ID } = req.body;
//     await PlaylistSong.deleteOne({ _id: ID });
//     res.redirect('/');

// }

// export async function deletePlaylist(req, res) {

//     const { ID } = req.body;
//     await Playlist.deleteOne({ _id: ID });
//     res.redirect('/');
// };


router.post('/:bandName/change-position', currentUser, requireAuth, async (req, res) => {
  
    const bandName = req.params.bandName;
    const { songId, newPosition } = req.body;
    const song = await PlaylistSong.findById(songId);
    if (!song) {
        throw new Error('Playlist song not found');
    }
    const oldPosition = song.position;
    if (oldPosition == newPosition) {
        return res.redirect('/');
    }
    let greaterPlaylistSongs;
    if (oldPosition > newPosition) {
        greaterPlaylistSongs = await PlaylistSong.find({
            playlist: song.playlist,
            position: { $gte: newPosition, $lt: oldPosition }
        });
        greaterPlaylistSongs.forEach(async (gps) => {
            gps.position += 1;
            await gps.save();
        });
    } else if (oldPosition < newPosition) {
        greaterPlaylistSongs = await PlaylistSong.find({
            playlist: song.playlist,
            position: { $gt: oldPosition, $lte: newPosition }
        });
        greaterPlaylistSongs.forEach(async (gps) => {
            gps.position -= 1;
            await gps.save();
        });
    }
    song.position = newPosition;
    await song.save();
    res.redirect(`/${bandName}`);

});

export { router as playlistRouter };