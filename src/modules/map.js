let map;
let markerLayer;
let userMarker;

export function initMap(lat, lon) {
    if (map) return;
    map = L.map('map').setView([lat, lon], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    markerLayer = L.layerGroup().addTo(map);
    userMarker = L.marker([lat, lon], {
        icon: L.divIcon({ className: 'user-location-marker', html: '📍', iconSize: [20, 20] })
    }).addTo(map).bindPopup('You are here');
}

export function updateMapLocation(lat, lon, zoom = 13) {
    if (!map) initMap(lat, lon);
    map.setView([lat, lon], zoom);
    if (userMarker) userMarker.setLatLng([lat, lon]);
}

export function addResourceMarkers(resources) {
    markerLayer.clearLayers();
    resources.forEach(res => {
        const color = res.status === 'operational' ? '#1E824C' : '#95a5a6';
        const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white;">${getMarkerEmoji(res.type)}</div>`,
            iconSize: [24, 24],
            popupAnchor: [0, -12]
        });
        L.marker([res.lat, res.lon], { icon }).addTo(markerLayer).bindPopup(`<b>${res.name}</b><br>${res.type}`);
    });
}

function getMarkerEmoji(type) {
    const emojis = { clinic: '🏥', water: '💧', market: '🛒', agriculture: '🌾' };
    return emojis[type] || '📍';
}

export function clearMarkers() { markerLayer.clearLayers(); }
export function fitBoundsToMarkers(bounds) { if (bounds.length) map.fitBounds(bounds, { padding: [50, 50] }); }