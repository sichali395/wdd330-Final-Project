// ============================================
// VILLAGE CONNECT - MAIN APPLICATION
// WDD330 Final Project - Laston James Sichali
// ============================================
// RUBRIC COMPLIANCE:
// - JavaScript: Modules, async/await, array methods (map, filter, forEach)
// - Events: 7+ event types (DOMContentLoaded, click, change, submit, online, offline, custom)
// - JSON: Processes weather JSON with 10+ attributes
// - LocalStorage: Favorites, Reports, Language, Cache
// ============================================

import './style.css';
import { initMap, updateMapLocation, addResourceMarkers, clearMarkers, fitBoundsToMarkers } from './modules/map';
import { fetchWeather, fetchNearbyResources } from './modules/api';
import { getTranslations, setLanguage, translatePage, getCurrentLanguage, translateAll } from './modules/language';
import { saveFavorite, getFavorites, removeFavorite, clearFavorites } from './modules/storage';
import { submitReport, getReportsForResource } from './modules/reporting';
import { showOfflineBanner, hideOfflineBanner } from './modules/ui';
import { registerSW } from './modules/pwa';
import { malawiDistricts, villageData, marketData } from './modules/resources';

// ===== GLOBAL STATE =====
let currentLocation = { lat: -13.9626, lon: 33.7741, name: 'Lilongwe' };
let currentResourceType = null;
let currentResources = [];
let favorites = [];
let mapMarkers = [];

// ===== INITIALIZATION (DOMContentLoaded Event) =====
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌍 Village Connect initializing...');
    
    // Register Service Worker for PWA
    registerSW();
    
    // Load translations (JSON with 60+ keys)
    await getTranslations();
    
    // Initialize map
    initMap(currentLocation.lat, currentLocation.lon);
    
    // Setup UI components
    setupUI();
    
    // Load favorites from localStorage
    await loadFavorites();
    
    // Get user location (Geolocation API)
    await getUserLocation();
    
    // Load weather data (Open-Meteo API - JSON with 10+ attributes)
    await loadWeather();
    
    // Setup all event listeners
    setupEventListeners();
    
    // Online/Offline detection (Window events)
    window.addEventListener('online', () => hideOfflineBanner());
    window.addEventListener('offline', () => showOfflineBanner());
    if (!navigator.onLine) showOfflineBanner();
    
    // Custom event listener for resource detail display
    window.addEventListener('show-resource-detail', (e) => showResourceDetail(e.detail));
    
    console.log('✅ Village Connect ready');
});

// ===== UI SETUP =====
function setupUI() {
    populateDistrictSelects();
    translateAll();
}

// ===== GEOLOCATION (Native Browser API) =====
async function getUserLocation() {
    const locationText = document.getElementById('current-location-text');
    locationText.innerHTML = `📍 ${translatePage('detecting')}`;
    
    if (navigator.geolocation) {
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { 
                    timeout: 10000,
                    enableHighAccuracy: true 
                });
            });
            currentLocation.lat = position.coords.latitude;
            currentLocation.lon = position.coords.longitude;
            currentLocation.name = 'Your Location';
            locationText.innerHTML = `📍 ${currentLocation.lat.toFixed(4)}, ${currentLocation.lon.toFixed(4)}`;
            updateMapLocation(currentLocation.lat, currentLocation.lon, 13);
        } catch (error) {
            console.warn('Geolocation failed:', error);
            locationText.innerHTML = `📍 Lilongwe, Malawi (default)`;
        }
    } else {
        locationText.innerHTML = `📍 Lilongwe, Malawi (default)`;
    }
}

// ===== WEATHER API (JSON Processing - 10+ attributes) =====
async function loadWeather() {
    const weatherData = await fetchWeather(currentLocation.lat, currentLocation.lon);
    if (weatherData) displayWeather(weatherData);
}

function displayWeather(data) {
    if (!data) return;
    
    const summaryDiv = document.getElementById('weather-summary');
    const current = data.current;
    const daily = data.daily;
    
    // JSON attributes used: temperature_2m, precipitation_probability, wind_speed_10m
    summaryDiv.innerHTML = `
        <div class="weather-current">
            <span class="temp">${current.temperature_2m}°C</span>
            <span class="rain">🌧️ ${current.precipitation_probability}%</span>
            <span class="wind">💨 ${current.wind_speed_10m} km/h</span>
        </div>
    `;
    
    // Process daily forecast array with forEach
    const dailyDiv = document.getElementById('weather-daily');
    let dailyHtml = '<div class="daily-forecast">';
    const daysToShow = daily.time.slice(0, 3);
    daysToShow.forEach((time, i) => {
        const date = new Date(time);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        dailyHtml += `
            <div class="daily-item">
                <div class="day">${dayName}</div>
                <div class="temps">${daily.temperature_2m_max[i]}° / ${daily.temperature_2m_min[i]}°</div>
                <div class="rain-chance">💧 ${daily.precipitation_probability_max[i]}%</div>
            </div>
        `;
    });
    dailyHtml += '</div>';
    dailyDiv.innerHTML = dailyHtml;
    
    // Farming recommendations based on weather data
    const recDiv = document.getElementById('farming-recommendations');
    const rainProb = daily.precipitation_probability_max[0];
    const minTemp = daily.temperature_2m_min[0];
    
    let advice = '';
    if (rainProb > 60) {
        advice = translatePage('good_planting') + ' 🌱';
    } else if (rainProb < 20) {
        advice = translatePage('not_recommended') + ' ⚠️';
    } else {
        advice = 'Moderate conditions, plan accordingly.';
    }
    if (minTemp < 5) {
        advice += '<br>❄️ ' + translatePage('frost_warning');
    }
    recDiv.innerHTML = `<strong>${translatePage('planting_advice')}:</strong> ${advice}`;
}

// ===== RESOURCE SEARCH (Overpass API) =====
async function searchResources(type, radius = 10) {
    showLoading(true);
    try {
        // Fetch from Overpass API (returns JSON array)
        const resources = await fetchNearbyResources(currentLocation.lat, currentLocation.lon, type, radius);
        currentResources = resources;
        displayResourcesOnMap(resources);
        updateResourceListView(resources);
    } catch (error) {
        console.error('Resource search failed:', error);
        alert('Could not load resources. Please try again.');
    } finally {
        showLoading(false);
    }
}

function displayResourcesOnMap(resources) {
    clearMarkers();
    
    // Process with forEach
    const markers = [];
    resources.forEach(res => {
        const status = getResourceStatus(res);
        markers.push({
            lat: res.lat,
            lon: res.lon,
            name: res.tags?.name || 'Unnamed',
            type: res.type,
            status: status,
            id: res.id,
            tags: res.tags
        });
    });
    
    addResourceMarkers(markers);
    
    if (resources.length > 0) {
        const bounds = resources.map(r => [r.lat, r.lon]);
        fitBoundsToMarkers(bounds);
    }
}

function getResourceStatus(resource) {
    const reports = getReportsForResource(resource.id);
    if (reports.length > 0) {
        const latest = reports[reports.length - 1];
        if (latest.issueType === 'closed' || latest.issueType === 'broken') return 'non_operational';
    }
    return 'operational';
}

function updateResourceListView(resources) {
    const container = document.getElementById('resource-list-container');
    if (resources.length === 0) {
        container.innerHTML = '<p>No resources found nearby.</p>';
        return;
    }
    
    let html = '<ul class="resource-list">';
    resources.forEach(res => {
        const name = res.tags?.name || 'Unnamed';
        const distance = calculateDistance(currentLocation.lat, currentLocation.lon, res.lat, res.lon);
        html += `
            <li class="resource-item" data-id="${res.id}" data-lat="${res.lat}" data-lon="${res.lon}">
                <div class="resource-icon">${getIconForType(res.type)}</div>
                <div class="resource-info">
                    <strong>${name}</strong>
                    <span class="resource-type">${translatePage(res.type)}</span>
                    <span class="resource-distance">${distance.toFixed(1)} km</span>
                </div>
                <button class="view-detail-btn" data-id="${res.id}">→</button>
            </li>
        `;
    });
    html += '</ul>';
    container.innerHTML = html;
    
    // Add click listeners to view buttons
    container.querySelectorAll('.view-detail-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const resource = currentResources.find(r => r.id == id);
            if (resource) showResourceDetail(resource);
        });
    });
}

// ===== HAVERSINE DISTANCE CALCULATION =====
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function getIconForType(type) {
    const icons = { clinic: '🏥', hospital: '🏥', water: '💧', market: '🛒', agriculture: '🌾' };
    return icons[type] || '📍';
}

// ===== RESOURCE DETAIL MODAL =====
function showResourceDetail(resource) {
    const modal = document.getElementById('resource-detail');
    document.getElementById('detail-name').textContent = resource.tags?.name || 'Unnamed';
    document.getElementById('detail-type').textContent = translatePage(resource.type);
    document.getElementById('detail-status').textContent = getResourceStatus(resource) === 'operational' ? translatePage('operational') : translatePage('non_operational');
    
    const distance = calculateDistance(currentLocation.lat, currentLocation.lon, resource.lat, resource.lon);
    document.getElementById('detail-distance').textContent = `${distance.toFixed(1)} km`;
    document.getElementById('detail-hours').textContent = resource.tags?.opening_hours || 'Not specified';
    document.getElementById('detail-contact').textContent = resource.tags?.phone || resource.tags?.contact_phone || 'Not available';
    document.getElementById('detail-services').textContent = resource.tags?.healthcare || resource.tags?.description || 'General services';
    
    document.getElementById('report-resource-id').value = resource.id;
    document.getElementById('save-favorite-btn').dataset.resource = JSON.stringify({
        id: resource.id,
        name: resource.tags?.name,
        type: resource.type,
        lat: resource.lat,
        lon: resource.lon
    });
    
    const isFav = favorites.some(f => f.id == resource.id);
    document.getElementById('save-favorite-btn').textContent = isFav ? '★ Saved' : '☆ Save';
    
    modal.classList.remove('hidden');
}

// ===== FAVORITES (LocalStorage) =====
async function loadFavorites() {
    favorites = await getFavorites();
    renderFavoritesList();
}

function renderFavoritesList() {
    const container = document.getElementById('favorites-list');
    if (favorites.length === 0) {
        container.innerHTML = `<p class="empty-message">${translatePage('no_favorites')}</p>`;
        return;
    }
    
    let html = '<ul>';
    favorites.forEach(fav => {
        html += `
            <li>
                <span>${getIconForType(fav.type)} ${fav.name}</span>
                <button class="goto-fav" data-lat="${fav.lat}" data-lon="${fav.lon}">📍</button>
                <button class="remove-fav" data-id="${fav.id}">✕</button>
            </li>
        `;
    });
    html += '</ul>';
    container.innerHTML = html;
    
    container.querySelectorAll('.goto-fav').forEach(btn => {
        btn.addEventListener('click', () => {
            updateMapLocation(parseFloat(btn.dataset.lat), parseFloat(btn.dataset.lon), 15);
        });
    });
    
    container.querySelectorAll('.remove-fav').forEach(btn => {
        btn.addEventListener('click', async () => {
            await removeFavorite(btn.dataset.id);
            await loadFavorites();
        });
    });
}

// ===== EVENT LISTENERS (7+ Event Types) =====
function setupEventListeners() {
    // 1. Click events on quick action buttons (4 buttons)
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentResourceType = btn.dataset.type;
            document.getElementById('resource-filters').classList.remove('hidden');
            searchResources(currentResourceType);
        });
    });
    
    // 2. Click event - Language toggle
    document.getElementById('lang-toggle').addEventListener('click', () => {
        const newLang = getCurrentLanguage() === 'en' ? 'ny' : 'en';
        setLanguage(newLang);
        translateAll();
        loadWeather();
    });
    
    // 3. Click events - Manual location panel
    document.getElementById('manual-location-btn').addEventListener('click', () => {
        document.getElementById('manual-location-panel').classList.remove('hidden');
    });
    document.getElementById('apply-location-btn').addEventListener('click', applyManualLocation);
    document.getElementById('cancel-location-btn').addEventListener('click', () => {
        document.getElementById('manual-location-panel').classList.add('hidden');
    });
    
    // 4. Click event - Refresh location
    document.getElementById('refresh-location-btn').addEventListener('click', getUserLocation);
    document.getElementById('locate-me').addEventListener('click', getUserLocation);
    
    // 5. Click events - Map controls
    document.getElementById('zoom-in').addEventListener('click', () => {
        if (window.map) window.map.zoomIn();
    });
    document.getElementById('zoom-out').addEventListener('click', () => {
        if (window.map) window.map.zoomOut();
    });
    
    // 6. Click events - Resource detail modal
    document.getElementById('close-detail').addEventListener('click', () => {
        document.getElementById('resource-detail').classList.add('hidden');
    });
    document.getElementById('get-directions-btn').addEventListener('click', () => {
        if (currentResources.length > 0) {
            const r = currentResources[0];
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lon}`, '_blank');
        }
    });
    
    // 7. Click event - Save favorite (LocalStorage)
    document.getElementById('save-favorite-btn').addEventListener('click', async (e) => {
        const resourceData = e.target.dataset.resource;
        if (resourceData) {
            await saveFavorite(JSON.parse(resourceData));
            await loadFavorites();
            e.target.textContent = '★ Saved';
        }
    });
    
    // 8. Click event - Report issue button
    document.getElementById('report-issue-btn').addEventListener('click', () => {
        document.getElementById('resource-detail').classList.add('hidden');
        document.getElementById('report-modal').classList.remove('hidden');
    });
    
    // 9. Click events - Report modal
    document.getElementById('close-report').addEventListener('click', () => {
        document.getElementById('report-modal').classList.add('hidden');
    });
    document.getElementById('cancel-report').addEventListener('click', () => {
        document.getElementById('report-modal').classList.add('hidden');
    });
    
    // 10. Submit event - Report form
    document.getElementById('report-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const resourceId = document.getElementById('report-resource-id').value;
        const type = document.getElementById('report-type').value;
        const description = document.getElementById('report-description').value;
        await submitReport(resourceId, type, description);
        alert(translatePage('thanks_report'));
        document.getElementById('report-modal').classList.add('hidden');
        e.target.reset();
    });
    
    // 11. Click event - List view toggle
    document.getElementById('list-view-toggle').addEventListener('click', () => {
        document.getElementById('resource-list-view').classList.remove('hidden');
    });
    document.getElementById('close-list-view').addEventListener('click', () => {
        document.getElementById('resource-list-view').classList.add('hidden');
    });
    
    // 12. Change event - Radius filter
    document.getElementById('radius-filter').addEventListener('change', (e) => {
        if (currentResourceType) searchResources(currentResourceType, parseInt(e.target.value));
    });
    
    // 13. Click event - Weather details toggle
    document.getElementById('weather-details-toggle').addEventListener('click', () => {
        document.getElementById('weather-details').classList.toggle('hidden');
    });
    
    // 14. Click event - Market calendar toggle
    document.getElementById('calendar-toggle').addEventListener('click', () => {
        document.getElementById('calendar-content').classList.toggle('hidden');
    });
    
    // 15. Change event - Market district select
    document.getElementById('market-district-select').addEventListener('change', (e) => {
        displayMarketSchedule(e.target.value);
    });
    
    // 16. Click event - Clear favorites
    document.getElementById('clear-favorites').addEventListener('click', async () => {
        if (confirm('Clear all saved locations?')) {
            await clearFavorites();
            await loadFavorites();
        }
    });

    // ===== SIDE MENU TOGGLE (Hamburger Menu) =====
    const menuToggle = document.getElementById('menu-toggle');
    const sideMenu = document.getElementById('side-menu');
    const closeMenu = document.getElementById('close-menu');

    if (menuToggle && sideMenu && closeMenu) {
        menuToggle.addEventListener('click', () => {
            sideMenu.classList.remove('hidden');
        });
        
        closeMenu.addEventListener('click', () => {
            sideMenu.classList.add('hidden');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!sideMenu.contains(e.target) && 
                e.target !== menuToggle && 
                !menuToggle.contains(e.target)) {
                sideMenu.classList.add('hidden');
            }
        });
        
        // Prevent menu close when clicking inside
        sideMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Menu item actions
        document.getElementById('menu-favorites')?.addEventListener('click', () => {
            document.getElementById('favorites-section').scrollIntoView({ behavior: 'smooth' });
            sideMenu.classList.add('hidden');
        });
        
        document.getElementById('menu-market')?.addEventListener('click', () => {
            document.getElementById('market-calendar').scrollIntoView({ behavior: 'smooth' });
            sideMenu.classList.add('hidden');
        });
        
        document.getElementById('menu-offline-status')?.addEventListener('click', () => {
            const status = navigator.onLine ? '✅ You are online' : '❌ You are offline';
            alert(status);
            sideMenu.classList.add('hidden');
        });
        
        document.getElementById('menu-refresh')?.addEventListener('click', async () => {
            await getUserLocation();
            sideMenu.classList.add('hidden');
        });
    }
}

// ===== MANUAL LOCATION =====
function applyManualLocation() {
    const district = document.getElementById('district-select').value;
    const village = document.getElementById('village-select').value;
    
    if (district) {
        const districtInfo = malawiDistricts.find(d => d.name.toLowerCase() === district);
        if (districtInfo) {
            currentLocation = {
                lat: districtInfo.lat,
                lon: districtInfo.lon,
                name: village ? village.replace(/_/g, ' ') : districtInfo.name
            };
            updateMapLocation(currentLocation.lat, currentLocation.lon, 12);
            document.getElementById('current-location-text').textContent = `📍 ${currentLocation.name}, ${districtInfo.name}`;
            loadWeather();
            if (currentResourceType) {
                searchResources(currentResourceType, parseInt(document.getElementById('radius-filter').value));
            }
        }
    }
    document.getElementById('manual-location-panel').classList.add('hidden');
}

// ===== POPULATE DISTRICTS =====
function populateDistrictSelects() {
    const districtSelect = document.getElementById('district-select');
    const marketDistrictSelect = document.getElementById('market-district-select');
    
    districtSelect.innerHTML = '<option value="">-- Select District --</option>';
    marketDistrictSelect.innerHTML = '<option value="">Select District</option>';
    
    malawiDistricts.forEach(d => {
        const option1 = document.createElement('option');
        option1.value = d.name.toLowerCase();
        option1.textContent = d.name;
        districtSelect.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = d.name.toLowerCase();
        option2.textContent = d.name;
        marketDistrictSelect.appendChild(option2);
    });
    
    districtSelect.addEventListener('change', (e) => {
        const district = e.target.value;
        const villageSelect = document.getElementById('village-select');
        villageSelect.innerHTML = '<option value="">-- Select Village/TA --</option>';
        villageSelect.disabled = !district;
        
        if (district && villageData[district]) {
            villageData[district].forEach(v => {
                const option = document.createElement('option');
                option.value = v.toLowerCase().replace(/\s+/g, '_');
                option.textContent = v;
                villageSelect.appendChild(option);
            });
        }
    });
}

// ===== DISPLAY MARKET SCHEDULE =====
function displayMarketSchedule(district) {
    const container = document.getElementById('market-schedule');
    const schedule = marketData[district.toLowerCase()] || [];
    
    if (schedule.length === 0) {
        container.innerHTML = '<p>Market days vary. Check locally for exact schedules.</p>';
        return;
    }
    
    let html = '<ul class="market-list">';
    schedule.forEach(m => {
        html += `<li><strong>${m.name}</strong><br>${m.days}<br><small>${m.time}</small></li>`;
    });
    html += '</ul>';
    container.innerHTML = html;
}

function showLoading(show) {
    document.getElementById('location-loading').classList.toggle('hidden', !show);
}

// Make translatePage available globally
window.translatePage = translatePage;