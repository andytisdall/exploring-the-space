import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Root from '../../root';
import Title from './Title';
import { mockTier, mockTitle, mockVersion } from '../../mocks/data';

const wrapper = ({ children }) => {
  return (
    <Root initialState={{ titles: { [mockTitle.id]: mockTitle } }}>
      {children}
    </Root>
  );
};

test('loads everything', async () => {
  render(
    <Title
      title={mockTitle}
      tier={mockTier}
      getTime={() => {}}
      findLatest={() => {}}
    />,
    { wrapper }
  );
  const titleName = screen.getByText(mockTitle.title);
  expect(titleName).toBeInTheDocument();

  userEvent.click(titleName);

  const versionTitle = await screen.findByText(mockVersion.name);
  expect(versionTitle).toBeInTheDocument();
});
