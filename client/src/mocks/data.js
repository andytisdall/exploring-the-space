export const mockBounce = {
  id: '1',
  date: new Date(),
  latest: true,
  comments: 'No Comment',
  mp3: 420975249,
  size: 34094249,
  duration: 5865,
};

export const mockBounce2 = {
  id: '2',
  date: new Date('4-20-99'),
  latest: false,
  comments: 'No Comment',
  mp3: 42097249,
  size: 34094249,
  duration: 5865,
};

export const mockBounce3 = {
  id: '3',
  date: new Date('01-01-2000'),
  latest: false,
  comments: 'No Comment',
  mp3: 42097249,
  size: 34094249,
  duration: 5865,
};

export const mockVersion = {
  id: '1',
  name: 'Pervy Version',
  current: true,
  notes: 'These notes of mine',
  bounces: ['1'],
};

export const mockVersion2 = {
  id: '2',
  name: 'Wacky Version',
  current: true,
  notes: 'These notes of brine',
  bounces: [],
};

export const mockTitle = {
  id: '1',
  title: 'Rockin Title',
  versions: ['1'],
  selectedVersion: mockVersion,
  selectedBounce: mockBounce,
};

export const mockTier = {
  id: '1',
  name: 'Mock Tier',
  position: 1,
  trackList: ['1'],
};

export const mockPlaylist = {
  id: '1',
  name: 'Fancy Playlist',
  position: 1,
  songs: ['1'],
  notes: 'some notes',
};

export const mockPlaylistSong = {
  id: '1',
  position: 1,
  title: '1',
  version: '1',
  bounce: '1',
};

export const mockBand = {
  id: '1',
  name: 'The Appropriators',
  tiers: ['1'],
  playlists: ['1'],
  url: 'theappropriators',
};

export const mockUser = {
  id: '1',
  username: 'FakeAndy',
  password: 'fhw48iy4fhwo84',
  bands: ['1'],
};
