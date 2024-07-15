import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'; // Example icons from react-icons

import { WeatherInfo } from './types';

interface CarouselProps {
  weatherInfo: WeatherInfo[];
}

const WeatherDisplay: React.FC<CarouselProps> = ({ weatherInfo }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (weatherInfo.length != 0) {
      setCurrentSlide(weatherInfo.length - 1);
    }
  }, [weatherInfo]);

  const nextSlide = () => {
    setCurrentSlide((currentSlide + 1) % weatherInfo.length);
  };

  const prevSlide = () => {
    setCurrentSlide(currentSlide === 0 ? weatherInfo.length - 1 : currentSlide - 1);
  };


  const DisplayWeatherTile = () => {
    return (
      <div className="flex w-64  transition-transform duration-500 ease-in-out transform -translate-x-full" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
        {weatherInfo.length == 0 ?
          <div className="w-full flex-shrink-0">
            <div className="bg-white h-32 flex flex-col items-center justify-center">
              <div className="flex flex-col items-center justify-center">
                <p className="text-xl">Enter a city</p>
                <p className="text-xl">Please</p>
              </div>
            </div>
          </div>
          :
          weatherInfo.map((item) => (
            <div key={item.id} className="w-full flex-shrink-0">
              <div className="bg-white h-32 flex flex-col items-center justify-center">
                <div className="flex flex-col items-center justify-center">
                  <p className="text-xl m-1">{item.city}</p>
                  <p className="text-xl m-1">{item.weather}</p>
                  <p className="m-1">{item.state_name}</p>
                </div>
              </div>
            </div>
          ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-full overflow-hidden max-w-lg mx-auto">
        {DisplayWeatherTile()}
      </div>
      <div className="m-2 items-center justify-center">
        <button className="text-3xl" onClick={prevSlide}><FiChevronLeft /></button>
        <button className="text-3xl" onClick={nextSlide}><FiChevronRight /></button>
      </div>
    </div>
  );
};

export default WeatherDisplay;
