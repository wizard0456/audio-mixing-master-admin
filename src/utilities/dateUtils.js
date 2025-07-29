/**
 * Formats a date string to avoid timezone conversion issues
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @param {object} options - toLocaleDateString options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = { month: 'long', day: 'numeric', year: 'numeric' }) => {
    if (!dateString) return '';
    
    // Split the date string to avoid timezone conversion
    const [year, month, day] = dateString.split('-').map(Number);
    
    // Create date in local timezone
    const date = new Date(year, month - 1, day); // month is 0-indexed
    
    return date.toLocaleDateString("en-US", options);
};

/**
 * Formats a datetime string to avoid timezone conversion issues
 * @param {string} dateTimeString - DateTime string
 * @param {object} options - toLocaleDateString options
 * @returns {string} Formatted date string
 */
export const formatDateTime = (dateTimeString, options = { month: 'long', day: 'numeric', year: 'numeric' }) => {
    if (!dateTimeString) return '';
    
    // For datetime strings, we need to handle timezone properly
    const date = new Date(dateTimeString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
        return '';
    }
    
    return date.toLocaleDateString("en-US", options);
}; 