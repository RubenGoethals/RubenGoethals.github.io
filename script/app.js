let lon, lat;
const appid = 'cfcd25851a9145efb7a5aaebe896f2c3';
const levels = ['None', 'Low', 'Moderate', 'High', 'Very High'];
const level_colors = ['#096', '#096', '#ffde33', '#c03', '#7e0023']

function addDivItem(text) {
  let div = document.createElement('div');
  div.textContent = text;
  return div;
}

let showResultLiveboard = queryResponse => {
  // Showing the right data we will be using.
  console.log(queryResponse);

  const month = new Date().toLocaleString('en', {
    month: 'short',
  });
  const day = new Date().toLocaleString('en', {
    weekday: 'short',
  });

  document.querySelector('.js-date').innerHTML = `${day} ${ new Date().getDate()} ${month}`;
  let degree = document.querySelector('.js-degree').appendChild(addDivItem(Math.round(queryResponse.data[0].temp)));
  document.querySelector('.js-degree').appendChild(addDivItem(`℃`)).style.cssText = `font-size: 16px; font-weight: 400; line-height: 32px; display: block;`;

  let city = queryResponse.data[0].city_name;
  document.querySelector('.js-city').innerHTML = city;
  getAirQualityAPI(lat, lon);
};

let showResultAirQuality = (queryResponse) => {
  // Showing the right data I will be using.
  console.log(queryResponse);

  document.querySelector('.js-grass').innerHTML = "Grass";
  document.querySelector('.js-grass').style.background = level_colors[queryResponse.data[0].pollen_level_grass];
  document.querySelector('.js-grass').style.height = `${queryResponse.data[0].pollen_level_grass * 25}%`;
  document.querySelector('.js-grass').style.animationPlayState = "running";
  document.querySelector('.js-tree').innerHTML = "Tree";
  document.querySelector('.js-tree').style.background = level_colors[queryResponse.data[0].pollen_level_tree];
  document.querySelector('.js-tree').style.height = `${queryResponse.data[0].pollen_level_tree * 25}%`;
  document.querySelector('.js-tree').style.animationPlayState = "running";
  document.querySelector('.js-weed').innerHTML = "Weed";
  document.querySelector('.js-weed').style.background = `${level_colors[queryResponse.data[0].pollen_level_weed]}`;
  document.querySelector('.js-weed').style.height = `${queryResponse.data[0].pollen_level_weed * 25}%`;
  document.querySelector('.js-weed').style.animationPlayState = "running";

  airquality = queryResponse.data[0].aqi;
  showResultGauge(airquality);
};

let getCurrentWeatherAPI = (lat, lon) => {
  const url = `https://api.weatherbit.io/v2.0/current?lat=${lat}&lon=${lon}&key=${appid}`;

  fetch(url)
    .then(req => {
      if (!req.ok) {
        console.error('Error with fetch');
      } else {
        return req.json();
      }
    })
    .then(json => {
      showResultLiveboard(json);
    });
};

let getAirQualityAPI = (lat, lon) => {
  const url = `https://api.weatherbit.io/v2.0/current/airquality?lat=${lat}&lon=${lon}&key=${appid}`;

  fetch(url)
    .then(req => {
      if (!req.ok) {
        console.error('Error with fetch');
      } else {
        return req.json();
      }
    })
    .then(json => {
      showResultAirQuality(json);
    });
};

function geoFindMe() {
  // Function that finds your current location
  const status = document.querySelector('#status');

  let options = {
    enableHighAccuracy: true,
    //timeout: 5000,
    maximumAge: 10000
  };

  function success(position) {
    lat = position.coords.latitude;
    lon = position.coords.longitude;

    status.style.display = "none";

    console.log(`Latitude: ${lat}, Longitude: ${lon}`);

    getCurrentWeatherAPI(lat, lon)
  }

  function error() {
    status.textContent = 'Unable to retrieve your location';
  }

  if (!navigator.geolocation) {
    status.textContent = 'Geolocation is not supported by your browser';
  } else {
    status.textContent = 'Locating…';
    navigator.geolocation.getCurrentPosition(success, error, options);
  }
};

document.addEventListener('DOMContentLoaded', function() {
  geoFindMe();
  //setInterval(() => fetchData(lat, lon), 30 * 1000);
});
