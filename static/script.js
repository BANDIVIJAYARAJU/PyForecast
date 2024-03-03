// Default temperature unit
let temperatureUnit = "Celsius";

// Function to toggle between temperature units
function toggleTemperatureUnit() {
    // Get the temperature unit button element
    const temperatureUnitButton = document.getElementById("temperatureUnitButton");

    // Switch to the next temperature unit in the sequence (Celsius -> Fahrenheit -> Kelvin -> Celsius)
    if (temperatureUnit === "Celsius") {
        temperatureUnit = "Fahrenheit";
    } else if (temperatureUnit === "Fahrenheit") {
        temperatureUnit = "Kelvin";
    } else {
        temperatureUnit = "Celsius";
    }

    // Update the button text with the current temperature unit
    temperatureUnitButton.innerText = `${temperatureUnit}`;

    // Reload weather data with the new temperature unit
    getWeather();

    // Update the charts with the new temperature unit
    updateCharts();
}

// Function to update the charts with the new temperature unit
function updateCharts() {
    // Get the temperature unit
    const currentTemperatureUnit = temperatureUnit;

    // Update temperature chart
    if (temperatureChart) {
        temperatureChart.options.scales.yAxes[0].scaleLabel.labelString = `${currentTemperatureUnit}`;
        temperatureChart.update();
    }

    // Update humidity chart
    if (humidityChart) {
        humidityChart.update();
    }

    // Update visibility chart
    if (visibilityChart) {
        visibilityChart.update();
    }
}

// Function to convert temperature based on the selected unit
function temperatureConverter(temp, unit) {
    if (unit === "Fahrenheit") {
        // Convert temperature to Fahrenheit and round to 2 decimal places
        return ((temp * 9) / 5 + 32).toFixed(2);
    } else if (unit === "Kelvin") {
        // Convert temperature to Kelvin and round to 2 decimal places
        return (temp + 273.15).toFixed(2);
    } else {
        // Return temperature as is (Celsius) and round to 2 decimal places
        return temp.toFixed(2);
    }
}

// Function to display weather data on the HTML page
function displayWeather(weatherData) {
    const weatherOutput = document.getElementById("weatherOutput");

    // Clear previous content
    weatherOutput.innerHTML = "";

    if (weatherData.error) {
        // Display an error message if there is an issue with the weather data
        weatherOutput.innerHTML = `<p class="error-message">Error: ${weatherData.error}</p>`;
    } else {
        // Display current weather information and forecast data
        const {
            currentDay,
            currentTemperature,
            currentHumidity,
            currentPressure,
            currentWeatherDesc,
            sunrise,
            sunset,
            windSpeed,
            windDirection,
            visibility,
            temperatureUnit,
            forecastDays,
        } = weatherData;

        // Get the current date and time dynamically
        const currentDateTime = new Date();

        // Get the current time in 24-hour format including seconds
        const hours = currentDateTime.getHours();
        const minutes = currentDateTime.getMinutes();
        const seconds = currentDateTime.getSeconds();
        const currentTime = `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;

        // Display current weather information
        weatherOutput.innerHTML += `
            <p><strong>Current Weather:</strong></p>
            <p>Day: ${currentDay}</p>
            <p>Date: ${currentDateTime.toLocaleDateString()}</p>
            <p>Time: ${currentTime}</p>
            <p>Sunrise: ${sunrise}</p>
            <p>Sunset: ${sunset}</p>
            <p>Temperature: ${temperatureConverter(currentTemperature, temperatureUnit)} ${temperatureUnit}</p>
            <p>Humidity: ${currentHumidity}%</p>
            <p>Pressure: ${currentPressure} hPa</p>
            <p>Wind Speed: ${windSpeed} m/s</p>
            <p>Wind Direction: ${windDirection}</p>
            <p>Visibility: ${visibility} meters</p>
            <p>Weather Report: ${currentWeatherDesc}</p>
        `;

        // Display forecast information
        if (forecastDays && forecastDays.length > 0) {
            weatherOutput.innerHTML += `<p><strong>Weather Forecast:</strong></p>`;

            forecastDays.forEach((day) => {
                // Display forecast information for each day
                weatherOutput.innerHTML += `
                    <p>Day: ${day.day}</p>
                    <p>Date: ${day.date}</p>
                    <p>Time: ${day.time}</p>
                    <!-- <p>Sunrise: ${day.sunrise}</p>
                    <p>Sunset: ${day.sunset}</p> -->
                    <p>Temperature: ${temperatureConverter(day.temperature, temperatureUnit)} ${temperatureUnit}</p>
                    <p>Humidity: ${day.humidity}%</p>
                    <p>Visibility: ${day.visibility} meters</p>
                    <p>Weather Description: ${day.weather_description}</p>
                    <!-- <p>Wind Speed: ${day.wind_speed} m/s</p>
                    <p>Wind Direction: ${day.wind_direction}</p> -->
                    <hr>
                `;
            });
        } else {
            // Display a message if no forecast data is available
            weatherOutput.innerHTML += `<p class="error-message">No forecast data available.</p>`;
        }

        // Display additional visualizations
        displayCharts(forecastDays);
    }
}

// Function to display additional visualizations (charts)
function displayCharts(forecastDays) {
    const weatherOutput = document.getElementById("weatherOutput");
    weatherOutput.innerHTML += `<p><strong>Visualization:</strong></p>`;
    
    // Create a container for charts
    const chartsContainer = document.createElement("div");
    chartsContainer.classList.add("charts-container");
    
    // Create a separate container for each chart
    const temperatureChartContainer = document.createElement("div");
    temperatureChartContainer.classList.add("chart-container");
    const humidityChartContainer = document.createElement("div");
    humidityChartContainer.classList.add("chart-container");
    const windSpeedChartContainer = document.createElement("div");
    windSpeedChartContainer.classList.add("chart-container");
    const visibilityChartContainer = document.createElement("div");
    visibilityChartContainer.classList.add("chart-container");

    // Append each chart container to the main charts container
    chartsContainer.appendChild(temperatureChartContainer);
    chartsContainer.appendChild(humidityChartContainer);
    chartsContainer.appendChild(visibilityChartContainer);

    // Append the charts container to the weatherOutput container
    weatherOutput.appendChild(chartsContainer);

    // Create temperature chart canvas
    const temperatureChartCanvas = document.createElement("canvas");
    temperatureChartCanvas.id = "temperatureChart";
    temperatureChartCanvas.classList.add("chart");
    temperatureChartContainer.appendChild(temperatureChartCanvas);

    // Create humidity chart canvas
    const humidityChartCanvas = document.createElement("canvas");
    humidityChartCanvas.id = "humidityChart";
    humidityChartCanvas.classList.add("chart");
    humidityChartContainer.appendChild(humidityChartCanvas);

    // Create visibility chart canvas
    const visibilityChartCanvas = document.createElement("canvas");
    visibilityChartCanvas.id = "visibilityChart";
    visibilityChartCanvas.classList.add("chart");
    visibilityChartContainer.appendChild(visibilityChartCanvas);

    // Chart data arrays
    const labels = [];
    const temperatureData = [];
    const humidityData = [];
    const visibilityData = [];

    // Populate chart data arrays
    forecastDays.forEach((day) => {
        labels.push(day.date);
        temperatureData.push(day.temperature);
        humidityData.push(day.humidity);
        visibilityData.push(day.visibility);
    });

    // Create temperature chart
    new Chart(temperatureChartCanvas, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Temperature (°C/F/K)",
                data: temperatureData,
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 1,
                pointRadius: 3,
                pointHoverRadius: 5,
                tension: 0.4,
            }],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Temperature (°C/F/K)",
                    },
                },
                x: {
                    title: {
                        display: true,
                        text: "Date",
                    },
                },
            },
        },
    });

    // Create humidity chart
    new Chart(humidityChartCanvas, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Humidity (%)",
                data: humidityData,
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1,
                pointRadius: 3,
                pointHoverRadius: 5,
                tension: 0.4,
            }],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Humidity (%)",
                    },
                },
                x: {
                    title: {
                        display: true,
                        text: "Date",
                    },
                },
            },
        },
    });

    // Create visibility chart
    new Chart(visibilityChartCanvas, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Visibility (m)",
                data: visibilityData,
                backgroundColor: "rgba(255, 206, 86, 0.2)",
                borderColor: "rgba(255, 206, 86, 1)",
                borderWidth: 1,
                pointRadius: 3,
                pointHoverRadius: 5,
                tension: 0.4,
            }],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Visibility (m)",
                    },
                },
                x: {
                    title: {
                        display: true,
                        text: "Date",
                    },
                },
            },
        },
    });
}

// Function to fetch weather data from the server
function getWeather() {
    const cityInput = document.getElementById("cityInput").value;
    const countryInput = document.getElementById("countryInput").value;
    const weatherOutput = document.getElementById("weatherOutput");

    if (navigator.onLine) {
        // Check if the browser is online
        if (!cityInput && !countryInput) {
            // Display a message if the user tries to get weather without specifying the city
            weatherOutput.innerHTML = `<p class="error-message">Error: Please enter a city manually or select a country.</p>`;
            return;
        }

        // Display a loading message while fetching data
        weatherOutput.innerHTML = '<p class="loading-message">Loading...</p>';

        // Construct the URL for fetching weather data based on user inputs
        const url =
            cityInput && countryInput
                ? `/weather?city=${cityInput}&country=${countryInput}&temperatureUnit=${temperatureUnit}`
                : `/weather?temperatureUnit=${temperatureUnit}`;

        // Fetch weather data from the server
        fetch(url, { method: 'GET' })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch data. Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                // Display the fetched weather data
                displayWeather(data);
            })
            .catch((error) => {
                // Display an error message if fetching data fails
                console.error("Error fetching weather data:", error.message);
                weatherOutput.innerHTML = `<p class="error-message">Error: Failed to fetch weather data. Please try again later.</p>`;
            });
    } else {
        // Display an error message if the browser is offline
        weatherOutput.innerHTML = `<p class="error-message">Error: You are offline. Please check your internet connection and try again.</p>`;
    }
}

// Function to get the user's current location and fetch weather data accordingly
function getLocation() {
    const weatherOutput = document.getElementById("weatherOutput");

    if (navigator.onLine) {
        // Check if the browser is online
        if (navigator.geolocation) {
            // Get the user's current location
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;

                    // Display a loading message while fetching data
                    weatherOutput.innerHTML = '<p class="loading-message">Loading...</p>';

                    // Fetch weather data based on the user's location
                    fetch(
                        `/weather?lat=${latitude}&lon=${longitude}&temperatureUnit=${temperatureUnit}`
                    )
                        .then((response) => {
                            if (!response.ok) {
                                throw new Error(
                                    `Failed to fetch data. Status: ${response.status}`
                                );
                            }
                            return response.json();
                        })
                        .then((data) => {
                            // Display the fetched weather data
                            displayWeather(data);
                        })
                        .catch((error) => {
                            // Display an error message if fetching data fails
                            console.error("Error fetching weather data:", error.message);
                            weatherOutput.innerHTML = `<p class="error-message">Error: Failed to fetch weather data. Please try again later.</p>`;
                        });
                },
                (error) => {
                    // Display an error message if getting the location fails
                    console.error("Error getting location:", error);
                    weatherOutput.innerHTML = `<p class="error-message">Error: Failed to get location. Please try again or enter a city manually.</p>`;
                }
            );
        } else {
            // Display a message if geolocation is not supported by the browser
            alert("Geolocation is not supported by your browser.");
        }
    } else {
        // Display an error message if the browser is offline
        weatherOutput.innerHTML = `<p class="error-message">Error: You are offline. Please check your internet connection and try again.</p>`;
    }
}

// Function to handle key press events in input fields
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        // Prevent the default form submission behavior
        event.preventDefault();

        // Trigger the getWeather function
        getWeather();
    }
}

// Add event listeners to the city and country input fields
const cityInput = document.getElementById("cityInput");
const countryInput = document.getElementById("countryInput");

if (cityInput) {
    cityInput.addEventListener("keypress", handleKeyPress);
}

if (countryInput) {
    countryInput.addEventListener("keypress", handleKeyPress);
}

// Add event listener to the "Get Weather" button
const getWeatherButton = document.getElementById("getWeatherButton");
if (getWeatherButton) {
    getWeatherButton.addEventListener("click", getWeather);
}

// JavaScript code to trigger the slide-down animation
document.addEventListener("DOMContentLoaded", function () {
    const container = document.querySelector(".container");

    // Create an observer instance
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Add the 'animate' class when the container comes into view
                container.classList.add("animate");
                observer.unobserve(entry.target);
            }
        });
    });

    // Start observing the container
    observer.observe(container);
});
