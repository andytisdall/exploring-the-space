import { rest } from 'msw';
import {
  mockBand,
  mockBounce,
  mockPlaylist,
  mockPlaylistSong,
  mockTier,
  mockTitle,
  mockVersion,
  mockUser,
} from './data';

export const handlers = [
  rest.get('http://localhost:3001/api/titles/:id', (req, res, ctx) => {
    return res(ctx.json([mockTitle]));
  }),
  rest.get('http://localhost:3001/api/versions/:id', (req, res, ctx) => {
    return res(ctx.json([mockVersion]));
  }),
  rest.get('http://localhost:3001/api/bounces/:id', (req, res, ctx) => {
    return res(ctx.json([mockBounce]));
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
];
