export function showOfflineBanner() {
    document.getElementById('offline-banner')?.classList.remove('hidden');
}
export function hideOfflineBanner() {
    document.getElementById('offline-banner')?.classList.add('hidden');
}