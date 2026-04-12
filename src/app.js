import './style.css';
import { initMap, updateMapLocation, addResourceMarkers, clearMarkers, fitBoundsToMarkers } from './modules/map';
import { fetchWeather, fetchNearbyResources } from './modules/api';
import { getTranslations, setLanguage, translatePage, getCurrentLanguage } from './modules/language';
import { saveFavorite, getFavorites, removeFavorite, clearFavorites } from './modules/storage';
import { submitReport, getReportsForResource } from './modules/reporting';
import { showOfflineBanner, hideOfflineBanner } from './modules/ui';
import { registerSW } from './modules/pwa';
import { marketData } from './modules/resources';

let currentLocation = { lat: -13.9626, lon: 33.7741, name: 'Lilongwe' };
let currentResourceType = null;
let currentResources = [];
let favorites = [];

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌍 Village Connect initializing...');
    registerSW();
    await getTranslations();
    initMap(currentLocation.lat, currentLocation.lon);
    setupUI();
    await loadFavorites();
    await getUserLocation();
    await loadWeather();
    setupEventListeners();
    window.addEventListener('online', () => hideOfflineBanner());
    window.addEventListener('offline', () => showOfflineBanner());
    if (!navigator.onLine) showOfflineBanner();
    console.log('✅ Village Connect ready');
});

function setupUI() {
    populateDistrictSelects();
    translatePage();
}

async function getUserLocation() {
    const locationText = document.getElementById('current-location-text');
    locationText.innerHTML = `📍 ${translatePage('detecting')}`;
    if (navigator.geolocation) {
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
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

async function loadWeather() {
    const weatherData = await fetchWeather(currentLocation.lat, currentLocation.lon);
    displayWeather(weatherData);
}

function displayWeather(data) {
    if (!data) return;
    const summaryDiv = document.getElementById('weather-summary');
    const current = data.current;
    const daily = data.daily;
    summaryDiv.innerHTML = `
        <div class="weather-current">
            <span class="temp">${current.temperature_2m}°C</span>
            <span class="rain">🌧️ ${current.precipitation_probability}%</span>
            <span class="wind">💨 ${current.wind_speed_10m} km/h</span>
        </div>
    `;
    const dailyDiv = document.getElementById('weather-daily');
    let dailyHtml = '<div class="daily-forecast">';
    for (let i = 0; i < 3; i++) {
        const date = new Date(daily.time[i]);
        const dayName = date.toLocaleDateString(getCurrentLanguage() === 'en' ? 'en-US' : 'en', { weekday: 'short' });
        dailyHtml += `
            <div class="daily-item">
                <div class="day">${dayName}</div>
                <div class="temps">${daily.temperature_2m_max[i]}° / ${daily.temperature_2m_min[i]}°</div>
                <div class="rain-chance">💧 ${daily.precipitation_probability_max[i]}%</div>
            </div>
        `;
    }
    dailyHtml += '</div>';
    dailyDiv.innerHTML = dailyHtml;
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

async function searchResources(type, radius = 10) {
    showLoading(true);
    try {
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
    resources.forEach(res => {
        const status = getResourceStatus(res);
        addResourceMarkers([{
            lat: res.lat,
            lon: res.lon,
            name: res.tags?.name || 'Unnamed',
            type: res.type,
            status: status,
            id: res.id
        }]);
    });
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
        const type = res.type;
        const distance = calculateDistance(currentLocation.lat, currentLocation.lon, res.lat, res.lon);
        html += `
            <li class="resource-item" data-id="${res.id}" data-lat="${res.lat}" data-lon="${res.lon}">
                <div class="resource-icon">${getIconForType(type)}</div>
                <div class="resource-info">
                    <strong>${name}</strong>
                    <span class="resource-type">${translatePage(type)}</span>
                    <span class="resource-distance">${distance.toFixed(1)} km</span>
                </div>
                <button class="view-detail-btn" data-id="${res.id}">→</button>
            </li>
        `;
    });
    html += '</ul>';
    container.innerHTML = html;
    container.querySelectorAll('.view-detail-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.dataset.id;
            const resource = currentResources.find(r => r.id == id);
            if (resource) showResourceDetail(resource);
        });
    });
}

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
            const lat = parseFloat(btn.dataset.lat);
            const lon = parseFloat(btn.dataset.lon);
            updateMapLocation(lat, lon, 15);
        });
    });
    container.querySelectorAll('.remove-fav').forEach(btn => {
        btn.addEventListener('click', async () => {
            await removeFavorite(btn.dataset.id);
            await loadFavorites();
        });
    });
}

function setupEventListeners() {
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            currentResourceType = type;
            document.getElementById('resource-filters').classList.remove('hidden');
            searchResources(type);
        });
    });
    document.getElementById('lang-toggle').addEventListener('click', () => {
        const newLang = getCurrentLanguage() === 'en' ? 'ny' : 'en';
        setLanguage(newLang);
        translatePage();
        loadWeather();
    });
    document.getElementById('manual-location-btn').addEventListener('click', () => {
        document.getElementById('manual-location-panel').classList.remove('hidden');
    });
    document.getElementById('apply-location-btn').addEventListener('click', applyManualLocation);
    document.getElementById('cancel-location-btn').addEventListener('click', () => {
        document.getElementById('manual-location-panel').classList.add('hidden');
    });
    document.getElementById('refresh-location-btn').addEventListener('click', getUserLocation);
    document.getElementById('locate-me').addEventListener('click', getUserLocation);
    document.getElementById('close-detail').addEventListener('click', () => {
        document.getElementById('resource-detail').classList.add('hidden');
    });
    document.getElementById('get-directions-btn').addEventListener('click', () => {
        if (currentResources.length > 0) {
            const r = currentResources[0];
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lon}`, '_blank');
        }
    });
    document.getElementById('save-favorite-btn').addEventListener('click', async (e) => {
        const resourceData = e.target.dataset.resource;
        if (resourceData) {
            const resource = JSON.parse(resourceData);
            await saveFavorite(resource);
            await loadFavorites();
            e.target.textContent = '★ Saved';
        }
    });
    document.getElementById('report-issue-btn').addEventListener('click', () => {
        document.getElementById('resource-detail').classList.add('hidden');
        document.getElementById('report-modal').classList.remove('hidden');
    });
    document.getElementById('close-report').addEventListener('click', () => {
        document.getElementById('report-modal').classList.add('hidden');
    });
    document.getElementById('cancel-report').addEventListener('click', () => {
        document.getElementById('report-modal').classList.add('hidden');
    });
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
    document.getElementById('list-view-toggle').addEventListener('click', () => {
        document.getElementById('resource-list-view').classList.remove('hidden');
    });
    document.getElementById('close-list-view').addEventListener('click', () => {
        document.getElementById('resource-list-view').classList.add('hidden');
    });
    document.getElementById('radius-filter').addEventListener('change', (e) => {
        if (currentResourceType) searchResources(currentResourceType, parseInt(e.target.value));
    });
    document.getElementById('weather-details-toggle').addEventListener('click', () => {
        document.getElementById('weather-details').classList.toggle('hidden');
    });
    document.getElementById('calendar-toggle').addEventListener('click', () => {
        document.getElementById('calendar-content').classList.toggle('hidden');
    });
    document.getElementById('market-district-select').addEventListener('change', (e) => {
        displayMarketSchedule(e.target.value);
    });
    document.getElementById('clear-favorites').addEventListener('click', async () => {
        if (confirm('Clear all saved locations?')) {
            await clearFavorites();
            await loadFavorites();
        }
    });
}

function applyManualLocation() {
    const district = document.getElementById('district-select').value;
    const village = document.getElementById('village-select').value;
    if (district && village) {
        const locations = {
            'lilongwe': { lat: -13.9626, lon: 33.7741 },
            'blantyre': { lat: -15.7861, lon: 35.0058 },
            'mzuzu': { lat: -11.4656, lon: 34.0207 },
            'zomba': { lat: -15.3833, lon: 35.3333 }
        };
        const key = district.toLowerCase();
        if (locations[key]) {
            currentLocation = { ...locations[key], name: village };
            updateMapLocation(currentLocation.lat, currentLocation.lon, 12);
            document.getElementById('current-location-text').textContent = `📍 ${village}, ${district}`;
            loadWeather();
        }
    }
    document.getElementById('manual-location-panel').classList.add('hidden');
}

function populateDistrictSelects() {
    const districts = ['Lilongwe', 'Blantyre', 'Mzuzu', 'Zomba', 'Mangochi', 'Kasungu'];
    const select = document.getElementById('district-select');
    const marketSelect = document.getElementById('market-district-select');
    districts.forEach(d => {
        const option = document.createElement('option');
        option.value = d.toLowerCase();
        option.textContent = d;
        select.appendChild(option.cloneNode(true));
        marketSelect.appendChild(option);
    });
}

function displayMarketSchedule(district) {
    const container = document.getElementById('market-schedule');
    const schedule = marketData[district.toLowerCase()] || [];
    if (schedule.length === 0) {
        container.innerHTML = '<p>No market information available.</p>';
        return;
    }
    let html = '<ul>';
    schedule.forEach(m => {
        html += `<li><strong>${m.name}</strong> - ${m.days} (${m.time})</li>`;
    });
    html += '</ul>';
    container.innerHTML = html;
}

function showLoading(show) {
    document.getElementById('location-loading').classList.toggle('hidden', !show);
}

window.translatePage = translatePage;