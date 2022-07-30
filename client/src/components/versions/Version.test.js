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

beforeAll(async () => {
  const band = await screen.findByRole('heading', {
    name: mockBand.name,
  });
  expect(band).toBeInTheDocument();

  userEvent.click(band);
});

beforeEach(async () => {
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
});

it('creates a version', async () => {
  const addVersionButton = await screen.findByAltText(/add a version/i);
  expect(addVersionButton).toBeInTheDocument();
  userEvent.click(addVersionButton);

  const nameValue = mockVersion2.name;
  const notesValue = mockVersion2.notes;

  const nameInput = await screen.findByLabelText('Name:');
  userEvent.type(nameInput, nameValue);
  const notesInput = screen.getByLabelText('Notes:');
  userEvent.type(notesInput, notesValue);
  const submitButton = screen.getByRole('button', { name: 'OK' });
  userEvent.click(submitButton);

  const noSubmitButton = screen.queryByRole('button', { name: 'OK' });
  expect(noSubmitButton).not.toBeInTheDocument();

  let newVersionName;
  await waitFor(() => {
    newVersionName = screen.getByRole('button', { name: nameValue });
    expect(newVersionName).toBeInTheDocument();
  });
  const newVersionNotes = screen.getByText(notesValue);
  expect(newVersionNotes).toBeInTheDocument();

  const noBounces = screen.getByText(/no bounces for this version/i);
  expect(noBounces).toBeInTheDocument();
});

it('changes versions', async () => {});
