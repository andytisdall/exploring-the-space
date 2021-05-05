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

router.post('/:bandName/change-playlist-position', currentUser, requireAuth, async (req, res) => {
  
    const bandName = req.params.bandName;
    const band = await Band.findOne({ name: bandName }).populate('playlists');
    if (!band) {
        throw new Error('Band not found');
    }

    const { newPosition, playlistId, playlistName } = req.body;
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new Error('Playlist not found');
    }

    const oldPosition = playlist.position;
    let allPlaylists = band.playlists;
    let greaterPlaylists;

    if (oldPosition > newPosition) {
        greaterPlaylists = allPlaylists.filter(pl => oldPosition > pl.position && pl.position >= newPosition);
        greaterPlaylists.forEach(async (pl) => {
            pl.position += 1;
            await pl.save();
        });

    } else if (oldPosition < newPosition) {
        greaterPlaylists = allPlaylists.filter(pl => oldPosition < pl.position && pl.position <= newPosition);
        console.log(greaterPlaylists);
        greaterPlaylists.forEach(async (pl) => {
            pl.position -= 1;
            await pl.save();
        });
    }
    playlist.position = newPosition;
    playlist.name = playlistName;
    await playlist.save();
    res.redirect(`/${bandName}`);

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

router.post('/:bandName/delete-playlist', currentUser, requireAuth, async (req, res) => {
  
    let bandName = req.params.bandName;
    if (bandName === 'apprehenchmen') {
        bandName = 'Apprehenchmen';
    }
    const { playlistId } = req.body;
 
    await Band.updateOne({ name: bandName }, { $pull: {playlists: playlistId} });
    
    const playlist = await Playlist.findById(playlistId);
    
    playlist.songs.forEach(async (songId) => {                
        await PlaylistSong.deleteOne({ _id: songId });
    });
    const changePosition = await Playlist.find({ position: { $gt: playlist.position }});
    changePosition.forEach(async (pl) => {
        await Playlist.updateOne({ _id: pl.id }, { position: pl.position-1 });
    });
    await Playlist.deleteOne({ _id: playlistId });

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

export { router as playlistRouter };