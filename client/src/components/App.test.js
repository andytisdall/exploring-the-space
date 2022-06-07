import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment';

import Root from '../root';
import App from './App';
import {
  mockBand,
  mockTier,
  mockTitle,
  mockVersion,
  mockBounce,
} from '../mocks/data';

const wrapper = ({ children }) => {
  return <Root initialState={{ auth: { isSignedIn: true } }}>{children}</Root>;
};

test('loads everything', async () => {
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
