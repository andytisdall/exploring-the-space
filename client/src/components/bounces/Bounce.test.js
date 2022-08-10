import {
  render,
  screen,
  fireEvent,
  waitFor,
  prettyDOM,
  findByTestId,
  findByAltText,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment';

import Root from '../../root';
import App from '../App';
import {
  mockBand,
  mockTier,
  mockTitle,
  mockVersion,
  mockVersion2,
  mockBounce,
  mockBounce2,
  mockBounce3,
  mockPlaylist,
  mockUser,
} from '../../mocks/data';

let wrapper = ({ children }) => {
  return <Root initialState={{ auth: { isSignedIn: true } }}>{children}</Root>;
};

beforeAll(async () => {
  render(<App />, { wrapper });
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

test('shows the date of the selected bounce', async () => {
  const date = await screen.findByRole('button', {
    name: moment.utc(mockBounce.date).format('MM/DD/yy'),
  });
  expect(date).toBeInTheDocument();
});

test('changes the selected bounce', async () => {
  const date = await screen.findByRole('button', {
    name: moment.utc(mockBounce.date).format('MM/DD/yy'),
  });

  userEvent.click(date);

  // console.log(prettyDOM(screen.getByTestId(mockBounce.id), 10000));

  const otherDate = await screen.findByText(
    moment.utc(mockBounce2.date).format('MM/DD/yy')
  );
  expect(otherDate).toBeInTheDocument();

  userEvent.click(otherDate);

  const removedDate = screen.queryByRole('button', {
    name: moment.utc(mockBounce.date).format('MM/DD/yy'),
  });
  expect(removedDate).not.toBeInTheDocument();
  // console.log(prettyDOM(undefined, 10000));

  const playContainerDate = await screen.findByTestId(
    `play-con-date-${mockTitle.id}`
  );
  expect(playContainerDate).toHaveTextContent(
    moment.utc(mockBounce2.date).format('MM/DD/YY')
  );
});

it('uploads a bounce', async () => {
  const addButton = await screen.findByAltText(/add a bounce/i);
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

  const bounceCount = screen.getByRole('heading', {
    level: 5,
    name: /bounces/i,
  });
  expect(bounceCount).toHaveTextContent('3 Bounces');
  const playContainerDate = await screen.findByTestId(
    `play-con-date-${mockTitle.id}`
  );
  expect(playContainerDate).toHaveTextContent(
    moment.utc(mockBounce3.date).format('MM/DD/YY')
  );
});

it('deletes a bounce', async () => {
  // const bounceBox = await screen.findByTestId(mockBounce.id);
  // console.log(prettyDOM(bounceBox, 10000));
  const date = await screen.findByRole('button', {
    name: moment.utc(mockBounce.date).format('MM/DD/yy'),
  });
  expect(date).toBeInTheDocument();

  const deleteButton = await screen.findByTestId(`delete-${mockBounce.id}`);
  expect(deleteButton).toBeInTheDocument();
  // console.log(deleteButton);
  userEvent.click(deleteButton);

  // console.log(prettyDOM());
  const confirmDeleteButton = await screen.findByRole('button', {
    name: /delete/i,
  });

  userEvent.click(confirmDeleteButton);
  await waitFor(() => {
    const deletedDate = screen.queryByRole('button', {
      name: moment.utc(mockBounce.date).format('MM/DD/yy'),
    });
    expect(deletedDate).not.toBeInTheDocument();
  });
  const playContainerDate = await screen.findByTestId(
    `play-con-date-${mockTitle.id}`
  );
  expect(playContainerDate).toHaveTextContent(
    moment.utc(mockBounce2.date).format('MM/DD/YY')
  );
});
