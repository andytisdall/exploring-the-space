import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment';

import Root from '../root';
import App from './App';
import {
  mockBand,
  mockTier,
  mockTitle,
  mockVersion,
  mockVersion2,
  mockBounce,
  mockPlaylist,
  mockUser,
} from '../mocks/data';

let wrapper = ({ children }) => {
  return <Root initialState={{ auth: { isSignedIn: true } }}>{children}</Root>;
};

test('loads user page', async () => {
  render(<App />, { wrapper });

  // home page
  const signInButton = screen.getByText(/sign in/i);
  expect(signInButton).toBeInTheDocument();
  userEvent.click(signInButton);

  const userHeader = await screen.findByRole('heading', {
    name: mockUser.name,
    level: 1,
  });
  expect(userHeader).toBeInTheDocument();

  const homeButton = screen.getByText(/home/i);
  userEvent.click(homeButton);
});

test('loads home page and click through to band page', async () => {
  render(<App />, { wrapper });

  // home page
  const header = screen.getByRole('heading', { name: /exploring the space/i });
  expect(header).toBeInTheDocument();

  const band = await screen.findByRole('heading', {
    name: mockBand.name,
  });
  expect(band).toBeInTheDocument();

  userEvent.click(band);
  const notHeader = screen.queryByRole('heading', {
    name: /exploring the space/i,
  });
  expect(notHeader).not.toBeInTheDocument();

  const dots = await screen.findByAltText('navigation');
  userEvent.click(dots);

  const userHomeButton = await screen.findByText(/user home/i);
  expect(userHomeButton).toBeInTheDocument();
});

test('loads tiers to bounces', async () => {
  render(<App />, { wrapper });

  // band page
  const firstTier = await screen.findByRole('heading', { name: mockTier.name });
  expect(firstTier).toBeInTheDocument();

  // open title container
  userEvent.click(firstTier);
  const firstTitle = await screen.findByRole('heading', {
    name: mockTitle.title,
  });
  expect(firstTitle).toBeInTheDocument();
  userEvent.click(firstTitle);

  // open details
  const version = await screen.findByRole('button', { name: mockVersion.name });
  expect(version).toBeInTheDocument();
  const bounce = await screen.findByRole('button', {
    name: moment.utc(mockBounce.date).format('MM/DD/yy'),
  });
  expect(bounce).toBeInTheDocument();
});

test('loads playlists', async () => {
  render(<App />, { wrapper });
  // playlist
  const firstPlaylist = await screen.findByRole('heading', {
    name: mockPlaylist.name,
  });
  expect(firstPlaylist).toBeInTheDocument();

  // expand playlist
  userEvent.click(firstPlaylist);
  const firstPlaylistSong = await screen.findByRole('heading', {
    name: 'Rockin Title',
    level: 3,
  });
  expect(firstPlaylistSong).toBeInTheDocument();
});

test('get audio display up', async () => {
  render(<App />, { wrapper });

  // band page
  const firstTier = await screen.findByRole('heading', { name: mockTier.name });
  expect(firstTier).toBeInTheDocument();

  // open title container
  userEvent.click(firstTier);
  const playButton = await screen.findByAltText('play button');
  userEvent.click(playButton);

  const nextSongButton = await screen.findByAltText('next song');
  expect(nextSongButton).toBeInTheDocument();
  userEvent.click(nextSongButton);

  const noBigPlayButton = screen.queryByAltText('main play button');
  expect(noBigPlayButton).not.toBeInTheDocument();
});

test('loads both tiers and playlist and all children', async () => {
  render(<App />, { wrapper });

  // band page
  const firstTier = await screen.findByRole('heading', { name: mockTier.name });
  expect(firstTier).toBeInTheDocument();

  // open title container
  userEvent.click(firstTier);
  const firstTitle = await screen.findByRole('heading', {
    name: mockTitle.title,
  });
  expect(firstTitle).toBeInTheDocument();
  userEvent.click(firstTitle);

  // open details
  const version = await screen.findByRole('button', { name: mockVersion.name });
  expect(version).toBeInTheDocument();
  const bounce = await screen.findByRole('button', {
    name: moment.utc(mockBounce.date).format('MM/DD/yy'),
  });
  expect(bounce).toBeInTheDocument();

  // close title container
  userEvent.click(firstTier);

  // playlist
  const firstPlaylist = await screen.findByRole('heading', {
    name: mockPlaylist.name,
  });
  expect(firstPlaylist).toBeInTheDocument();

  // expand playlist
  userEvent.click(firstPlaylist);
  const firstPlaylistSong = await screen.findByRole('heading', {
    name: 'Rockin Title',
    level: 3,
  });
  expect(firstPlaylistSong).toBeInTheDocument();
});

test('loads everything while not signed in', async () => {
  render(<App />, { wrapper });
  const dots = await screen.findByAltText('navigation');
  userEvent.click(dots);

  const signOutButton = await screen.findByText(/sign out/i);
  userEvent.click(signOutButton);

  const band = await screen.findByRole('heading', {
    name: mockBand.name,
  });
  userEvent.click(band);

  // band page
  const firstTier = await screen.findByRole('heading', { name: mockTier.name });
  expect(firstTier).toBeInTheDocument();

  // open title container
  userEvent.click(firstTier);
  const firstTitle = await screen.findByRole('heading', {
    name: mockTitle.title,
  });
  expect(firstTitle).toBeInTheDocument();
  userEvent.click(firstTitle);

  // open details
  const version = await screen.findByRole('button', { name: mockVersion.name });
  expect(version).toBeInTheDocument();
  const bounce = await screen.findByRole('button', {
    name: moment.utc(mockBounce.date).format('MM/DD/yy'),
  });
  expect(bounce).toBeInTheDocument();

  // close title container
  userEvent.click(firstTier);

  // playlist
  const firstPlaylist = await screen.findByRole('heading', {
    name: mockPlaylist.name,
  });
  expect(firstPlaylist).toBeInTheDocument();

  // expand playlist
  userEvent.click(firstPlaylist);
  const firstPlaylistSong = await screen.findByRole('heading', {
    name: 'Rockin Title',
    level: 3,
  });
  expect(firstPlaylistSong).toBeInTheDocument();

  const newDots = await screen.findByAltText('navigation');
  userEvent.click(newDots);
  const userHomeButton = screen.queryByText(/user home/i);
  expect(userHomeButton).not.toBeInTheDocument();
});
