// src/app/page.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from './page';

describe('Home Component', () => {
  it('renders the input and button', () => {
    render(<Home />);
    expect(screen.getByPlaceholderText('Enter city name')).toBeInTheDocument();
    expect(screen.getByText('Get Weather')).toBeInTheDocument();
  });

  it('updates the city state on input change', () => {
    render(<Home />);
    const input = screen.getByPlaceholderText('Enter city name');
    fireEvent.change(input, { target: { value: 'New York' } });
    expect(input).toHaveValue('New York');
  });

  it('displays error message when fetch fails', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'City not found' }),
      })
    ) as jest.Mock;

    render(<Home />);
    fireEvent.change(screen.getByPlaceholderText('Enter city name'), { target: { value: 'InvalidCity' } });
    fireEvent.click(screen.getByText('Get Weather'));

    const errorMessage = await screen.findByText('City not found');
    expect(errorMessage).toBeInTheDocument();
  });

  it('displays weather data when fetch succeeds', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            name: 'New York',
            main: { temp: 70, humidity: 50 },
            weather: [{ description: 'clear sky', icon: '01d' }],
          }),
      })
    ) as jest.Mock;

    render(<Home />);
    fireEvent.change(screen.getByPlaceholderText('Enter city name'), { target: { value: 'New York' } });
    fireEvent.click(screen.getByText('Get Weather'));

    const weatherData = await screen.findByText('Weather in New York');
    expect(weatherData).toBeInTheDocument();
    expect(screen.getByText('Temperature: 70°F')).toBeInTheDocument();
    expect(screen.getByText('Humidity: 50%')).toBeInTheDocument();
    expect(screen.getByText('clear sky')).toBeInTheDocument();
  });
});