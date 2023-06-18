const express = require("express");
const _ = require("lodash");
const cors = require("cors");
const app = express();
app.use(express.json());

app.use(cors());

app.get("/latlon", async (req, res) => {
  const lat = req.query.lat;
  const lon = req.query.lon;
  const data = await getWeatherLatLon(lat, lon);
  res.json(data);
});
app.get("/weather", async (req, res) => {
  const city = req.query.city;
  const data = await getWeather(city);
  res.json(data);
});

async function getWeatherLatLon(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=9c25d71309f799febed483efc24e0b5a`
    );

    const weatherData = await response.json();
    console.log(weatherData);
    let tempicon;
    let id = weatherData.weather[0].id;
    console.log("id", id);
    if (id >= 200 && id < 300) {
      tempicon = "thunderstorm.png";
    } else if (id >= 300 && id < 400) {
      tempicon = "clouds.png";
    } else if (id >= 500 && id < 600) {
      tempicon = "rains.png";
    } else if (id >= 600 && id < 700) {
      tempicon = "snow.png";
    } else if (id >= 700 && id < 800) {
      tempicon = "clouds.png";
    } else if (id >= 800) {
      tempicon = "clouds.png";
    }
    const data = {
      iconfile: `https://raw.githubusercontent.com/likhithabandaru2003/weather-app-nodejs/main/images/${tempicon}`,
      tempvalue: weatherData.main.feels_like,
      humidity:weatherData.main.humidity,
      pressure:weatherData.main.pressure,
      city: weatherData.name,
      id: weatherData.weather[0].id,
      climate: weatherData.weather[0].description,
    };
    return data;
  } catch (error) {
    console.log(error);
  }
}

async function getWeather(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=9c25d71309f799febed483efc24e0b5a`
    );

    const weatherData = await response.json();

    let tempicon;
    let id = weatherData.weather[0].id;
    console.log("id", id);
    if (id >= 200 && id < 300) {
      tempicon = "thunderstorm.png";
    } else if (id >= 300 && id < 400) {
      tempicon = "clouds.png";
    } else if (id >= 500 && id < 600) {
      tempicon = "rains.png";
    } else if (id >= 600 && id < 700) {
      tempicon = "snow.png";
    } else if (id >= 700 && id < 800) {
      tempicon = "clouds.png";
    } else if (id >= 800) {
      tempicon = "clouds.png";
    }
    const data = {
      iconfile: `https://raw.githubusercontent.com/likhithabandaru2003/weather-app-nodejs/main/images/${tempicon}`,
      tempvalue: weatherData.main.feels_like,
      city: weatherData.name,
      id: weatherData.weather[0].id,
      humidity:weatherData.main.humidity,
      pressure:weatherData.main.pressure,
      climate: weatherData.weather[0].description,
    };
    return data;
  } catch (error) {
    console.log(error);
  }
}

