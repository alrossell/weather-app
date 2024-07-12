import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'; // Example icons from react-icons

import { WeatherInfo } from './types';

interface CarouselProps {
  weatherInfo: WeatherInfo[];
}

const WeatherDisplay: React.FC<CarouselProps> = ({ weatherInfo }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    setCurrentSlide(0);
  }, [weatherInfo]);

  const nextSlide = () => {
    setCurrentSlide((currentSlide + 1) % weatherInfo.length);
  };

  const prevSlide = () => {
    setCurrentSlide(currentSlide === 0 ? weatherInfo.length - 1 : currentSlide - 1);
  };


  if (!weatherInfo || weatherInfo.length === 0) {
    return (
      <div className="mt-10 flex space-x-4">
        <div className="flex space-x-6">
          <button className="text-xl" onClick={prevSlide}><FiChevronLeft /></button>
          <div className='flex flex-col space-y-4 items-center justify-center'>
            <p>{"Enter a City"}</p>
            <p>{"Please"}</p>
          </div>
          <button className="text-xl" onClick={nextSlide}><FiChevronRight /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 flex space-x-4">
      <div className="flex space-x-6">
        <button className="text-xl" onClick={prevSlide}><FiChevronLeft /></button>
        <div className='flex flex-col space-y-4 items-center justify-center'>
          <p>{weatherInfo[currentSlide].city}</p>
          <p>{weatherInfo[currentSlide].weather}</p>
        </div>
        <button className="text-xl" onClick={nextSlide}><FiChevronRight /></button>
      </div>
    </div>
  );
};

export default WeatherDisplay;
