const FAVORITES_KEY = 'village_connect_favorites';

export async function saveFavorite(resource) {
    const favorites = await getFavorites();
    if (!favorites.some(f => f.id === resource.id)) {
        favorites.push(resource);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
    return favorites;
}

export async function getFavorites() {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
}

export async function removeFavorite(id) {
    let favorites = await getFavorites();
    favorites = favorites.filter(f => f.id != id);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return favorites;
}

export async function clearFavorites() {
    localStorage.removeItem(FAVORITES_KEY);
}