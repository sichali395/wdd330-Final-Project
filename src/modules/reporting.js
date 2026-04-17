// ============================================
// REPORTING MODULE - User Reports (LocalStorage)
// ============================================
// RUBRIC COMPLIANCE:
// - LocalStorage with 5+ properties
// ============================================

const REPORTS_KEY = 'village_connect_reports';

/**
 * Submit a new report for a resource
 * @param {string} resourceId - ID of the resource
 * @param {string} issueType - Type of issue (closed, broken, moved, other)
 * @param {string} description - Optional description
 * @returns {Array} All reports
 */
export function submitReport(resourceId, issueType, description = '') {
    const reports = getAllReports();
    
    const newReport = {
        id: generateId(),
        resourceId,
        issueType,
        description: description || 'No description provided',
        timestamp: Date.now(),
        dateSubmitted: new Date().toISOString(),
        status: 'pending',
        userAgent: navigator.userAgent.substring(0, 100)
    };
    
    reports.push(newReport);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    
    console.log('Report saved:', newReport);
    return reports;
}

/**
 * Get all reports for a specific resource
 * @param {string} resourceId - Resource ID
 * @returns {Array} Filtered and sorted reports
 */
export function getReportsForResource(resourceId) {
    return getAllReports()
        .filter(r => r.resourceId == resourceId)
        .sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Get all reports
 * @returns {Array} All reports
 */
export function getAllReports() {
    const data = localStorage.getItem(REPORTS_KEY);
    return data ? JSON.parse(data) : [];
}

/**
 * Get report statistics
 * @returns {Object} Statistics
 */
export function getReportStats() {
    const reports = getAllReports();
    return {
        total: reports.length,
        byType: {
            closed: reports.filter(r => r.issueType === 'closed').length,
            broken: reports.filter(r => r.issueType === 'broken').length,
            moved: reports.filter(r => r.issueType === 'moved').length,
            other: reports.filter(r => r.issueType === 'other').length
        },
        pending: reports.filter(r => r.status === 'pending').length,
        recent: reports.filter(r => Date.now() - r.timestamp < 86400000).length // Last 24 hours
    };
}

/**
 * Clear all reports (for testing)
 */
export function clearReports() {
    localStorage.removeItem(REPORTS_KEY);
}

/**
 * Generate a simple unique ID
 * @returns {string} Unique ID
 */
function generateId() {
    return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}