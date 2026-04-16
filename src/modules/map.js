// ============================================
// MAP MODULE - Leaflet Integration
// ============================================

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
        icon: L.divIcon({ className: 'user-location-marker', html: '📍', iconSize: [24, 24] })
    }).addTo(map).bindPopup('You are here');
    
    window.map = map;
}

export function updateMapLocation(lat, lon, zoom = 13) {
    if (!map) initMap(lat, lon);
    map.setView([lat, lon], zoom);
    if (userMarker) userMarker.setLatLng([lat, lon]);
}

export function addResourceMarkers(resources) {
    markerLayer.clearLayers();
    
    resources.forEach(res => {
        const color = res.status === 'operational' ? '#1E824C' : '#e74c3c';
        const emoji = getMarkerEmoji(res.type);
        
        const marker = L.marker([res.lat, res.lon], {
            icon: L.divIcon({
                className: 'custom-marker',
                html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 16px;">${emoji}</div>`,
                iconSize: [32, 32],
                popupAnchor: [0, -16]
            })
        }).addTo(markerLayer);
        
        const popupContent = `
            <div style="min-width: 200px;">
                <strong style="font-size: 1.1em;">${res.name}</strong><br>
                <span style="color: #666;">Type: ${res.type}</span><br>
                ${res.tags?.opening_hours ? `⏰ ${res.tags.opening_hours}<br>` : ''}
                ${res.tags?.phone ? `📞 ${res.tags.phone}<br>` : ''}
                ${res.status === 'non_operational' ? '<span style="color: #e74c3c;">⚠️ Reported non-operational</span><br>' : ''}
                <button class="popup-detail-btn" data-id="${res.id}" style="background: #1E824C; color: white; border: none; padding: 6px 12px; border-radius: 20px; margin-top: 8px; cursor: pointer; width: 100%;">View Details →</button>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        
        marker.on('popupopen', () => {
            setTimeout(() => {
                const btn = document.querySelector(`.popup-detail-btn[data-id="${res.id}"]`);
                if (btn) {
                    btn.addEventListener('click', () => {
                        window.dispatchEvent(new CustomEvent('show-resource-detail', { detail: res }));
                        map.closePopup();
                    });
                }
            }, 100);
        });
    });
}

function getMarkerEmoji(type) {
    const emojis = { clinic: '🏥', hospital: '🏥', water: '💧', market: '🛒', agriculture: '🌾' };
    return emojis[type] || '📍';
}

export function clearMarkers() {
    if (markerLayer) markerLayer.clearLayers();
}

export function fitBoundsToMarkers(bounds) {
    if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
    }
}