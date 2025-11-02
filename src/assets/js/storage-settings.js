/**
 * EECOL Wire Tools Suite - Storage Settings Page
 * Handles storage mode configuration, Supabase setup, and data migration
 */

const StorageSettings = (function() {
    // DOM elements
    let elements = {};

    // Storage adapter instance
    let storageAdapter = null;

    // Current status
    let currentStatus = {
        mode: 'loading',
        supabaseConnected: false,
        localRecords: 0,
        pendingSync: 0
    };

    /**
     * Initialize the storage settings page
     */
    function init() {
        console.log('Initializing Storage Settings...');

        // Cache DOM elements
        cacheElements();

        // Initialize storage adapter
        initializeStorageAdapter();

        // Set up event listeners
        setupEventListeners();

        // Load current status
        loadCurrentStatus();

        // Load saved configuration
        loadSavedConfiguration();
    }

    /**
     * Cache frequently used DOM elements
     */
    function cacheElements() {
        elements = {
            // Status elements
            currentMode: document.getElementById('currentMode'),
            supabaseStatus: document.getElementById('supabaseStatus'),
            localRecords: document.getElementById('localRecords'),
            pendingSync: document.getElementById('pendingSync'),
            refreshStatus: document.getElementById('refreshStatus'),

            // Mode selection
            modeCards: document.querySelectorAll('.mode-card'),
            modeRadios: document.querySelectorAll('input[name="storageMode"]'),
            saveModeSelection: document.getElementById('saveModeSelection'),

            // Supabase config
            supabaseConfig: document.getElementById('supabaseConfig'),
            supabaseUrl: document.getElementById('supabaseUrl'),
            supabaseKey: document.getElementById('supabaseKey'),
            testConnection: document.getElementById('testConnection'),
            saveConfig: document.getElementById('saveConfig'),
            connectionResult: document.getElementById('connectionResult'),

            // Advanced options
            offlineFallback: document.getElementById('offlineFallback'),
            autoSync: document.getElementById('autoSync'),
            syncFrequency: document.getElementById('syncFrequency'),
            syncFrequencyValue: document.getElementById('syncFrequencyValue'),
            clearCache: document.getElementById('clearCache'),

            // Migration tools
            migrateToSupabase: document.getElementById('migrateToSupabase'),
            syncFromSupabase: document.getElementById('syncFromSupabase'),
            clearLocalData: document.getElementById('clearLocalData'),
            migrationProgress: document.getElementById('migrationProgress'),
            progressFill: document.getElementById('progressFill'),
            migrationStatus: document.getElementById('migrationStatus')
        };
    }

    /**
     * Initialize the storage adapter
     */
    async function initializeStorageAdapter() {
        try {
            console.log('Checking if EECOLIndexedDB is available...');
            if (typeof EECOLIndexedDB === 'undefined') {
                throw new Error('EECOLIndexedDB is not defined. Check script loading order.');
            }
            console.log('EECOLIndexedDB is available, creating StorageAdapter...');
            storageAdapter = new StorageAdapter();
            console.log('StorageAdapter created, initializing...');
            await storageAdapter.initialize();
            console.log('Storage adapter initialized successfully');
        } catch (error) {
            console.error('Failed to initialize storage adapter:', error);
            showModal('Error', `Failed to initialize storage system: ${error.message}. Please refresh the page.`);
        }
    }

    /**
     * Set up event listeners
     */
    function setupEventListeners() {
        // Status refresh
        elements.refreshStatus.addEventListener('click', loadCurrentStatus);

        // Mode selection
        elements.modeCards.forEach(card => {
            card.addEventListener('click', () => selectMode(card.dataset.mode));
        });

        elements.modeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => selectMode(e.target.value));
        });

        elements.saveModeSelection.addEventListener('click', saveModeSelection);

        // Supabase configuration
        elements.testConnection.addEventListener('click', testSupabaseConnection);
        elements.saveConfig.addEventListener('click', saveSupabaseConfig);

        // Advanced options
        elements.syncFrequency.addEventListener('input', updateSyncFrequencyDisplay);

        // Migration tools
        elements.migrateToSupabase.addEventListener('click', migrateToSupabase);
        elements.syncFromSupabase.addEventListener('click', syncFromSupabase);
        elements.clearLocalData.addEventListener('click', clearLocalData);
        elements.clearCache.addEventListener('click', clearCache);
    }

    /**
     * Load current status information
     */
    async function loadCurrentStatus() {
        try {
            // Get current mode
            const mode = storageAdapter ? storageAdapter.getStorageMode() : 'loading';
            updateModeDisplay(mode);

            // Check Supabase connection
            await checkSupabaseConnection();

            // Get record counts
            await loadRecordCounts();

            // Get pending sync count
            await loadPendingSyncCount();

        } catch (error) {
            console.error('Failed to load current status:', error);
        }
    }

    /**
     * Update the mode display
     */
    function updateModeDisplay(mode) {
        const modeNames = {
            indexeddb: 'Local Storage',
            supabase: 'Cloud Storage',
            hybrid: 'Hybrid Storage',
            loading: 'Loading...'
        };

        elements.currentMode.textContent = modeNames[mode] || mode;
        currentStatus.mode = mode;

        // Update radio buttons
        elements.modeRadios.forEach(radio => {
            radio.checked = radio.value === mode;
        });

        // Update card selection
        elements.modeCards.forEach(card => {
            card.classList.toggle('selected', card.dataset.mode === mode);
        });

        // Show/hide Supabase config based on mode
        const showSupabaseConfig = mode === 'supabase' || mode === 'hybrid';
        elements.supabaseConfig.style.display = showSupabaseConfig ? 'block' : 'none';
    }

    /**
     * Check Supabase connection status
     */
    async function checkSupabaseConnection() {
        try {
            updateSupabaseStatus('connecting', 'Checking...');

            if (!storageAdapter || !storageAdapter.supabase) {
                updateSupabaseStatus('offline', 'Not configured');
                currentStatus.supabaseConnected = false;
                return;
            }

            const isConnected = await storageAdapter.supabase.testConnection();
            currentStatus.supabaseConnected = isConnected;

            if (isConnected) {
                updateSupabaseStatus('online', 'Connected');
            } else {
                updateSupabaseStatus('offline', 'Connection failed');
            }

        } catch (error) {
            console.error('Supabase connection check failed:', error);
            updateSupabaseStatus('offline', 'Error');
            currentStatus.supabaseConnected = false;
        }
    }

    /**
     * Update Supabase status display
     */
    function updateSupabaseStatus(status, message) {
        const statusElement = elements.supabaseStatus;
        statusElement.className = `status-indicator status-${status}`;
        statusElement.innerHTML = `
            <div class="w-2 h-2 bg-current rounded-full ${status === 'connecting' ? 'animate-pulse' : ''}"></div>
            <span>${message}</span>
        `;
    }

    /**
     * Load record counts from all stores
     */
    async function loadRecordCounts() {
        try {
            if (!storageAdapter) return;

            let totalRecords = 0;
            const stores = ['cuttingRecords', 'inventoryRecords', 'maintenanceLogs', 'settings'];

            for (const store of stores) {
                try {
                    const records = await storageAdapter.getAll(store);
                    totalRecords += records.length;
                } catch (error) {
                    console.warn(`Failed to count records in ${store}:`, error);
                }
            }

            elements.localRecords.textContent = totalRecords.toLocaleString();
            currentStatus.localRecords = totalRecords;

        } catch (error) {
            console.error('Failed to load record counts:', error);
            elements.localRecords.textContent = 'Error';
        }
    }

    /**
     * Load pending sync count
     */
    async function loadPendingSyncCount() {
        try {
            // This would need to be implemented in StorageAdapter
            // For now, show 0
            elements.pendingSync.textContent = '0';
            currentStatus.pendingSync = 0;
        } catch (error) {
            console.error('Failed to load pending sync count:', error);
            elements.pendingSync.textContent = 'Error';
        }
    }

    /**
     * Load saved configuration from localStorage
     */
    function loadSavedConfiguration() {
        try {
            // Load Supabase config
            const savedUrl = localStorage.getItem('eecol-supabase-url');
            const savedKey = localStorage.getItem('eecol-supabase-key');

            if (savedUrl) elements.supabaseUrl.value = savedUrl;
            if (savedKey) elements.supabaseKey.value = savedKey;

            // Load advanced options
            const offlineFallback = localStorage.getItem('eecol-offline-fallback') !== 'false';
            const autoSync = localStorage.getItem('eecol-auto-sync') !== 'false';
            const syncFrequency = parseInt(localStorage.getItem('eecol-sync-frequency')) || 60;

            elements.offlineFallback.checked = offlineFallback;
            elements.autoSync.checked = autoSync;
            elements.syncFrequency.value = syncFrequency;
            updateSyncFrequencyDisplay();

        } catch (error) {
            console.error('Failed to load saved configuration:', error);
        }
    }

    /**
     * Select a storage mode
     */
    function selectMode(mode) {
        // Update radio buttons
        elements.modeRadios.forEach(radio => {
            radio.checked = radio.value === mode;
        });

        // Update card selection
        elements.modeCards.forEach(card => {
            card.classList.toggle('selected', card.dataset.mode === mode);
        });

        // Show/hide Supabase config
        const showSupabaseConfig = mode === 'supabase' || mode === 'hybrid';
        elements.supabaseConfig.style.display = showSupabaseConfig ? 'block' : 'none';
    }

    /**
     * Save mode selection
     */
    async function saveModeSelection() {
        try {
            const selectedMode = document.querySelector('input[name="storageMode"]:checked')?.value;

            if (!selectedMode) {
                showModal('Error', 'Please select a storage mode.');
                return;
            }

            if (!storageAdapter) {
                showModal('Error', 'Storage system not initialized.');
                return;
            }

            // Validate Supabase config if needed
            if ((selectedMode === 'supabase' || selectedMode === 'hybrid') && !currentStatus.supabaseConnected) {
                const confirmed = await showConfirmModal(
                    'Supabase Not Connected',
                    'You have selected a mode that requires Supabase, but the connection is not configured or failed. Continue anyway?'
                );
                if (!confirmed) return;
            }

            await storageAdapter.setStorageMode(selectedMode);
            updateModeDisplay(selectedMode);

            showModal('Success', `Storage mode changed to ${selectedMode}.`);

        } catch (error) {
            console.error('Failed to save mode selection:', error);
            showModal('Error', 'Failed to save storage mode selection.');
        }
    }

    /**
     * Test Supabase connection
     */
    async function testSupabaseConnection() {
        try {
            const url = elements.supabaseUrl.value.trim();
            const key = elements.supabaseKey.value.trim();

            if (!url || !key) {
                showConnectionResult('error', 'Please enter both URL and API key.');
                return;
            }

            showConnectionResult('connecting', 'Testing connection...');

            // Create temporary Supabase client for testing
            const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
            const testClient = createClient(url, key);

            // Test connection
            const { data, error } = await testClient
                .from('cutting_records')
                .select('count')
                .limit(1);

            if (error) {
                showConnectionResult('error', `Connection failed: ${error.message}`);
            } else {
                showConnectionResult('success', 'Connection successful!');
            }

        } catch (error) {
            console.error('Connection test failed:', error);
            showConnectionResult('error', `Connection test failed: ${error.message}`);
        }
    }

    /**
     * Show connection test result
     */
    function showConnectionResult(type, message) {
        const resultDiv = elements.connectionResult;
        resultDiv.style.display = 'block';
        resultDiv.className = `mt-4 p-4 rounded-lg ${
            type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
            type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
            'bg-blue-50 text-blue-700 border border-blue-200'
        }`;
        resultDiv.textContent = message;
    }

    /**
     * Save Supabase configuration
     */
    function saveSupabaseConfig() {
        try {
            const url = elements.supabaseUrl.value.trim();
            const key = elements.supabaseKey.value.trim();

            if (!url || !key) {
                showModal('Error', 'Please enter both Supabase URL and API key.');
                return;
            }

            // Save to localStorage
            localStorage.setItem('eecol-supabase-url', url);
            localStorage.setItem('eecol-supabase-key', key);

            showModal('Success', 'Supabase configuration saved. You may need to refresh the page for changes to take effect.');

        } catch (error) {
            console.error('Failed to save Supabase config:', error);
            showModal('Error', 'Failed to save Supabase configuration.');
        }
    }

    /**
     * Update sync frequency display
     */
    function updateSyncFrequencyDisplay() {
        const value = elements.syncFrequency.value;
        const minutes = Math.floor(value / 60);
        const seconds = value % 60;

        let display = '';
        if (minutes > 0) {
            display += `${minutes}m `;
        }
        if (seconds > 0 || minutes === 0) {
            display += `${seconds}s`;
        }

        elements.syncFrequencyValue.textContent = display;
    }

    /**
     * Migrate data to Supabase
     */
    async function migrateToSupabase() {
        try {
            if (!storageAdapter) {
                showModal('Error', 'Storage system not initialized.');
                return;
            }

            const confirmed = await showConfirmModal(
                'Migrate to Supabase',
                'This will copy all your local data to Supabase. This operation may take several minutes. Continue?'
            );

            if (!confirmed) return;

            showMigrationProgress(true, 'Starting migration...');

            const result = await storageAdapter.migrateToSupabase((progress, message) => {
                updateMigrationProgress(progress, message);
            });

            if (result.success) {
                showModal('Success', `Migration completed successfully! ${result.totalRecords} records migrated.`);
            } else {
                showModal('Error', `Migration failed: ${result.error}`);
            }

        } catch (error) {
            console.error('Migration failed:', error);
            showModal('Error', 'Migration failed. Please check the console for details.');
        } finally {
            showMigrationProgress(false);
        }
    }

    /**
     * Sync data from Supabase
     */
    async function syncFromSupabase() {
        try {
            if (!storageAdapter) {
                showModal('Error', 'Storage system not initialized.');
                return;
            }

            const confirmed = await showConfirmModal(
                'Sync from Supabase',
                'This will download all data from Supabase and replace your local data. Continue?'
            );

            if (!confirmed) return;

            showMigrationProgress(true, 'Starting sync...');

            const result = await storageAdapter.syncFromSupabase((progress, message) => {
                updateMigrationProgress(progress, message);
            });

            if (result.success) {
                showModal('Success', `Sync completed successfully! ${result.totalRecords} records synced.`);
                // Refresh status
                loadCurrentStatus();
            } else {
                showModal('Error', `Sync failed: ${result.error}`);
            }

        } catch (error) {
            console.error('Sync failed:', error);
            showModal('Error', 'Sync failed. Please check the console for details.');
        } finally {
            showMigrationProgress(false);
        }
    }

    /**
     * Clear local data
     */
    async function clearLocalData() {
        try {
            const confirmed = await showConfirmModal(
                'Clear Local Data',
                'This will permanently delete all local data. Make sure you have backed up important information. Continue?',
                true // This is a dangerous operation
            );

            if (!confirmed) return;

            if (!storageAdapter) {
                showModal('Error', 'Storage system not initialized.');
                return;
            }

            await storageAdapter.clear('cuttingRecords');
            await storageAdapter.clear('inventoryRecords');
            await storageAdapter.clear('maintenanceLogs');
            await storageAdapter.clear('settings');

            showModal('Success', 'Local data cleared successfully.');
            loadCurrentStatus(); // Refresh counts

        } catch (error) {
            console.error('Failed to clear local data:', error);
            showModal('Error', 'Failed to clear local data.');
        }
    }

    /**
     * Clear cache
     */
    async function clearCache() {
        try {
            const confirmed = await showConfirmModal(
                'Clear Cache',
                'This will clear the application cache and may log you out. Continue?'
            );

            if (!confirmed) return;

            // Clear localStorage (except critical settings)
            const keysToKeep = ['eecol-supabase-url', 'eecol-supabase-key', 'eecol-storage-mode'];
            const keys = Object.keys(localStorage);

            for (const key of keys) {
                if (!keysToKeep.includes(key)) {
                    localStorage.removeItem(key);
                }
            }

            // Clear IndexedDB settings store
            if (storageAdapter && storageAdapter.indexedDB) {
                await storageAdapter.indexedDB.clear('settings');
            }

            showModal('Success', 'Cache cleared successfully. You may need to refresh the page.');

        } catch (error) {
            console.error('Failed to clear cache:', error);
            showModal('Error', 'Failed to clear cache.');
        }
    }

    /**
     * Show migration progress
     */
    function showMigrationProgress(show, message = '') {
        elements.migrationProgress.style.display = show ? 'block' : 'none';
        elements.migrationStatus.textContent = message || 'Ready to migrate data';
    }

    /**
     * Update migration progress
     */
    function updateMigrationProgress(progress, message) {
        elements.progressFill.style.width = `${progress}%`;
        elements.migrationStatus.textContent = message;
    }

    /**
     * Show modal dialog
     */
    function showModal(title, message) {
        if (window.showModal) {
            window.showModal(title, message);
        } else {
            alert(`${title}: ${message}`);
        }
    }

    /**
     * Show confirmation modal
     */
    function showConfirmModal(title, message, isDangerous = false) {
        return new Promise((resolve) => {
            if (window.showConfirmModal) {
                window.showConfirmModal(title, message, isDangerous).then(resolve);
            } else {
                const result = confirm(`${title}\n\n${message}`);
                resolve(result);
            }
        });
    }

    // Public API
    return {
        init: init,
        loadCurrentStatus: loadCurrentStatus,
        getCurrentStatus: () => currentStatus
    };

})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    StorageSettings.init();
});

// Export for potential use by other modules
window.StorageSettings = StorageSettings;
