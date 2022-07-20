import express from 'express';
import { currentUser } from '../middlewares/current-user.js';
import { requireAuth } from '../middlewares/require-auth.js';
import { Band } from '../models/band.js';
import { Playlist } from '../models/models.js';

const router = express.Router();

router.get('/playlists/:bandId', async (req, res) => {
  const { bandId } = req.params;

  const band = await Band.findById(bandId).populate('playlists');

  if (!band) {
    throw new Error('Band does not exist');
  }

  res.status(200).send(band.playlists);
});

router.post('/playlists', currentUser, requireAuth, async (req, res) => {
  const { playlistName, currentBand } = req.body;
  const band = await Band.findById(currentBand).populate('playlists');
  if (!band) {
    throw new Error('Band not found');
  }
  const duplicateName = band.playlists.find(
    (playlist) => playlist.name === playlistName
  );
  if (duplicateName) {
    throw new Error('Playlist name already exists');
  }
  const newPlaylist = new Playlist({
    name: playlistName,
    position: band.playlists.length + 1,
  });
  await newPlaylist.save();

  band.playlists.push(newPlaylist);
  await band.save();

  res.status(201).send(newPlaylist);
});

router.patch('/playlists/:id', currentUser, requireAuth, async (req, res) => {
  const { id } = req.params;
  const { name, position, currentBand } = req.body;

  const band = await Band.findById(currentBand).populate('playlists');
  if (!band) {
    throw new Error('Band not found');
  }

  const playlist = await Playlist.findById(id);
  if (!playlist) {
    throw new Error('Playlist not found');
  }

  const oldPosition = playlist.position;
  let allPlaylists = band.playlists;
  let greaterPlaylists;

  if (oldPosition > position) {
    greaterPlaylists = allPlaylists.filter(
      (pl) => oldPosition > pl.position && pl.position >= position
    );
    await Promise.all(
      greaterPlaylists.map((pl) => {
        pl.position += 1;
        return pl.save();
      })
    );
  } else if (oldPosition < position) {
    greaterPlaylists = allPlaylists.filter(
      (pl) => oldPosition < pl.position && pl.position <= position
    );
    await Promise.all(
      greaterPlaylists.map((pl) => {
        pl.position -= 1;
        return pl.save();
      })
    );
  }
  playlist.position = position;

  if (name) {
    playlist.name = name;
  }
  await playlist.save();
  res.send(playlist);
});

router.post('/playlists/delete', currentUser, requireAuth, async (req, res) => {
  const { playlistId, currentBand } = req.body;

  let thisPlaylist = await Playlist.findById(playlistId);

  const band = await Band.findById(currentBand).populate('playlists');
  if (band) {
    await Band.updateOne(
      { _id: currentBand },
      { $pull: { playlists: playlistId } }
    );
  }

  const changePosition = band.playlists.filter(
    (p) => p.position > thisPlaylist.position
  );
  await Promise.all(
    changePosition.map(async (pl) => {
      pl.position = pl.position - 1;
      return pl.save();
    })
  );

  await Playlist.deleteOne({ _id: playlistId });

  res.send(thisPlaylist);
});

export { router as playlistRouter };
