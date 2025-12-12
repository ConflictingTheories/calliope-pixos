import { render, screen } from '@testing-library/react';
import App from './App';

test('renders PixoSpritz console', () => {
  render(<App />);
  const titleElement = screen.getByText(/PixoSpritz/i);
  expect(titleElement).toBeInTheDocument();
});
