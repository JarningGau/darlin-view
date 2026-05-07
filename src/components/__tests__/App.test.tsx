import { render, screen } from '@testing-library/react';
import App from '../../App';

test('renders the darlin-view shell', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'darlin-view' })).toBeInTheDocument();
  expect(screen.getByLabelText('Array')).toHaveValue('CA');
  expect(screen.getByText('Upload alignment TSV')).toBeInTheDocument();
});
