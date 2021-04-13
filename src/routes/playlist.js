import mongoose from 'mongoose';
import express from 'express';
import { currentUser } from '../middlewares/current-user.js';
import { requireAuth } from '../middlewares/require-auth.js';
import { Band } from '../models/band.js';

const router = express.Router();

router.post('/:bandName/create-playlist', currentUser, requireAuth, async (req, res) => {

    const bandName = req.params.bandName;
    const { playlistName } = req.body;
    const allPlaylists = await Band
    const newPlaylist = new Playlist({ name: playlistName, position: allPlaylists.length + 1 });
    await newPlaylist.save();
    res.redirect(`/${bandName}`);
 
});

// export async function createPlaylistSong(req, res) {

//     const { songTitle, songVersion, songBounce, playlist } = req.body;
//     const allPlaylistSongs = await PlaylistSong.find({});
//     const newPlaylistSong = new PlaylistSong({
//         title: songTitle,
//         version: songVersion,
//         bounce: songBounce,
//         playlist,
//         position: allPlaylistSongs.length + 1
//     });
//     await newPlaylistSong.save();
//     res.redirect('/');
// };

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


// export async function changePosition(req, res) {
  
//     const { songId, newPosition } = req.body;
//     const song = await PlaylistSong.find({ _id: songId });
//     const oldPosition = song.position;
//     if (oldPosition == newPosition) {
//         return res.redirect('/');
//     }
//     let greaterPlaylistSongs;
//     if (oldPosition > newPosition) {
//         greaterPlaylistSongs = await PlaylistSong.find({
//             playlist: song.playlist,
//             position: { $gte: newPosition, $lt36: oldPosition }
//         });
//         greaterPlaylistSongs.forEach(async (gps) => {
//             gps.position += 1;
//             await gps.save();
//         });
//     } else if (oldPosition < newPosition) {
//         greaterPlaylistSongs = await PlaylistSong.find({
//             playlist: song.playlist,
//             position: { $gt: oldPosition, $lte: newPosition }
//         });
//         greaterPlaylistSongs.forEach(async (gps) => {
//             gps.position -= 1;
//             await gps.save();
//         });
//     }
//     song.position = newPosition;
//     await song.save();
//     res.redirect('/');

// };

export { router as playlistRouter };