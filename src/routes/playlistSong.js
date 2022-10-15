import express from 'express';
import { currentUser } from '../middlewares/current-user.js';
import { requireAuth } from '../middlewares/require-auth.js';
import { Playlist, PlaylistSong } from '../models/models.js';

const router = express.Router();

router.get('/playlistsongs/:playlistId', async (req, res) => {
  const playlist = await Playlist.findById(req.params.playlistId).populate({
    path: 'songs',
    populate: ['version', 'bounce'],
  });

  return res.status(200).send(playlist.songs);
});

router.get('/playlistsongs/populate/:playlistId', async (req, res) => {
  const playlist = await Playlist.findById(req.params.playlistId).populate({
    path: 'songs',
    populate: ['version', 'bounce'],
  });

  return res.status(200).send(playlist.songs);
});

router.post('/playlistsongs', currentUser, requireAuth, async (req, res) => {
  const { playlistId, bounce, version, title } = req.body;

  const playlist = await Playlist.findById(playlistId);

  const newPlaylistSong = new PlaylistSong({
    title,
    version,
    bounce,
    position: playlist.songs.length + 1,
  });
  await newPlaylistSong.save();

  playlist.songs.push(newPlaylistSong);
  playlist.save();
  const populatedPlaylistSong = await PlaylistSong.findById(
    newPlaylistSong.id
  ).populate(['version', 'bounce']);

  res.status(201).send(populatedPlaylistSong);
});

router.patch(
  '/playlistsongs/:id',
  currentUser,
  requireAuth,
  async (req, res) => {
    const { id } = req.params;
    const { bounce, position, version, playlistId } = req.body;
    const song = await PlaylistSong.findById(id);
    if (!song) {
      throw new Error('Playlist song not found');
    }

    const playlist = await Playlist.findById(playlistId).populate('songs');
    const otherSongs = playlist.songs;

    if (position !== song.position) {
      const oldPosition = song.position;
      let greaterPlaylistSongs;
      if (oldPosition > position) {
        greaterPlaylistSongs = otherSongs.filter(
          (pls) => pls.position >= position && pls.position < oldPosition
        );
        await Promise.all(
          greaterPlaylistSongs.map((gps) => {
            gps.position += 1;
            return gps.save();
          })
        );
      } else if (oldPosition < position) {
        greaterPlaylistSongs = otherSongs.filter(
          (pls) => pls.position > oldPosition && pls.position <= position
        );
        await Promise.all(
          greaterPlaylistSongs.map((gps) => {
            gps.position = gps.position - 1;
            return gps.save();
          })
        );
      }
      song.position = position;
    }

    if (version) {
      song.version = version;
    }
    if (bounce) {
      song.bounce = bounce;
    }

    await song.save();
    const populatedSong = await PlaylistSong.findById(id).populate([
      'version',
      'bounce',
    ]);
    res.send(populatedSong);
  }
);

router.post(
  '/playlistsongs/delete',
  currentUser,
  requireAuth,
  async (req, res) => {
    const { playlistSongId, playlistId } = req.body;

    const song = await PlaylistSong.findById(playlistSongId);

    const playlist = await Playlist.findById(playlistId).populate('songs');

    if (playlist) {
      playlist.songs = playlist.songs.filter((s) => s.id !== song.id);
      playlist.save();

      const changePosition = playlist.songs.filter(
        (p) => p.position > song.position
      );
      Promise.all(
        changePosition.map((pls) => {
          pls.position = pls.position - 1;
          return pls.save();
        })
      );
    }

    PlaylistSong.deleteOne({ _id: playlistSongId });

    res.send(song);
  }
);

export { router as playlistSongRouter };
