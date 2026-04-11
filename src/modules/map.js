// ============================================
// VILLAGE CONNECT - MAIN APPLICATION
// WDD330 Final Project - Laston James Sichali
// ============================================

console.log('🌍 Village Connect - Initializing...');

// ===== GLOBAL VARIABLES =====
let map;
let userLocation = {
    lat: -13.9626,  // Lilongwe, Malawi (default)
    lon: 33.7741,
    found: false
};

// ===== INITIALIZE APP WHEN DOM IS READY =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM Loaded - Starting Village Connect');
    
    initMap();
    setupEventListeners();
    getWeatherData(userLocation.lat, userLocation.lon);
    getUserLocation();
});

// ===== MAP INITIALIZATION =====
function initMap() {
    console.log('🗺️ Initializing map...');
    
    // Create map centered on Malawi
    map = L.map('map').setView([userLocation.lat, userLocation.lon], 7);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
    }).addTo(map);
    
    // Add Malawi marker
    L.marker([userLocation.lat, userLocation.lon])
        .addTo(map)
        .bindPopup('🇲🇼 Malawi - Default Location')
        .openPopup();
    
    console.log('✅ Map initialized');
}

// ===== GET USER LOCATION =====
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation.lat = position.coords.latitude;
                userLocation.lon = position.coords.longitude;
                userLocation.found = true;
                
                // Update UI
                document.getElementById('current-location-text').innerHTML = 
                    `📍 Lat: ${userLocation.lat.toFixed(4)}, Lon: ${userLocation.lon.toFixed(4)}`;
                
                // Update map
                map.setView([userLocation.lat, userLocation.lon], 13);
                L.marker([userLocation.lat, userLocation.lon])
                    .addTo(map)
                    .bindPopup('📍 You are here')
                    .openPopup();
                
                // Get weather for user location
                getWeatherData(userLocation.lat, userLocation.lon);
                
                console.log('✅ User location found');
            },
            (error) => {
                console.warn('⚠️ Geolocation error:', error.message);
                document.getElementById('current-location-text').innerHTML = 
                    '📍 Using default location (Lilongwe, Malawi)';
            }
        );
    } else {
        console.warn('⚠️ Geolocation not supported');
        document.getElementById('current-location-text').innerHTML = 
            '📍 Using default location (Lilongwe, Malawi)';
    }
}

// ===== WEATHER API CALL =====
async function getWeatherData(lat, lon) {
    console.log('🌦️ Fetching weather data...');
    
    const weatherDiv = document.getElementById('weather-data');
    weatherDiv.innerHTML = '<p class="loading">Loading weather data...</p>';
    
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation_probability,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Africa/Maputo`
        );
        
        if (!response.ok) throw new Error('Weather fetch failed');
        
        const data = await response.json();
        displayWeatherData(data);
        
        console.log('✅ Weather data loaded');
    } catch (error) {
        console.error('❌ Weather error:', error);
        weatherDiv.innerHTML = '<p class="error">Unable to load weather data</p>';
    }
}

// ===== DISPLAY WEATHER DATA =====
function displayWeatherData(data) {
    const current = data.current;
    const daily = data.daily;
    
    const weatherHTML = `
        <div class="weather-item">
            <div class="weather-label">Temperature</div>
            <div class="weather-value">${current.temperature_2m}°C</div>
        </div>
        <div class="weather-item">
            <div class="weather-label">Rain Chance</div>
            <div class="weather-value">${current.precipitation_probability}%</div>
        </div>
        <div class="weather-item">
            <div class="weather-label">Today's High</div>
            <div class="weather-value">${daily.temperature_2m_max[0]}°C</div>
        </div>
        <div class="weather-item">
            <div class="weather-label">Today's Low</div>
            <div class="weather-value">${daily.temperature_2m_min[0]}°C</div>
        </div>
        <div class="weather-item">
            <div class="weather-label">Wind Speed</div>
            <div class="weather-value">${current.wind_speed_10m} km/h</div>
        </div>
        <div class="weather-item">
            <div class="weather-label">Max Rain Today</div>
            <div class="weather-value">${daily.precipitation_probability_max[0]}%</div>
        </div>
    `;
    
    document.getElementById('weather-data').innerHTML = weatherHTML;
}

// ===== SETUP EVENT LISTENERS =====
function setupEventListeners() {
    console.log('🎯 Setting up event listeners...');
    
    // Quick action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = btn.dataset.type;
            handleQuickAction(type);
        });
    });
    
    // Language toggle
    document.getElementById('lang-toggle').addEventListener('click', toggleLanguage);
    
    // Manual location button
    document.getElementById('manual-location-btn').addEventListener('click', () => {
        alert('📍 Manual village selection coming in Week 6!');
    });
    
    // Close detail card
    document.getElementById('close-detail').addEventListener('click', () => {
        document.getElementById('resource-detail').classList.add('hidden');
    });
    
    // Report issue button
    document.getElementById('report-issue-btn').addEventListener('click', () => {
        alert('📝 Reporting feature coming in Week 7!');
    });
    
    console.log('✅ Event listeners ready');
}

// ===== HANDLE QUICK ACTIONS =====
function handleQuickAction(type) {
    console.log(`🔍 Quick action: ${type}`);
    
    const card = document.getElementById('resource-detail');
    const title = document.getElementById('detail-name');
    const status = document.getElementById('detail-status');
    const distance = document.getElementById('detail-distance');
    
    // Mock data for Week 5
    const resourceData = {
        clinic: {
            name: 'Lilongwe District Hospital',
            status: '✅ Open 8:00 - 17:00',
            distance: '2.3 km away'
        },
        water: {
            name: 'Area 23 Borehole',
            status: '💧 Functional',
            distance: '0.8 km away'
        },
        market: {
            name: 'Lilongwe Main Market',
            status: '🛒 Open today',
            distance: '3.1 km away'
        },
        farming: {
            name: 'Agricultural Extension Office',
            status: '🌾 Open Mon-Fri',
            distance: '4.2 km away'
        }
    };
    
    const data = resourceData[type];
    
    if (data) {
        title.textContent = data.name;
        status.textContent = data.status;
        distance.textContent = data.distance;
        card.classList.remove('hidden');
    }
    
    // Add markers to map (mock for Week 5)
    addMockMarkers(type);
}

// ===== ADD MOCK MARKERS TO MAP =====
function addMockMarkers(type) {
    // Clear existing markers (except user location)
    map.eachLayer(layer => {
        if (layer instanceof L.Marker && layer.getPopup().getContent() !== '📍 You are here') {
            map.removeLayer(layer);
        }
    });
    
    const mockLocations = {
        clinic: [
            { lat: -13.9536, lon: 33.7881, name: 'Lilongwe District Hospital' },
            { lat: -13.9711, lon: 33.7961, name: 'Area 18 Clinic' }
        ],
        water: [
            { lat: -13.9636, lon: 33.7681, name: 'Area 23 Borehole' },
            { lat: -13.9811, lon: 33.7561, name: 'Community Well' }
        ],
        market: [
            { lat: -13.9833, lon: 33.7833, name: 'Lilongwe Main Market' },
            { lat: -13.9511, lon: 33.7911, name: 'Area 25 Market' }
        ],
        farming: [
            { lat: -13.9436, lon: 33.7581, name: 'Extension Office' }
        ]
    };
    
    const locations = mockLocations[type] || [];
    
    locations.forEach(loc => {
        L.marker([loc.lat, loc.lon])
            .addTo(map)
            .bindPopup(`<b>${loc.name}</b><br>Type: ${type}`);
    });
    
    // Zoom to show markers
    if (locations.length > 0) {
        const bounds = locations.map(loc => [loc.lat, loc.lon]);
        map.fitBounds(bounds.concat([[userLocation.lat, userLocation.lon]]));
    }
}

// ===== LANGUAGE TOGGLE (Mock for Week 5) =====
let currentLanguage = 'en';

function toggleLanguage() {
    const translations = {
        en: {
            title: '🌍 Village Connect',
            health: 'Health',
            water: 'Water',
            markets: 'Markets',
            farming: 'Farming',
            weather: '🌦️ Farming Weather',
            location: 'Change Village',
            sms: '📱 No smartphone? Text "HELP" to 12345 for info.'
        },
        ny: {
            title: '🌍 Kulumikiza Midzi',
            health: 'Za Umoyo',
            water: 'Madzi',
            markets: 'Msika',
            farming: 'Ulimi',
            weather: '🌦️ Nyengo Ya Ulimi',
            location: 'Sintha Mudzi',
            sms: '📱 Mulibe foni yamakono? Tumizani "HELP" ku 12345.'
        }
    };
    
    currentLanguage = currentLanguage === 'en' ? 'ny' : 'en';
    const lang = translations[currentLanguage];
    
    document.getElementById('app-title').textContent = lang.title;
    document.querySelector('[data-type="clinic"] .label').textContent = lang.health;
    document.querySelector('[data-type="water"] .label').textContent = lang.water;
    document.querySelector('[data-type="market"] .label').textContent = lang.markets;
    document.querySelector('[data-type="farming"] .label').textContent = lang.farming;
    document.getElementById('weather-title').textContent = lang.weather;
    document.getElementById('manual-location-btn').textContent = lang.location;
    document.getElementById('sms-fallback').textContent = lang.sms;
    document.getElementById('lang-toggle').textContent = currentLanguage === 'en' ? 'Chichewa' : 'English';
    
    console.log(`🌐 Language switched to: ${currentLanguage}`);
}

// ===== SERVICE WORKER REGISTRATION (PWA) =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('✅ Service Worker registered:', registration.scope);
            })
            .catch(error => {
                console.log('❌ Service Worker registration failed:', error);
            });
    });
}

console.log('✅ Village Connect - Ready!');