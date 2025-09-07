// API key for OpenWeatherMap (replace with your own API key)
const API_KEY = "your_api_key_here";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// DOM elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const weatherCard = document.getElementById('weather-card');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');
const cityName = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('weather-description');
const weatherIcon = document.getElementById('weather-icon');
const windSpeed = document.getElementById('wind-speed');
const humidity = document.getElementById('humidity');
const pressure = document.getElementById('pressure');
const recentList = document.getElementById('recent-list');

// Recent searches array
let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];

// Initialize the app
function init() {
    displayRecentSearches();
    
    // Load weather for default city (London) on startup
    getWeatherByCity('London');
    
    // Event listeners
    searchBtn.addEventListener('click', handleSearch);
    locationBtn.addEventListener('click', handleLocation);
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
}

// Handle city search
function handleSearch() {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherByCity(city);
    }
}

// Handle location access
function handleLocation() {
    if (navigator.geolocation) {
        loading.style.display = 'block';
        weatherCard.style.display = 'none';
        errorMessage.style.display = 'none';
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherByCoords(latitude, longitude);
            },
            (error) => {
                loading.style.display = 'none';
                errorMessage.textContent = 'Location access denied. Please search for a city instead.';
                errorMessage.style.display = 'block';
            }
        );
    } else {
        errorMessage.textContent = 'Geolocation is not supported by your browser.';
        errorMessage.style.display = 'block';
    }
}

// Get weather by city name
function getWeatherByCity(city) {
    loading.style.display = 'block';
    weatherCard.style.display = 'none';
    errorMessage.style.display = 'none';
    
    const url = `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            displayWeather(data);
            addToRecentSearches(city);
        })
        .catch(error => {
            loading.style.display = 'none';
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        });
}

// Get weather by coordinates
function getWeatherByCoords(lat, lon) {
    const url = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Weather data not available');
            }
            return response.json();
        })
        .then(data => {
            displayWeather(data);
            addToRecentSearches(data.name);
        })
        .catch(error => {
            loading.style.display = 'none';
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        });
}

// Display weather data
function displayWeather(data) {
    const { name, main, weather, wind } = data;
    
    cityName.textContent = name;
    temperature.textContent = `${Math.round(main.temp)}°C`;
    weatherDescription.textContent = weather[0].description;
    windSpeed.textContent = `${wind.speed} km/h`;
    humidity.textContent = `${main.humidity}%`;
    pressure.textContent = `${main.pressure} hPa`;
    
    // Set weather icon based on condition
    setWeatherIcon(weather[0].icon);
    
    loading.style.display = 'none';
    weatherCard.style.display = 'block';
    errorMessage.style.display = 'none';
}

// Set weather icon based on condition code
function setWeatherIcon(iconCode) {
    let iconClass = 'fas fa-';
    
    switch(iconCode) {
        case '01d':
            iconClass += 'sun';
            break;
        case '01n':
            iconClass += 'moon';
            break;
        case '02d':
        case '02n':
        case '03d':
        case '03n':
        case '04d':
        case '04n':
            iconClass += 'cloud';
            break;
        case '09d':
        case '09n':
        case '10d':
        case '10n':
            iconClass += 'cloud-rain';
            break;
        case '11d':
        case '11n':
            iconClass += 'bolt';
            break;
        case '13d':
        case '13n':
            iconClass += 'snowflake';
            break;
        case '50d':
        case '50n':
            iconClass += 'smog';
            break;
        default:
            iconClass += 'cloud';
    }
    
    weatherIcon.innerHTML = `<i class="${iconClass}"></i>`;
}

// Add city to recent searches
function addToRecentSearches(city) {
    // Remove if already exists
    recentSearches = recentSearches.filter(item => item !== city);
    
    // Add to beginning of array
    recentSearches.unshift(city);
    
    // Keep only 5 most recent
    if (recentSearches.length > 5) {
        recentSearches.pop();
    }
    
    // Save to localStorage
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    
    // Update UI
    displayRecentSearches();
}

// Display recent searches
function displayRecentSearches() {
    recentList.innerHTML = '';
    
    if (recentSearches.length === 0) {
        recentList.innerHTML = '<p>No recent searches</p>';
        return;
    }
    
    recentSearches.forEach(city => {
        const cityElement = document.createElement('div');
        cityElement.className = 'recent-city';
        cityElement.textContent = city;
        cityElement.addEventListener('click', () => {
            cityInput.value = city;
            getWeatherByCity(city);
        });
        recentList.appendChild(cityElement);
    });
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);