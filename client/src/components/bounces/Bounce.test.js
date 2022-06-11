import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment';

import Root from '../../root';
import Bounce from './Bounce';
import {
  mockBand,
  mockBounce,
  mockBounce2,
  mockTitle,
  mockVersion,
  mockTier,
  mockUser,
} from '../../mocks/data';

const title = {
  ...mockTitle,
  selectedBounce: mockBounce,
  selectedVersion: mockVersion,
};

const song = {
  mockTier,
  title,
  version: mockVersion,
  bounce: mockBounce,
};

const initialState = {
  auth: { isSignedIn: true, user: mockUser },
  bands: { currentBand: mockBand },
  titles: { [title.id]: title },
  versions: { [mockVersion.id]: mockVersion },
  bounces: { [mockBounce.id]: mockBounce, [mockBounce2.id]: mockBounce2 },
};

const wrapper = ({ children }) => {
  return <Root initialState={initialState}>{children}</Root>;
};

test('shows the date of the selected bounce', async () => {
  render(
    <Bounce
      bounces={[mockBounce, mockBounce2]}
      title={title}
      version={mockVersion}
      song={song}
    />,
    { wrapper }
  );
  const date = await screen.findByRole('button', {
    name: moment.utc(mockBounce.date).format('MM/DD/yy'),
  });
  expect(date).toBeInTheDocument();
});

test('changes the selected bounce', async () => {
  render(
    <Bounce
      bounces={[mockBounce, mockBounce2]}
      title={title}
      version={mockVersion}
      song={song}
    />,
    { wrapper }
  );
  const date = await screen.findByRole('button', {
    name: moment.utc(mockBounce.date).format('MM/DD/yy'),
  });

  userEvent.click(date);

  const otherDate = await screen.findByText(
    moment.utc(mockBounce2.date).format('MM/DD/yy')
  );
  expect(otherDate).toBeInTheDocument();

  userEvent.click(otherDate);

  const removedDate = screen.queryByRole('button', {
    name: moment.utc(mockBounce.date).format('MM/DD/yy'),
  });
  expect(removedDate).not.toBeInTheDocument();
});

test('adds a bounce', async () => {
  render(
    <Bounce
      bounces={[mockBounce, mockBounce2]}
      title={title}
      version={mockVersion}
      song={song}
    />,
    { wrapper }
  );
  const addButton = screen.getByAltText(/add a bounce/i);
  userEvent.click(addButton);

  const dateInput = await screen.findByLabelText('Date:');
  const dateValue = '2000-01-01';
  fireEvent.change(dateInput, { target: { value: dateValue } });

  const fileInput = screen.getByLabelText('File:');
  const mockFile = new File(['wf48h4wf894j'], 'mock.mp3', {
    type: 'audio/mpeg',
  });
  userEvent.upload(fileInput, mockFile);

  const submitButton = screen.getByRole('button', { name: 'OK' });
  userEvent.click(submitButton);

  const addBoxTitle = screen.queryByRole('heading', {
    level: 3,
    name: /add a bounce/i,
  });
  expect(addBoxTitle).not.toBeInTheDocument();

  const newDate = await screen.findByRole('button', {
    name: moment.utc(dateValue).format('MM/DD/yy'),
  });
  expect(newDate).toBeInTheDocument();
});
