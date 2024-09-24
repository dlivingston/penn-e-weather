/* eslint-disable @next/next/no-img-element */
'use client'

import React, { useState, useEffect } from 'react';
import { WeatherData, ApiError } from "@/types";

export default function Home() {
  const [city, setCity] = useState<string>('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchWeatherData = async (lat?: number, lon?: number) => {
    setError(null);
    setLocationError(null);
    setIsLoading(true);
    try {
      const url = lat && lon
        ? `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}&units=imperial`
        : `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}&units=imperial`;

      const response = await fetch(url);
      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.message);
      }
      const data: WeatherData = await response.json();
      setWeatherData(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Failed to fetch weather data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherData(latitude, longitude);
        },
        (error) => {
          setLocationError('Failed to get your location');
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser');
    }
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      fetchWeatherData();
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-2xl mb-4">PENN-E-Weather</h1>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={handleKeyDown}
            className="p-2 border border-gray-300 rounded bg-inherit"
          />
          <button
            onClick={() => fetchWeatherData()}
            className="p-2 bg-blue-500 text-white rounded"
          >
            Get Weather
          </button>
        </div>
        {isLoading && <p>Loading Weather Data...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {locationError && <p className="text-red-500">{locationError}</p>}
        {weatherData && (
          <div className="flex flex-col gap-4 items-center">
            <h2 className="text-xl">Weather in {weatherData.name}</h2>
            <div className="flex gap-4 items-center">
              <img
                src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`}
                alt={weatherData.weather[0].description}
              />
              <p>{weatherData.weather[0].description}</p>
            </div>
            <p>Temperature: {weatherData.main.temp}°F</p>
            <p>Humidity: {weatherData.main.humidity}%</p>
          </div>
        )}
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          href="https://donaldlivingston.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2"
        > A Donald Livingston Project</a>
      </footer>
    </div>
  );
}