export async function fetchWeather(lat, lon) {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation_probability,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Africa/Maputo&forecast_days=3`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Weather fetch failed');
        return await response.json();
    } catch (error) {
        console.error('Weather API error:', error);
        return null;
    }
}

export async function fetchNearbyResources(lat, lon, type, radiusKm = 10) {
    const radiusMeters = radiusKm * 1000;
    let query = '';
    switch (type) {
        case 'clinic':
            query = `[out:json];(node["amenity"="clinic"](around:${radiusMeters},${lat},${lon});node["amenity"="hospital"](around:${radiusMeters},${lat},${lon}););out center;`;
            break;
        case 'water':
            query = `[out:json];(node["amenity"="water_point"](around:${radiusMeters},${lat},${lon});node["man_made"="water_well"](around:${radiusMeters},${lat},${lon}););out center;`;
            break;
        case 'market':
            query = `[out:json];(node["amenity"="marketplace"](around:${radiusMeters},${lat},${lon}););out center;`;
            break;
        case 'agriculture':
            query = `[out:json];(node["office"="agriculture"](around:${radiusMeters},${lat},${lon}););out center;`;
            break;
        default: return [];
    }
    try {
        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Overpass query failed');
        const data = await response.json();
        return data.elements.map(el => ({
            id: el.id,
            type: type,
            lat: el.lat || (el.center ? el.center.lat : null),
            lon: el.lon || (el.center ? el.center.lon : null),
            tags: el.tags || {}
        }));
    } catch (error) {
        console.error('Overpass API error:', error);
        return getMockResources(type, lat, lon);
    }
}

function getMockResources(type, lat, lon) {
    const mockData = {
        clinic: [
            { id: 1, type: 'clinic', lat: lat + 0.01, lon: lon + 0.01, tags: { name: 'Lilongwe District Hospital', amenity: 'hospital', opening_hours: '24/7' } },
            { id: 2, type: 'clinic', lat: lat - 0.01, lon: lon - 0.01, tags: { name: 'Area 18 Health Centre', amenity: 'clinic', opening_hours: 'Mo-Fr 08:00-17:00' } }
        ],
        water: [
            { id: 3, type: 'water', lat: lat + 0.005, lon: lon - 0.005, tags: { name: 'Community Borehole', man_made: 'water_well' } },
            { id: 4, type: 'water', lat: lat - 0.008, lon: lon + 0.008, tags: { name: 'Area 23 Well', amenity: 'drinking_water' } }
        ],
        market: [
            { id: 5, type: 'market', lat: lat + 0.02, lon: lon - 0.01, tags: { name: 'Lilongwe Main Market', amenity: 'marketplace' } }
        ],
        agriculture: [
            { id: 6, type: 'agriculture', lat: lat - 0.015, lon: lon + 0.015, tags: { name: 'Agricultural Extension Office', office: 'agriculture' } }
        ]
    };
    return mockData[type] || [];
}