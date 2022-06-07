import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Root from '../../root';
import Main from './Main';
import { mockBand } from '../../mocks/data';

const wrapper = ({ children }) => {
  return (
    <Root initialState={{ bands: { currentBand: mockBand } }}>{children}</Root>
  );
};

test('loads everything', async () => {
  render(<Main />, { wrapper });
});
