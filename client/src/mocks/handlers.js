import { rest } from 'msw';
import {
  mockBand,
  mockBounce,
  mockBounce2,
  mockBounce3,
  mockPlaylist,
  mockPlaylistSong,
  mockTier,
  mockTitle,
  mockVersion,
  mockVersion2,
  mockUser,
} from './data';

export const handlers = [
  rest.get('http://localhost:3001/api/titles/:id', (req, res, ctx) => {
    return res(ctx.json([mockTitle]));
  }),
  rest.get('http://localhost:3001/api/versions/:id', (req, res, ctx) => {
    return res(ctx.json([mockVersion, mockVersion2]));
  }),
  rest.get('http://localhost:3001/api/bounces/:id', (req, res, ctx) => {
    return res(ctx.json([mockBounce, mockBounce2]));
  }),
  rest.get('http://localhost:3001/api/playlists/:id', (req, res, ctx) => {
    return res(ctx.json([mockPlaylist]));
  }),
  rest.get('http://localhost:3001/api/playlistsongs/:id', (req, res, ctx) => {
    return res(ctx.json([mockPlaylistSong]));
  }),
  rest.get('http://localhost:3001/api/tiers/:id', (req, res, ctx) => {
    return res(ctx.json([mockTier]));
  }),
  rest.get('http://localhost:3001/api/bands/:bandName', (req, res, ctx) => {
    return res(ctx.json(mockBand));
  }),
  rest.get('http://localhost:3001/api/bands', (req, res, ctx) => {
    return res(ctx.json([mockBand]));
  }),
  rest.get('http://localhost:3001/api/user', (req, res, ctx) => {
    return res(ctx.json(mockUser));
  }),
  rest.post('http://localhost:3001/api/bounces', (req, res, ctx) => {
    return res(ctx.json(mockBounce3));
  }),
  rest.post('http://localhost:3001/api/versions', (req, res, ctx) => {
    return res(ctx.json(mockVersion2));
  }),
  rest.patch('http://localhost:3001/api/versions/:id', (req, res, ctx) => {
    return res(ctx.json({ ...mockVersion, ...req.body }));
  }),
  rest.patch('http://localhost:3001/api/bounces/:id', (req, res, ctx) => {
    return res(ctx.json({ ...mockBounce, ...req.body }));
  }),
  rest.patch('http://localhost:3001/api/titles/:id', (req, res, ctx) => {
    if (req.body.selectedVersion) {
      return res(ctx.json({ ...mockTitle, selectedVersion: mockVersion2 }));
    } else if (req.body.selectedBounce) {
      return res(ctx.json({ ...mockTitle, selectedBounce: mockBounce3 }));
    }
  }),
  rest.post('http://localhost:3001/api/bounces/delete', (req, res, ctx) => {
    return res(ctx.json(mockBounce));
  }),
];
