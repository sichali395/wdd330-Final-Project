// ============================================
// UI MODULE - Helper Functions
// ============================================

export function showOfflineBanner() {
    const banner = document.getElementById('offline-banner');
    if (banner) banner.classList.remove('hidden');
}

export function hideOfflineBanner() {
    const banner = document.getElementById('offline-banner');
    if (banner) banner.classList.add('hidden');
}

export function isOnline() {
    return navigator.onLine;
}