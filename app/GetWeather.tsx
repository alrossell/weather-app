
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

export async function getCityWeather(latitude: number, longitude: number): Promise<number> {
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

export async function getCurrentWeather(): Promise<string> {
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
