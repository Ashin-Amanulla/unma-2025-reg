/**
 * Helper utilities for the application
 */

/**
 * Format a date object to a human-readable string
 * @param {Date|string} date - Date object or date string to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
    try {
        // If date is a string, convert to Date object
        const dateObj = typeof date === 'string' ? new Date(date) : date;

        // Default options
        const defaultOptions = {
            format: 'full', // 'full', 'short', 'time', 'custom'
            locale: 'en-US',
            timezone: 'UTC'
        };

        // Merge options
        const mergedOptions = { ...defaultOptions, ...options };

        // Check if date is valid
        if (!(dateObj instanceof Date) || isNaN(dateObj)) {
            return 'Invalid date';
        }

        // Format based on specified format type
        switch (mergedOptions.format) {
            case 'full':
                return dateObj.toLocaleString(mergedOptions.locale, {
                    timeZone: mergedOptions.timezone,
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric'
                });

            case 'short':
                return dateObj.toLocaleString(mergedOptions.locale, {
                    timeZone: mergedOptions.timezone,
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });

            case 'time':
                return dateObj.toLocaleString(mergedOptions.locale, {
                    timeZone: mergedOptions.timezone,
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric'
                });

            case 'custom':
                if (mergedOptions.customFormat) {
                    // For custom format, we'd need to implement a format parser
                    // This is a simple implementation for demo purposes
                    let formatted = mergedOptions.customFormat;
                    formatted = formatted.replace('YYYY', dateObj.getFullYear());
                    formatted = formatted.replace('MM', String(dateObj.getMonth() + 1).padStart(2, '0'));
                    formatted = formatted.replace('DD', String(dateObj.getDate()).padStart(2, '0'));
                    formatted = formatted.replace('HH', String(dateObj.getHours()).padStart(2, '0'));
                    formatted = formatted.replace('mm', String(dateObj.getMinutes()).padStart(2, '0'));
                    formatted = formatted.replace('ss', String(dateObj.getSeconds()).padStart(2, '0'));
                    return formatted;
                }
                return dateObj.toISOString();

            default:
                return dateObj.toLocaleString(mergedOptions.locale, {
                    timeZone: mergedOptions.timezone
                });
        }
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Error formatting date';
    }
};

/**
 * Generate a random string
 * @param {number} length - Length of the random string
 * @param {string} chars - Characters to use for generating the random string
 * @returns {string} Random string
 */
export const generateRandomString = (length = 10, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
    let result = '';
    const charactersLength = chars.length;

    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
};

/**
 * Validate an email address
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid, false otherwise
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate a phone number (basic validation)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if phone number is valid, false otherwise
 */
export const isValidPhone = (phone) => {
    // This is a simple validation that checks if the phone number contains only digits, spaces, +, and -
    const phoneRegex = /^[0-9\s\-\+]+$/;
    return phoneRegex.test(phone) && phone.replace(/[\s\-\+]/g, '').length >= 7;
};

/**
 * Capitalize the first letter of each word in a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalizeWords = (str) => {
    if (!str) return '';
    return str.replace(/\b\w/g, char => char.toUpperCase());
};

/**
 * Truncate a string to a specified length
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 * @param {string} ending - String to append at the end if truncated
 * @returns {string} Truncated string
 */
export const truncateString = (str, length = 50, ending = '...') => {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.substring(0, length - ending.length) + ending;
}; 