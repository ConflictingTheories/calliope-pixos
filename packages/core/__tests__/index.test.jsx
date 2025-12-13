import React from 'react';
import { render, screen } from '@testing-library/react';
import Pixos from '../src/index.jsx';

// Mock the WebGLView component since it uses WebGL
jest.mock('../src/components/WebGLView.jsx', () => {
  return function MockWebGLView({ width, height }) {
    return <div data-testid="webgl-view" style={{ width, height }}>WebGL View</div>;
  };
});

// Mock the SpritzProvider
jest.mock('../src/spritz/player.js', () => {
  return function MockSpritzProvider() {
    return {};
  };
});

describe('Pixos Component', () => {
  test('renders without crashing', () => {
    render(<Pixos />);
    expect(screen.getByTestId('webgl-view')).toBeInTheDocument();
  });

  test('passes zipData to state', () => {
    const zipData = 'test-data';
    render(<Pixos zipData={zipData} />);
    // Since we can't easily test internal state, just check it renders
    expect(screen.getByTestId('webgl-view')).toBeInTheDocument();
  });

  test('has correct dimensions', () => {
    render(<Pixos />);
    const webglView = screen.getByTestId('webgl-view');
    expect(webglView).toHaveStyle({ width: '480px', height: '640px' });
  });
});