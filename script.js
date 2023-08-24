// Make the div invisible
const myDiv = document.querySelector('.weather-data');
myDiv.style.visibility = 'hidden';

const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "7037d726f103832e48d5aed207c06fb9";

const createWeatherCard = (cityName,weatherItem,index) => {
    if (index === 0) {
        // html for main card
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </div>

                <div class="icon">
                    <img src=${"https://openweathermap.org/img/wn/"+weatherItem.weather[0].icon+"@4x.png"} alt="weather-icon">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>`;
    }
    else {
        // html for forecast cards
        return `<li class="card">
                <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                <img src = ${"https://openweathermap.org/img/wn/"+weatherItem.weather[0].icon+"@2x.png"} alt="weather-icon">
                <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                <h4>Humidity: ${weatherItem.main.humidity}%</h4>
            </li>`;
    }
    
}

const getWeatherDetils = (cityName, lat, lon) => {
    const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/forecast/?lat='+lat+'&lon='+lon+'&appid='+API_KEY;
   
    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {

        // filtering forecast data to get 1 forecast per day

        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
           
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });

        console.log(fiveDaysForecast);
        
        // clearing previous weather data
        cityInput.value = "";
        weatherCardsDiv.innerHTML = "";
        currentWeatherDiv.innerHTML = "";

        fiveDaysForecast.forEach((weatherItem,index) => {
            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend",createWeatherCard(cityName,weatherItem,index));
                
            }
            else {
                weatherCardsDiv.insertAdjacentHTML("beforeend",createWeatherCard(cityName,weatherItem,index));
            }
            // Make the div visible again
            myDiv.style.visibility = 'visible';
        });
    }).catch(() => {
        alert("Sorry , An error occured while fetching weather details !");
    });
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return ; 
    const GEO_CODING_API_URL = 'https://api.openweathermap.org/geo/1.0/direct?q='+cityName+'&limit=1&appid='+API_KEY;
    
    // gettin lat lon and name from api
    fetch(GEO_CODING_API_URL).then(res => res.json()).then(data => {
        
        if (!data.length) return alert("Sorry , No coordinates found for "+cityName);
        const {name, lat, lon} = data[0];
        getWeatherDetils(name,lat,lon);
        // Make the div visible again
        myDiv.style.visibility = 'visible';
    }).catch(() => {
        alert("Sorry , An error occured while fetching the coordinates!");
    });
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            console.log(position);
            const {latitude, longitude} = position.coords;
            const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
                console.log(data);
                const {name} = data[0];
                getWeatherDetils(name,latitude,longitude);
                // Make the div visible again
                myDiv.style.visibility = 'visible';
            }).catch(() => {
                alert("Sorry , An error occured while fetching city!");
            });
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to get your location's weather.")
            }
        }
    );
}
searchButton.addEventListener("click",getCityCoordinates);
locationButton.addEventListener("click",getUserCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());