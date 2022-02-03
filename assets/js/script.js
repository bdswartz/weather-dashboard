
var dayOfWeek = [
    "Sun", 
    "Mon", 
    "Tues", 
    "Wed", 
    "Thurs", 
    "Fri", 
    "Sat"
];
var monthOfYear = [
    "January", 
    "February", 
    "March", 
    "April", 
    "May", 
    "June", 
    "July", 
    "August", 
    "September", 
    "October", 
    "November", 
    "December"
];
var cityHistoryObj = [{}];
var apiKey = "d46c028b6162e14973f53abc548772fa";

var uponLoad = function() {
    cityHistoryObj = JSON.parse(localStorage.getItem("cityhistory"));
    updateCityHistory(cityHistoryObj);
    getWeatherData(cityHistoryObj[0]);
}

var displayCurrentWeather = function(weatherData) {
    // Build current weather conditions icon request url
    iconApiUrl = "http://openweathermap.org/img/wn/" + weatherData.current.weather[0].icon + "@2x.png";
    // Create icon, temp 
    document.querySelector(".current-conditions-icon").src = iconApiUrl;
    var date = dateConvert(weatherData.current.dt);
    document.querySelector(".todays-date").textContent = date.Month + " " + date.Date + ", " + date.Year;
    document.querySelector("#currentTemp").textContent = weatherData.current.temp + " F";
    document.querySelector("#currentWind").textContent = weatherData.current.wind_speed + " mph";
    document.querySelector("#currentHumidity").textContent = weatherData.current.humidity + " %";
    uviNum = parseFloat(weatherData.current.uvi);
    document.querySelector("#currentUv").textContent = uviNum;
    if (uviNum < 3.0) {
        document.querySelector("#currentUv").setAttribute("style", "background-color: rgb(0, 252, 0); color: black;");
    }
    else if (uviNum >= 3.0 && uviNum < 6.0) {
        document.querySelector("#currentUv").setAttribute("style", "background-color: rgb(252, 252, 0); color: black;)");
    }
    else if (uviNum >= 6.0 && uviNum < 8.0) {
        document.querySelector("#currentUv").setAttribute("style", "background-color: rgb(252, 126, 0); color: white;)");
    }
    else if (uviNum >= 8.0 && uviNum < 11.0) {
        document.querySelector("#currentUv").setAttribute("style", "background-color: rgb(252, 0, 0); color: white;)");
    }
    else {
        document.querySelector("#currentUv").setAttribute("style", "background-color: rgb(126, 0, 252); color: white;)");
    }

    };
    
var buildForecast = function(data) {
    var forecastCardContainerEl = document.querySelector(".day-card-container")
    forecastCardContainerEl.innerHTML = "";
    for (var index = 1; index<6; index++) {
        iconApiUrl = "http://openweathermap.org/img/wn/" + data.daily[index].weather[0].icon + "@2x.png";
        // Create the elements for the weather card
        var date = dateConvert(data.daily[index].dt);
        // var forecastCardContainerEl = document.querySelector(".day-card-container")
        var forecastCardEl = document.createElement("div");
        forecastCardEl.className = "day-card";
        var forecastDateEl = document.createElement("h4");
        forecastDateEl.textContent = date.Day;
        var forecastIconEl = document.createElement("img");
        forecastIconEl.src = iconApiUrl;
        var forecastTempEl = document.createElement("p");
        forecastTempEl.textContent = "Temp:      " + data.daily[index].temp.max + " F";
        var forecastWindEl = document.createElement("p");
        forecastWindEl.textContent = "Wind:     " + data.daily[index].wind_speed + " mph";
        var forecastHumidityEl = document.createElement("p");
        forecastHumidityEl.textContent = "Humidity:     " + data.daily[index].humidity + " %";
        // append the weather data to the weather card
        forecastCardEl.appendChild(forecastDateEl);
        forecastCardEl.appendChild(forecastIconEl);
        forecastCardEl.appendChild(forecastTempEl);
        forecastCardEl.appendChild(forecastWindEl);
        forecastCardEl.appendChild(forecastHumidityEl);
        // Append daily weather card to the container
        forecastCardContainerEl.appendChild(forecastCardEl);
    }
};

var getCity = function() {
    event.preventDefault();
    var zipCode = document.querySelector("#city-search-input").value;
    apiCityUrl = "http://api.openweathermap.org/geo/1.0/zip?zip=" + zipCode + ",US&appid=" + apiKey;
    fetch(apiCityUrl).then(function(response) {
        // request was successful
        if (response.ok) {
            response.json().then(function(data) {
                // pass response data to display function
                var cityObj = {Name: data.name, Lat: data.lat, Long: data.lon};
                // Display city name in current conditions
                // document.querySelector(".city-display").textContent = cityObj.Name;
                // if the city is already in history, remove it and move it to index 0
                for (var removeIndex = 0; removeIndex < cityHistoryObj.length; removeIndex++) {
                    if (cityObj.Name == cityHistoryObj[removeIndex].Name) {
                        console.log("flag");
                        cityHistoryObj.splice(removeIndex,1);
                    };
                };
                cityHistoryObj.unshift(cityObj);
                cityHistoryObj = cityHistoryObj.slice(0,10);
                localStorage.setItem("cityhistory", JSON.stringify(cityHistoryObj));
                updateCityHistory(cityHistoryObj);
                getWeatherData(cityObj);
            // displayCurrentWeather(data);
            // buildForecast(data);
            // check if api has paginated issues  
            }
            )}
      });
};

var updateCityHistory = function (cityHistoryObj) {
    // find container and create list items for the city history
    var cityListEl = document.querySelector(".city-list");
    cityListEl.innerHTML = "";
    for (index=0 ; index<cityHistoryObj.length ; index++) {
        var cityHistoryItemEl = document.createElement("li")
        cityHistoryItemEl.className = "city-item"
        var cityHistoryBtnEl = document.createElement("button")
        cityHistoryBtnEl.dataset.listPosition = index;
        cityHistoryBtnEl.textContent = cityHistoryObj[index].Name;
        cityHistoryBtnEl.className = "city-button"
        cityHistoryItemEl.appendChild(cityHistoryBtnEl);
        cityListEl.appendChild(cityHistoryItemEl);
    }
};

var dateConvert = function(date) {
    // Convert UNIX time code passed to function to JS date/time
    fullDateConverted = new Date(date * 1000);
    // Extract day/date info from converted date/time
    var day = fullDateConverted.getDay();
    var month = fullDateConverted.getMonth();
    var date = fullDateConverted.getDate();
    var year = fullDateConverted.getFullYear();
    // Pass array with converted (to user-readable) day of week, month, date, and year
    var dayDateObject = {Day: dayOfWeek[day], Month: monthOfYear[month], Date: date, Year: year};
    return dayDateObject;
};

var getWeatherData = function(cityObj) {
    // Build api request url
    document.querySelector(".city-display").textContent = cityObj.Name;
    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + cityObj.Lat + "&lon=" + cityObj.Long + "&exclude=minutely,hourly&appid=" + apiKey + "&units=imperial";
    fetch(apiUrl).then(function(response) {
        // request was successful
        if (response.ok) {
            response.json().then(function(data) {
            // pass response data to display function
            console.log(data);
            displayCurrentWeather(data);
            buildForecast(data);
            // check if api has paginated issues  
            }
            )}
        else {
            // TBD ***************
        }
      });
  };

  document.querySelector(".city-form").addEventListener("submit", getCity);
  document.querySelector(".city-list").addEventListener("click", function(event) {
      targetClickEl = event.target
      index = targetClickEl.dataset.listPosition;
      getWeatherData(cityHistoryObj[index]);
  });
  uponLoad();
