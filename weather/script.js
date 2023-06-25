let loc = document.getElementById("location");
let tempicon = document.getElementById("temp-icon");
let tempvalue = document.getElementById("temp-value");
let climate = document.getElementById("climate");
let pressure=document.getElementById("pressure");
let humidity=document.getElementById("humidity");
let iconfile;
let result1 = document.getElementById("result1");
let result2 = document.getElementById("result2");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
document.addEventListener("DOMContentLoaded", () => {
  const usernameElement = document.getElementById("username");

  function fetchUsername(endpoint) {
    fetch(endpoint)
      .then(response => response.json())
      .then(data => {
        if (usernameElement) {
          usernameElement.textContent = data.username;
        }
      })
      .catch(error => {
        console.log('Error:', error);
      });
  }

  fetchUsername('http://localhost:5000/signup');
  fetchUsername('http://localhost:5000/login');
  fetchUsername('http://localhost:5000/auth/protected');
});
 


searchButton.addEventListener("click", (e) => {
  e.preventDefault();
  getWeather(searchInput.value);
  searchInput.value = "";
});

const getWeather = async (city) => {
  try {
    const response = await fetch(`http://localhost:5000/weather?city=${city}`, {
      mode: "cors",
    });

    const weatherData = await response.json();
    console.log(weatherData);
    loc.textContent = weatherData.city;
    climate.textContent = weatherData.climate;
    tempvalue.textContent = Math.round(weatherData.tempvalue-273);
    tempicon.src = weatherData.iconfile;
    humidity.addEventListener("click", function() {
      result1.innerText = weatherData.humidity;
    });
    pressure.addEventListener("click", function() {
      result2.innerText = weatherData.pressure;
    });
    
    
  } catch (error) {
    console.log(error);
    alert("city not found");
  }
};

window.addEventListener("load", () => {
  let long;
  let lat;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      long = position.coords.longitude;
      lat = position.coords.latitude;
      const response = await fetch(
        `http://localhost:5000/latlon?lat=${lat}&lon=${long}`,
        { mode: "cors" }
      );

      const weatherData = await response.json(); 
      console.log(weatherData);
      loc.textContent = weatherData.city;
      climate.textContent = weatherData.climate;
      tempvalue.textContent = Math.round(weatherData.tempvalue-273);
      tempicon.src = weatherData.iconfile;
    
      
      humidity.addEventListener("click", function() {
        result1.innerText = weatherData.humidity;
      });
      pressure.addEventListener("click", function() {
        result2.innerText = weatherData.pressure;
      });
      
    });
  }
});


