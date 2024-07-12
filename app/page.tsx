'use client'

import { useState, useEffect, ChangeEvent } from 'react';
import WeatherDisplay from './WeatherDisplay';
import { WeatherInfo, CityInfo } from './types';

function round(value: number, precision: number) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}

async function getWeatherRequest(latitude: number, longitude: number): Promise<string> {
  return fetch(`https://api.weather.gov/points/${latitude},${longitude}`)
    .then(res => res.json())
    .then(res => {
      return res["properties"]["forecast"];
    }).catch((error: any) => {
      console.log(error)
      return error;
    })
}

async function getCityWeather(latitude: number, longitude: number): Promise<number> {
  return new Promise((resolve, reject) => {
    latitude = round(latitude, 4);
    longitude = round(longitude, 4);

    getWeatherRequest(latitude, longitude)
      .then((request: string) => {
        fetch(request)
          .then(res => res.json())
          .then(res => {
            resolve(parseInt(res["properties"]["periods"][0]["temperature"]));
          })
          .catch((error: any) => {
            console.log(error);
            reject(""); // Reject with an empty string on fetch error
          });
      })
      .catch((error: any) => {
        console.log(error);
        reject(""); // Reject with an empty string on GetWeatherRequest error
      });
  });
}
async function getCurrentWeather(): Promise<string> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude: number = round(position.coords.latitude, 4);
        const longitude: number = round(position.coords.longitude, 4);

        getWeatherRequest(latitude, longitude)
          .then((request: string) => {
            fetch(request)
              .then(res => res.json())
              .then(res => {
                resolve(res["properties"]["periods"][0]["temperature"]);
              })
              .catch((error: any) => {
                console.log(error);
                reject(""); // Reject with an empty string on fetch error
              });
          })
          .catch((error: any) => {
            console.log(error);
            reject(""); // Reject with an empty string on GetWeatherRequest error
          });
      },
      (error) => {
        console.log(error);
        reject(""); // Reject with an empty string on geolocation error
      }
    );
  });
}

async function fetchSuggestedCitues(prompt: string): Promise<CityInfo[]> {
  try {
    const response = await fetch(`/api/csv?prompt=${prompt}`);
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('Failed to fetch user data');
    }
  } catch (error) {
    console.error(error);
    // Handle error fetching data
  }

  return [];
};

export default function Home() {
  const [weatherInfoList, setWeatherInfoList] = useState<WeatherInfo[]>([]);
  const [cityOptions, setCityOptions] = useState<CityInfo[]>([]);
  const [inputValue, setInputValue] = useState<string>('');

  function clearSuggestions() {
    while (cityOptions.length > 0) {
      cityOptions.pop();
    }

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
      <h1>Weather</h1>
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
                <button onClick={() => handleClick(item)} className="w-full text-left" >
                  {item.city_ascii}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
