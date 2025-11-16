import { render, screen } from '@testing-library/react';
import Heatmap from './Heatmap';

describe('Heatmap Component', () => {
  test('renders without crashing', () => {
    render(<Heatmap />);
    expect(screen.getByTestId('heatmap')).toBeInTheDocument();
  });

  test('handles props correctly', () => {
    const data = [{ x: 1, y: 2, value: 3 }];
    render(<Heatmap data={data} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('interacts correctly', () => {
    const handleClick = jest.fn();
    render(<Heatmap onClick={handleClick} />);
    screen.getByTestId('heatmap').click();
    expect(handleClick).toHaveBeenCalled();
  });
});