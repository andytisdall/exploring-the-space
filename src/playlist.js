import mongoose from 'mongoose';
const Playlist = mongoose.model('Playlist');
const PlaylistSong = mongoose.model('PlaylistSong');

export async function createPlaylist(req, res) {
    try {
        const { playlistName } = req.body;
        const allPlaylists = await Playlist.find({});
        const newPlaylist = new Playlist({ name: playlistName, position: allPlaylists.length + 1 });
        await newPlaylist.save();
        res.redirect('/');
    } catch (err) {
        req.session.errormessage = err.message;
        res.redirect('/');
    }
}

export async function createPlaylistSong(req, res) {
    try {
        const { songTitle, songVersion, songBounce, playlist } = req.body;
        const allPlaylistSongs = await PlaylistSong.find({});
        const newPlaylistSong = new PlaylistSong({
            title: songTitle,
            version: songVersion,
            bounce: songBounce,
            playlist,
            position: allPlaylistSongs.length + 1
        });
        await newPlaylistSong.save();
        res.redirect('/');
    } catch (err) {
        req.session.errormessage = err.message;
        res.redirect('/');
    }
}

export async function deletePlaylistSong(req, res) {
    try {
        const { ID } = req.body;
        await PlaylistSong.deleteOne({ _id: ID });
        res.redirect('/');
    } catch (err) {
        req.session.errormessage = err.message;
        res.redirect('/');
    }
}

export async function deletePlaylist(req, res) {
    try {
        const { ID } = req.body;
        await Playlist.deleteOne({ _id: ID });
        res.redirect('/');
    } catch (err) {
        req.session.errormessage = err.message;
        res.redirect('/');
    }
}

export async function changePosition(req, res) {
    try {
        const { songId, newPosition } = req.body;
        const song = await PlaylistSong.find({ _id: songId });
        const oldPosition = song.position;
        if (oldPosition == newPosition) {
            return res.redirect('/');
        }
        let greaterPlaylistSongs;
        if (oldPosition > newPosition) {
            greaterPlaylistSongs = await PlaylistSong.find({
                playlist: song.playlist,
                position: { $gte: newPosition, $lt36: oldPosition }
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
        res.redirect('/');
    } catch (err) {
        req.session.errormessage = err.message;
        res.redirect('/');
    }
}