/**
 * EECOL Wire Tools Suite - Theme Loader
 * This script is intended to be inlined in the <head> of the document
 * to prevent FOUC (Flash of Unstyled Content) when a dark theme is active.
 */
(function() {
    try {
        const theme = localStorage.getItem('eecol-theme');
        if (theme === 'dark') {
            document.documentElement.classList.add('dark-mode');
        }
    } catch (e) {
        // localStorage is not available
        console.warn('Could not apply theme from localStorage:', e);
    }
})();
