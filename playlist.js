const mongoose = require('mongoose');
const Playlist = mongoose.models('Playlist');
const PlaylistSong = mongoose.models('PlaylistSong');

exports.createPlaylist = async (req, res) => {
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
};

exports.createPlaylistSong = async (req, res) => {
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
};

exports.deletePlaylistSong = async (req, res) => {
    try {
        const { ID } = req.body;
        await PlaylistSong.deleteOne({ _id: ID });
        res.redirect('/');
    } catch (err) {
        req.session.errormessage = err.message;
        res.redirect('/');
    }
};

exports.deletePlaylist = async (req, res) => {
    try {
        const { ID } = req.body;
        await Playlist.deleteOne({ _id: ID });
        res.redirect('/');
    } catch (err) {
        req.session.errormessage = err.message;
        res.redirect('/');
    }
};