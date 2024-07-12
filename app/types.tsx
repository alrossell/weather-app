export interface WeatherInfo {
  city: string;
  city_ascii: string;
  state_id: string;
  state_name: string;
  county_name: string;
  weather: number;
  id: number;
}

export interface CityInfo {
  city: string;
  city_ascii: string;
  state_id: string;
  state_name: string;
  county_name: string;
  lat: number;
  lng: number
  ranking: number;
  id: number;
};

