import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Root from '../root';
import App from './App';

const wrapper = ({ children }) => {
  return <Root initialState={{ auth: { isSignedIn: true } }}>{children}</Root>;
};

test('loads everything', async () => {
  render(<App />, { wrapper });

  const header = screen.getByText(/exploring the space/i);
  expect(header).toBeInTheDocument();

  const band = await screen.findByText(/the appropriators/i);
  expect(band).toBeInTheDocument();

  userEvent.click(band);
  const notHeader = screen.queryByText(/exploring the space/i);
  expect(notHeader).not.toBeInTheDocument();
});
