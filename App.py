# Import necessary modules from Flask and other libraries
from flask import Flask, request, jsonify, render_template
import requests
from datetime import datetime, timezone
import os
import webbrowser

# Create a Flask web application instance and enable Cross-Origin Resource Sharing (CORS)
app = Flask(__name__, static_folder='static')

# Get the OpenWeatherMap API key from the environment variable or use a default key
OPENWEATHERMAP_API_KEY = os.environ.get("OPENWEATHERMAP_API_KEY", "b5c51e686a7c8421068bba3c61d31f46")

# Utility function to convert temperature from Kelvin to Celsius
def kelvin_to_celsius(kelvin):
    return round(kelvin - 273.15, 2)

# Utility function to convert temperature from Kelvin to Fahrenheit
def kelvin_to_fahrenheit(kelvin):
    return round((kelvin - 273.15) * 9/5 + 32, 2)

# Function to get cardinal direction based on degrees
def get_cardinal_direction(degrees):
    directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    index = round(degrees / 45) % 8
    return directions[index]

# Function to get current weather data from the OpenWeatherMap API
def get_current_weather(city_name, country_code, lat, lon, temperature_unit):
    current_url = f"http://api.openweathermap.org/data/2.5/weather?q={city_name},{country_code}&lat={lat}&lon={lon}&appid={OPENWEATHERMAP_API_KEY}"
    current_response = requests.get(current_url)
    current_data = current_response.json()

    # Check if the API response is successful
    if current_data.get("cod") == 200:
        # Extract relevant data from the API response
        main_current = current_data["main"]
        temperature_current = main_current["temp"]
        if temperature_unit == "Celsius":
            temperature_current = kelvin_to_celsius(temperature_current)
        elif temperature_unit == "Fahrenheit":
            temperature_current = kelvin_to_fahrenheit(temperature_current)
        humidity_current = main_current["humidity"]
        pressure_current = main_current["pressure"]
        weather_report_current = current_data["weather"]
        weather_desc_current = weather_report_current[0]["description"]
        current_date_time = datetime.now()
        current_day = current_date_time.strftime("%A")
        current_date = current_date_time.strftime("%d-%m-%Y")
        current_time = current_date_time.strftime("%H:%M:%S")
        sys_info_current = current_data.get("sys", {})
        sunrise_current = datetime.fromtimestamp(sys_info_current.get("sunrise", 0)).strftime("%H:%M:%S")
        sunset_current = datetime.fromtimestamp(sys_info_current.get("sunset", 0)).strftime("%H:%M:%S")
        wind_info_current = current_data.get("wind", {})
        wind_speed_current = wind_info_current.get("speed", 0)
        wind_direction_current = wind_info_current.get("deg", 0)
        wind_direction_current_cardinal = get_cardinal_direction(wind_direction_current)
        visibility_current = current_data.get("visibility", 0)

        # Create a dictionary with current weather data
        current_weather_data = {
            "searchedCity": city_name,
            "searchedCountry": country_code,
            "searchedLat": lat,
            "searchedLon": lon,
            "currentDay": current_day,
            "currentDate": current_date,
            "currentTime": current_time,
            "sunrise": sunrise_current,
            "sunset": sunset_current,
            "windSpeed": wind_speed_current,
            "windDirection": wind_direction_current_cardinal,
            "visibility": visibility_current,
            "currentTemperature": temperature_current,
            "temperatureUnit": temperature_unit,
            "currentHumidity": humidity_current,
            "currentPressure": pressure_current,
            "currentWeatherDesc": weather_desc_current
        }

        return current_weather_data

    # If the city is not found, return an error message
    return {"error": "City Not Found"}

# Function to get forecast data from the OpenWeatherMap API
def get_forecast(city_name, country_code, lat, lon, temperature_unit):
    forecast_url = f"http://api.openweathermap.org/data/2.5/forecast?q={city_name},{country_code}&lat={lat}&lon={lon}&appid={OPENWEATHERMAP_API_KEY}"
    forecast_response = requests.get(forecast_url)
    forecast_data = forecast_response.json()

    # Check if the API response is successful
    if forecast_data.get("cod") == "200":
        forecast_days = []
        forecast_list = forecast_data.get("list", [])

        # Check if forecast data is available
        if not forecast_list:
            return {"error": "No forecast data available."}

        # Process each forecast item and extract relevant data
        for item in forecast_list:
            forecast_date = datetime.strptime(item["dt_txt"], "%Y-%m-%d %H:%M:%S")

            # Check if the forecast date is in the future
            if forecast_date >= datetime.now():
                forecast_day = forecast_date.strftime("%A")
                forecast_date_str = forecast_date.strftime("%d-%m-%Y")
                forecast_time = forecast_date.strftime("%H:%M:%S")
                sys_info_forecast = item.get("sys", {})
                sunrise_forecast = datetime.fromtimestamp(sys_info_forecast.get("sunrise", 0), tz=timezone.utc).strftime("%H:%M:%S")
                sunset_forecast = datetime.fromtimestamp(sys_info_forecast.get("sunset", 0), tz=timezone.utc).strftime("%H:%M:%S")
                wind_info_forecast = item.get("wind", {})
                wind_speed_forecast = wind_info_forecast.get("speed", 0)
                wind_direction_forecast = wind_info_forecast.get("deg", 0)
                wind_direction_forecast_cardinal = get_cardinal_direction(wind_direction_forecast)
                visibility_forecast = item.get("visibility", 0)
                main_info = item["main"]
                temperature_forecast = main_info["temp"]
                if temperature_unit == "Celsius":
                    temperature_forecast = kelvin_to_celsius(temperature_forecast)
                elif temperature_unit == "Fahrenheit":
                    temperature_forecast = kelvin_to_fahrenheit(temperature_forecast)
                humidity_forecast = main_info["humidity"]
                weather_info = item["weather"]
                weather_description_forecast = weather_info[0]["description"]

                # Create a dictionary with forecast data for each day
                forecast_days.append({
                    "searchedCity": city_name,
                    "searchedCountry": country_code,
                    "searchedLat": lat,
                    "searchedLon": lon,
                    "day": forecast_day,
                    "date": forecast_date_str,
                    "time": forecast_time,
                    "sunrise": sunrise_forecast,
                    "sunset": sunset_forecast,
                    "windSpeed": wind_speed_forecast,
                    "windDirection": wind_direction_forecast_cardinal,
                    "visibility": visibility_forecast,
                    "temperature": temperature_forecast,
                    "temperatureUnit": temperature_unit,
                    "humidity": humidity_forecast,
                    "weather_description": weather_description_forecast
                })

        return {"forecastDays": forecast_days}

    # If there is an error in the forecast data, return an error message
    return {"error": forecast_data.get('message', 'Unknown error')}

# Define a route to retrieve weather data
@app.route('/weather', methods=['GET'])
def get_weather():
    # Get parameters from the request URL
    city_name = request.args.get('city')
    country_code = request.args.get('country')
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    temperature_unit = request.args.get('temperatureUnit', 'Celsius')

    # Check if either city and country or latitude and longitude are provided
    if not (city_name and country_code) and not (lat and lon):
        return jsonify({"error": "Please provide either city and country or latitude and longitude."})

    # Get current weather and forecast data
    current_weather = get_current_weather(city_name, country_code, lat, lon, temperature_unit)
    forecast_data = get_forecast(city_name, country_code, lat, lon, temperature_unit)

    # Check if there is an error in the current weather data
    if "error" in current_weather:
        return jsonify(current_weather)

    # Combine current weather and forecast data into a single response
    response_data = {**current_weather, **forecast_data}
    return jsonify(response_data)

# Define a route to render the index.html template
@app.route('/')
def index():
    return render_template('index.html')

# Run the application if this script is executed
if __name__ == '__main__':
    # Open the web browser when the application starts
    if os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
        webbrowser.open('http://127.0.0.1:5000')
    
    # Run the Flask application in debug mode
    app.run(debug=True)
