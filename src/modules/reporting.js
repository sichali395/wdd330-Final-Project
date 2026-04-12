const REPORTS_KEY = 'village_connect_reports';

export function submitReport(resourceId, issueType, description = '') {
    const reports = getAllReports();
    reports.push({ resourceId, issueType, description, timestamp: Date.now() });
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    return reports;
}

export function getReportsForResource(resourceId) {
    return getAllReports().filter(r => r.resourceId == resourceId).sort((a, b) => b.timestamp - a.timestamp);
}

function getAllReports() {
    const data = localStorage.getItem(REPORTS_KEY);
    return data ? JSON.parse(data) : [];
}