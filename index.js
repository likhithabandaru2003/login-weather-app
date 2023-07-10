const express = require("express");
const passport = require("passport");
const session = require("express-session");
const path = require("path");
const app = express();
const mime = require("mime-types");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const mysql = require("mysql");
const cookieSession = require('cookie-session');
const nodemailer = require('nodemailer');
require("./auth");
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
const pool = mysql.createPool({
  host: "localhost",
  user: "admin",
  password: "admin",
  database: "login",
});



app.use(express.json());
app.use(express.static(path.join(__dirname, "client")));
app.use(express.static(path.join(__dirname, "weather")));
app.get("/auth/styles.css", function (req, res) {
  const filePath = __dirname + "/weather/styles.css";

  res.setHeader("Content-Type", "text/css");
  res.sendFile(filePath);

});
app.get("/auth/script.js", function (req, res) {
  const filePath = __dirname + "/weather/script.js";

  res.setHeader("Content-Type", "text/javascript");
  res.sendFile(filePath);
});
function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

app.get("/", (res, req) => {
  res.sendFile("./client/index.html");
});



  
app.use(cookieSession({
    name: 'google-auth-session',
    keys: ['key1', 'key2']
}));
app.use(passport.initialize());
app.use(passport.session());
app.get(
 "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/auth/protected",
    failureRedirect: "/auth/google/failure",

  }),
 

);
app.get("/auth/google/failure", (req, res) => {
  res.cookie(`username`,'');
  res.send("Failed to Loggedin");
  
});

app.get("/auth/protected", (req, res) => {
  const username = req.user. given_name;
  console.log(req.user.given_name);
  res.cookie(`username`,username);
  res.sendFile(__dirname + "/weather/index.html",{ username: username });
});

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
      iconfile: `https://raw.githubusercontent.com/likhithabandaru2003/login-weather-app/main/images/${tempicon}`,
      tempvalue: weatherData.main.feels_like,
      humidity: weatherData.main.humidity,
      pressure: weatherData.main.pressure,
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
      iconfile: `https://raw.githubusercontent.com/likhithabandaru2003/login-weather-app/main/images/${tempicon}`,
      tempvalue: weatherData.main.feels_like,
      city: weatherData.name,
      id: weatherData.weather[0].id,
      humidity: weatherData.main.humidity,
      pressure: weatherData.main.pressure,
      climate: weatherData.weather[0].description,
    };
    return data;
  } catch (error) {
    console.log(error);
  }
}
app.use(bodyParser.urlencoded({ extended: false }));
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  pool.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (error, results) => {
      if (error) throw error;

      if (results.length > 0) {
        const storedPassword = results[0].password;
        bcrypt.compare(password, storedPassword, (err, isMatch) => {
          if (err) throw err;

          if (isMatch) {
            const loggedInUsername = results[0].username;
            res.cookie(`username`,loggedInUsername);
            res.sendFile(__dirname + "/weather/index.html");
          } else {
            res.cookie(`username`,'');
            res.send("Incorrect password");
          }
          console.log(results);
        });
      } else {
        res.cookie(`username`,'');
        res.send("User not found");
      }
    }
  );
});
app.post("/signup", (req, res) => {
  const { username, password,email,loc} = req.body;
  console.log(username)
  console.log(email)
  if (password.length > 10) {
    res.send("Password exceeded 10 characters");
    return;
  }

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) throw err;

    pool.query(
      "INSERT INTO users (username, password,email,loc) VALUES (?, ?,?,?)",
      [username, hash, email, loc],
      (error) => {
        if (error) throw error;
        
        res.cookie(`username`,username);
        res.sendFile(__dirname + "/weather/index.html");
      }
    );
  });
  const transporter = nodemailer.createTransport({
   
    service: 'gmail',
    auth: {
      user: 'likhithabandaru200@gmail.com',
      pass: 'vjksqquiliziergq',
    },
  });
  
  const mailOptions = {
    from: 'likhithabandaru200@gmail.com',
    to: email, 
    subject: 'Welcome to the Weather App',
    text: 'You have successfully signed up for the Weather App. Enjoy!',
  };
  
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
 
});

app.listen(5000, () => {
  console.log("listening at port 5000");
});
