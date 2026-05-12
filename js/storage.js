/**
 * Storage Utility Module
 * Wraps localStorage to handle JSON parsing and stringifying automatically.
 */

const Storage = {
    // Save data to localStorage
    set: (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage', error);
            return false;
        }
    },

    // Retrieve data from localStorage
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage', error);
            return defaultValue;
        }
    },

    // Remove specific item
    remove: (key) => {
        localStorage.removeItem(key);
    },

    // Clear all app data (useful for logout/reset)
    clear: () => {
        localStorage.clear();
    }
};

// Expose globally
window.AppStorage = Storage;
