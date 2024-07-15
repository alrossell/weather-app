'use client'

import { useState, useEffect, ChangeEvent } from 'react';
import WeatherDisplay from './WeatherDisplay';
import { WeatherInfo, CityInfo } from './types';
import { getCityWeather } from './GetWeather';

async function fetchSuggestedCitues(prompt: string): Promise<CityInfo[]> {
  try {
    const response = await fetch(`/api/GetCity?prompt=${prompt}`);
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('Failed to fetch user data');
    }
  } catch (error) {
    console.error(error);
  }

  return [];
};

export default function Home() {
  const [weatherInfoList, setWeatherInfoList] = useState<WeatherInfo[]>([]);
  const [cityOptions, setCityOptions] = useState<CityInfo[]>([]);
  const [inputValue, setInputValue] = useState<string>('');

  function clearSuggestions() {
    cityOptions.splice(0, cityOptions.length);

    setCityOptions(cityOptions);
    setInputValue("");
  }

  const getMostLikelyCity = (userInput: string) => {
    if (userInput === "") {
      clearSuggestions();
      return;
    }

    fetchSuggestedCitues(userInput).then((value) => {
      const test = value.slice(0, 3);
      setCityOptions(test);
    }, (error) => {
      console.log(error);
    })

    setInputValue(userInput);
  }

  const handleClick = (parameter: CityInfo) => {

    getCityWeather(parameter.lat, parameter.lng).then((value) => {
      const newWeatherInfo: WeatherInfo = {
        city: parameter.city,
        city_ascii: parameter.city_ascii,
        state_id: parameter.state_id,
        state_name: parameter.state_name,
        county_name: parameter.county_name,
        weather: value,
        id: parameter.id,
      }

      weatherInfoList.push(newWeatherInfo);
      setWeatherInfoList([...weatherInfoList]);

    }, (error) => {
      console.log(error);
    })

    clearSuggestions();
  }

  return (
    <main className="bg-gray-100 h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl m-4">Weather</h1>
      <WeatherDisplay weatherInfo={weatherInfoList} />
      <div className='mt-10 flex flex-col items-center justify-center'>
        <div className="relative inline-block">
          <div className="flex flex-col">
            <button>Insert</button>
            <input
              type="text"
              value={inputValue}
              onChange={e => getMostLikelyCity(e.target.value)} />
          </div>
          <ul className='none absolute z-1 w-full'>
            {cityOptions.map((item: CityInfo) => (
              <li key={item.id} className='block p-1 bg-white'>
                <button onClick={() => handleClick(item)} className="flex justify-between items-center w-full cursor-pointer">
                  <span className="order-1">{item.city_ascii}</span>
                  <span className="order-2 text-xs">({item.state_id})</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
