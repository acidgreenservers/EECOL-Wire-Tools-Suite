/**
 * StorageAdapter - Unified storage abstraction layer for EECOL Wire Tools Suite
 *
 * Provides a unified API that works with both IndexedDB (local-only) and Supabase (cloud-sync)
 * with user-selectable storage modes: IndexedDB, Supabase, or Hybrid.
 *
 * @author Claude AI
 * @version 1.0.0
 * @since Phase 2 Supabase Migration
 */

class StorageAdapter {
  /**
   * Constructor - Initialize storage adapter with mode detection
   */
  constructor() {
    this.mode = this.loadStorageMode();
    this.indexedDB = null;
    this.supabase = null;
    this.syncQueue = [];
    this.isOnline = navigator.onLine;
    this.initialized = false;

    // Bind methods
    this.initialize = this.initialize.bind(this);
    this.setStorageMode = this.setStorageMode.bind(this);
    this.getStorageMode = this.getStorageMode.bind(this);
  }

  /**
   * Initialize the storage backend(s) based on current mode
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Check if EECOLIndexedDB is available
      if (typeof EECOLIndexedDB === 'undefined') {
        console.warn('⚠️ EECOLIndexedDB is not defined. Storage functionality will be limited.');
        console.warn('Please ensure indexeddb.js is loaded before storage-adapter.js');
        this.initialized = true; // Mark as initialized to prevent repeated attempts
        this.mode = 'indexeddb'; // Force IndexedDB mode
        return;
      }

      // Always initialize IndexedDB as fallback
      console.log('Initializing EECOLIndexedDB...');
      this.indexedDB = new EECOLIndexedDB();
      console.log('Waiting for IndexedDB ready...');
      await this.indexedDB.ready;
      console.log('✅ IndexedDB ready');

      // Load existing offline queue
      await this.loadOfflineQueue();

      // Check if Supabase mode is requested and credentials are available
      if (this.mode !== 'indexeddb') {
        const hasSupabaseCredentials = this.checkSupabaseCredentials();

        if (!hasSupabaseCredentials) {
          console.warn('⚠️ Supabase credentials not configured. Falling back to IndexedDB-only mode.');
          this.mode = 'indexeddb';
          localStorage.setItem('eecol-storage-mode', 'indexeddb');
        } else {
          // Check if SupabaseClient is available
          if (typeof SupabaseClient === 'undefined') {
            console.warn('⚠️ SupabaseClient is not defined. Falling back to IndexedDB-only mode.');
            console.warn('Please ensure supabase-client.js is loaded before storage-adapter.js');
            this.mode = 'indexeddb';
            localStorage.setItem('eecol-storage-mode', 'indexeddb');
          } else {
            // Try to initialize Supabase
            try {
              this.supabase = new SupabaseClient();
              await this.supabase.initialize();
              console.log('✅ Supabase connection established');
            } catch (supabaseError) {
              console.error('❌ Supabase initialization failed:', supabaseError.message);
              console.warn('⚠️ Falling back to IndexedDB-only mode');
              this.mode = 'indexeddb';
              localStorage.setItem('eecol-storage-mode', 'indexeddb');
              this.supabase = null;
            }
          }
        }
      }

      // Setup connectivity monitoring and sync (only if not in IndexedDB-only mode)
      this.setupConnectivityMonitoring();
      if (this.mode !== 'indexeddb' && this.supabase) {
        this.setupRealtimeSync();
      }

      this.initialized = true;
      console.log('✅ StorageAdapter initialized successfully in', this.mode, 'mode');
    } catch (error) {
      console.error('❌ StorageAdapter initialization failed:', error);

      // If we have IndexedDB, fall back to it gracefully
      if (this.indexedDB) {
        console.warn('⚠️ Falling back to IndexedDB-only mode due to initialization error');
        this.mode = 'indexeddb';
        this.initialized = true;
        localStorage.setItem('eecol-storage-mode', 'indexeddb');
      } else {
        // Critical failure - no storage available
        throw new Error('Critical: No storage backend available. Application cannot function.');
      }
    }
  }

  /**
   * Check if Supabase credentials are configured
   * @returns {boolean} True if credentials are available
   */
  checkSupabaseCredentials() {
    try {
      const supabaseUrl = localStorage.getItem('eecol-supabase-url');
      const supabaseKey = localStorage.getItem('eecol-supabase-key');

      // Check if credentials exist and are not empty
      const hasUrl = supabaseUrl && supabaseUrl.trim() !== '';
      const hasKey = supabaseKey && supabaseKey.trim() !== '';

      if (!hasUrl || !hasKey) {
        console.log('ℹ️ No Supabase credentials found in localStorage. Using IndexedDB only.');
        return false;
      }

      console.log('✅ Supabase credentials found');
      return true;
    } catch (error) {
      console.error('Error checking Supabase credentials:', error);
      return false;
    }
  }

  /**
   * Load storage mode from localStorage with fallback to IndexedDB
   * @returns {string} Storage mode ('indexeddb', 'supabase', or 'hybrid')
   */
  loadStorageMode() {
    try {
      const mode = localStorage.getItem('eecol-storage-mode');
      if (['indexeddb', 'supabase', 'hybrid'].includes(mode)) {
        return mode;
      }
    } catch (error) {
      console.error('Error loading storage mode from localStorage:', error);
    }
    return 'indexeddb'; // Default fallback
  }

  /**
   * Set storage mode and reinitialize if necessary
   * @param {string} mode - New storage mode ('indexeddb', 'supabase', or 'hybrid')
   * @returns {Promise<void>}
   */
  async setStorageMode(mode) {
    if (!['indexeddb', 'supabase', 'hybrid'].includes(mode)) {
      throw new Error('Invalid storage mode. Must be: indexeddb, supabase, or hybrid');
    }

    if (mode === this.mode) return;

    const oldMode = this.mode;
    this.mode = mode;

    try {
      // Save to localStorage
      localStorage.setItem('eecol-storage-mode', mode);

      // Reinitialize with new mode
      this.initialized = false;
      await this.initialize();

      console.error('Storage mode changed from', oldMode, 'to', mode);
    } catch (error) {
      // Revert on failure
      this.mode = oldMode;
      localStorage.setItem('eecol-storage-mode', oldMode);
      console.error('Failed to change storage mode:', error);
      throw error;
    }
  }

  /**
   * Get current storage mode
   * @returns {string} Current storage mode
   */
  getStorageMode() {
    return this.mode;
  }

  /**
   * Setup connectivity monitoring for online/offline detection
   */
  setupConnectivityMonitoring() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.error('Connection restored - processing offline queue');
      this.processOfflineQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.error('Connection lost - operations will be queued');
    });
  }

  /**
   * Setup real-time synchronization (placeholder for future implementation)
   */
  setupRealtimeSync() {
    // TODO: Implement real-time sync setup
    // This will be implemented when Supabase client is ready
  }

  /**
   * Process offline operation queue when connection is restored
   * @returns {Promise<void>}
   */
  async processOfflineQueue() {
    if (!this.isOnline || this.syncQueue.length === 0 || !this.supabase) return;

    console.error('Processing', this.syncQueue.length, 'queued operations');

    const processedItems = [];
    const failedItems = [];

    for (const item of this.syncQueue) {
      try {
        await this.executeQueuedOperation(item);
        processedItems.push(item.id);
        console.error('Successfully processed queued operation:', item.operation, item.storeName);
      } catch (error) {
        item.retries++;
        console.error('Failed to process queued operation (attempt', item.retries, '):', error);

        if (item.retries >= 3) {
          // Max retries reached, mark as permanently failed
          failedItems.push(item.id);
          console.error('Operation failed permanently after 3 attempts:', item.operation, item.storeName);
        }
      }
    }

    // Remove successfully processed items
    this.syncQueue = this.syncQueue.filter(item => !processedItems.includes(item.id));

    // Remove permanently failed items (after 3 retries)
    this.syncQueue = this.syncQueue.filter(item => !failedItems.includes(item.id));

    // Save updated queue
    try {
      await this.saveOfflineQueue();
    } catch (error) {
      console.error('Failed to save updated queue after processing:', error);
    }

    if (processedItems.length > 0) {
      console.error('Queue processing complete:', processedItems.length, 'successful,', failedItems.length, 'failed permanently');
    }
  }

  /**
   * Execute a single queued operation
   * @param {Object} item - Queue item to execute
   * @returns {Promise<void>}
   */
  async executeQueuedOperation(item) {
    const { operation, storeName, data } = item;

    switch (operation) {
      case 'add':
        await this.supabase.add(storeName, data);
        break;
      case 'update':
        await this.supabase.update(storeName, data);
        break;
      case 'delete':
        await this.supabase.delete(storeName, data); // data is the key for delete
        break;
      default:
        throw new Error('Unknown queued operation: ' + operation);
    }
  }

  /**
   * Queue an operation for offline processing
   * @param {string} operation - Operation type ('add', 'update', 'delete')
   * @param {string} storeName - Object store name
   * @param {*} data - Operation data
   */
  async queueOfflineOperation(operation, storeName, data) {
    const queueItem = {
      id: crypto.randomUUID(),
      operation,
      storeName,
      data,
      timestamp: Date.now(),
      retries: 0
    };

    this.syncQueue.push(queueItem);

    // Persist queue to IndexedDB
    try {
      await this.saveOfflineQueue();
      console.error('Operation queued for offline processing:', operation, storeName);
    } catch (error) {
      console.error('Failed to persist offline queue:', error);
    }
  }

  /**
   * Save offline queue to IndexedDB
   * @returns {Promise<void>}
   */
  async saveOfflineQueue() {
    if (!this.indexedDB) return;

    try {
      const queueData = {
        id: 'sync-queue',
        queue: this.syncQueue,
        lastUpdated: Date.now()
      };

      await this.indexedDB.update('settings', queueData);
    } catch (error) {
      console.error('Failed to save offline queue to IndexedDB:', error);
      throw error;
    }
  }

  /**
   * Load offline queue from IndexedDB
   * @returns {Promise<void>}
   */
  async loadOfflineQueue() {
    if (!this.indexedDB) return;

    try {
      const queueData = await this.indexedDB.get('settings', 'sync-queue');
      if (queueData && queueData.queue) {
        this.syncQueue = queueData.queue;
        console.error('Loaded', this.syncQueue.length, 'queued operations from IndexedDB');
      }
    } catch (error) {
      console.error('Failed to load offline queue from IndexedDB:', error);
      // Initialize empty queue if loading fails
      this.syncQueue = [];
    }
  }

  /**
   * Unified add operation across all storage modes
   * @param {string} storeName - Object store name
   * @param {*} data - Data to add
   * @returns {Promise<string>} ID of added record
   */
  async add(storeName, data) {
    this.ensureInitialized();

    switch (this.mode) {
      case 'indexeddb':
        return await this.indexedDB.add(storeName, data);

      case 'supabase':
        return await this.supabase.add(storeName, data);

      case 'hybrid':
        // Write to IndexedDB first for immediate response
        const localResult = await this.indexedDB.add(storeName, data);

        // Then attempt Supabase write (async, don't wait)
        try {
          await this.supabase.add(storeName, data);
        } catch (error) {
          console.error('Supabase write failed in hybrid mode, queuing:', error);
          this.queueOfflineOperation('add', storeName, data);
        }

        return localResult;

      default:
        throw new Error('Invalid storage mode: ' + this.mode);
    }
  }

  /**
   * Unified get operation across all storage modes
   * @param {string} storeName - Object store name
   * @param {string} key - Record key/ID
   * @returns {Promise<*>} Retrieved data
   */
  async get(storeName, key) {
    this.ensureInitialized();

    switch (this.mode) {
      case 'indexeddb':
        return await this.indexedDB.get(storeName, key);

      case 'supabase':
        return await this.supabase.get(storeName, key);

      case 'hybrid':
        // Try IndexedDB first for speed
        try {
          const localData = await this.indexedDB.get(storeName, key);
          if (localData) return localData;
        } catch (error) {
          console.error('IndexedDB get failed in hybrid mode:', error);
        }

        // Fallback to Supabase
        return await this.supabase.get(storeName, key);

      default:
        throw new Error('Invalid storage mode: ' + this.mode);
    }
  }

  /**
   * Unified getAll operation across all storage modes
   * @param {string} storeName - Object store name
   * @returns {Promise<Array>} Array of all records
   */
  async getAll(storeName) {
    this.ensureInitialized();

    switch (this.mode) {
      case 'indexeddb':
        return await this.indexedDB.getAll(storeName);

      case 'supabase':
        return await this.supabase.getAll(storeName);

      case 'hybrid':
        // Try IndexedDB first for speed
        try {
          const localData = await this.indexedDB.getAll(storeName);
          if (localData && localData.length > 0) return localData;
        } catch (error) {
          console.error('IndexedDB getAll failed in hybrid mode:', error);
        }

        // Fallback to Supabase
        return await this.supabase.getAll(storeName);

      default:
        throw new Error('Invalid storage mode: ' + this.mode);
    }
  }

  /**
   * Unified update operation across all storage modes
   * @param {string} storeName - Object store name
   * @param {*} data - Updated data (must include ID)
   * @returns {Promise<void>}
   */
  async update(storeName, data) {
    this.ensureInitialized();

    switch (this.mode) {
      case 'indexeddb':
        return await this.indexedDB.update(storeName, data);

      case 'supabase':
        return await this.supabase.update(storeName, data);

      case 'hybrid':
        // Update IndexedDB first
        await this.indexedDB.update(storeName, data);

        // Then attempt Supabase update
        try {
          await this.supabase.update(storeName, data);
        } catch (error) {
          console.error('Supabase update failed in hybrid mode, queuing:', error);
          this.queueOfflineOperation('update', storeName, data);
        }
        break;

      default:
        throw new Error('Invalid storage mode: ' + this.mode);
    }
  }

  /**
   * Unified delete operation across all storage modes
   * @param {string} storeName - Object store name
   * @param {string} key - Record key/ID to delete
   * @returns {Promise<void>}
   */
  async delete(storeName, key) {
    this.ensureInitialized();

    switch (this.mode) {
      case 'indexeddb':
        return await this.indexedDB.delete(storeName, key);

      case 'supabase':
        return await this.supabase.delete(storeName, key);

      case 'hybrid':
        // Delete from IndexedDB first
        await this.indexedDB.delete(storeName, key);

        // Then attempt Supabase delete
        try {
          await this.supabase.delete(storeName, key);
        } catch (error) {
          console.error('Supabase delete failed in hybrid mode, queuing:', error);
          this.queueOfflineOperation('delete', storeName, key);
        }
        break;

      default:
        throw new Error('Invalid storage mode: ' + this.mode);
    }
  }

  /**
   * Unified clear operation across all storage modes
   * @param {string} storeName - Object store name to clear
   * @returns {Promise<void>}
   */
  async clear(storeName) {
    this.ensureInitialized();

    switch (this.mode) {
      case 'indexeddb':
        return await this.indexedDB.clear(storeName);

      case 'supabase':
        return await this.supabase.clear(storeName);

      case 'hybrid':
        // Clear both stores
        await Promise.all([
          this.indexedDB.clear(storeName),
          this.supabase.clear(storeName).catch(error => {
            console.error('Supabase clear failed in hybrid mode:', error);
          })
        ]);
        break;

      default:
        throw new Error('Invalid storage mode: ' + this.mode);
    }
  }

  /**
   * Migrate data from IndexedDB to Supabase
   * @param {Function} progressCallback - Optional callback for progress updates
   * @returns {Promise<Object>} Migration results
   */
  async migrateToSupabase(progressCallback = null) {
    this.ensureInitialized();

    if (this.mode === 'indexeddb') {
      throw new Error('Cannot migrate in IndexedDB-only mode');
    }

    const results = {
      totalRecords: 0,
      migratedRecords: 0,
      failedRecords: 0,
      errors: [],
      stores: {}
    };

    // Define store mappings (IndexedDB store name -> Supabase table name)
    const storeMappings = {
      cuttingRecords: 'cutting_records',
      inventoryRecords: 'inventory_records',
      maintenanceLogs: 'maintenance_logs',
      calculatorHistory: 'calculator_history',
      settings: 'app_settings',
      notifications: 'notifications'
    };

    console.error('Starting migration from IndexedDB to Supabase');

    // Process each store
    for (const [storeName, tableName] of Object.entries(storeMappings)) {
      try {
        console.error('Migrating store:', storeName, '->', tableName);

        // Get all data from IndexedDB store
        const records = await this.indexedDB.getAll(storeName);
        if (!records || records.length === 0) {
          console.error('No records found in store:', storeName);
          continue;
        }

        results.stores[storeName] = {
          total: records.length,
          migrated: 0,
          failed: 0
        };

        results.totalRecords += records.length;

        // Transform and upload records in batches
        const batchSize = 50;
        for (let i = 0; i < records.length; i += batchSize) {
          const batch = records.slice(i, i + batchSize);
          const transformedBatch = batch.map(record => this.transformForSupabase(record, tableName));

          try {
            // Insert batch into Supabase
            const { data, error } = await this.supabase.client
              .from(tableName)
              .insert(transformedBatch)
              .select();

            if (error) throw error;

            results.migratedRecords += data.length;
            results.stores[storeName].migrated += data.length;

            // Progress callback
            if (progressCallback) {
              progressCallback({
                store: storeName,
                processed: Math.min(i + batchSize, records.length),
                total: records.length,
                overall: {
                  migrated: results.migratedRecords,
                  total: results.totalRecords
                }
              });
            }

          } catch (error) {
            console.error('Failed to migrate batch for', storeName, ':', error);
            results.errors.push({
              store: storeName,
              error: error.message,
              batch: i / batchSize
            });
            results.failedRecords += batch.length;
            results.stores[storeName].failed += batch.length;
          }
        }

        console.error('Completed migration for store:', storeName, '-', results.stores[storeName]);

      } catch (error) {
        console.error('Failed to migrate store:', storeName, error);
        results.errors.push({
          store: storeName,
          error: error.message
        });
      }
    }

    console.error('Migration complete:', results);
    return results;
  }

  /**
   * Transform data from IndexedDB format to Supabase format
   * @param {Object} record - IndexedDB record
   * @param {string} tableName - Supabase table name
   * @returns {Object} Transformed record for Supabase
   */
  transformForSupabase(record, tableName) {
    const transformed = { ...record };

    // Convert camelCase to snake_case for database columns
    const camelToSnake = (str) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

    // Transform keys
    Object.keys(transformed).forEach(key => {
      if (key !== 'id') { // Keep 'id' as is for primary keys
        const snakeKey = camelToSnake(key);
        if (snakeKey !== key) {
          transformed[snakeKey] = transformed[key];
          delete transformed[key];
        }
      }
    });

    // Add timestamps if not present
    const now = new Date().toISOString();
    if (!transformed.created_at) {
      transformed.created_at = now;
    }
    if (!transformed.updated_at) {
      transformed.updated_at = now;
    }

    // Handle specific table transformations
    switch (tableName) {
      case 'cutting_records':
        // Ensure required fields exist
        if (!transformed.wire_type) transformed.wire_type = '';
        if (!transformed.operator) transformed.operator = '';
        break;

      case 'inventory_records':
        // Ensure numeric fields
        if (transformed.current_stock !== undefined) {
          transformed.current_stock = parseFloat(transformed.current_stock) || 0;
        }
        if (transformed.min_stock !== undefined) {
          transformed.min_stock = parseFloat(transformed.min_stock) || 0;
        }
        break;

      case 'calculator_history':
        // Calculator history has different structure
        if (transformed.tool_name && transformed.input_data) {
          // Already in correct format
        }
        break;
    }

    // Remove IndexedDB-specific fields that shouldn't go to Supabase
    delete transformed.deleted_at; // We'll handle soft deletes differently

    return transformed;
  }

  /**
   * Sync data from Supabase to IndexedDB
   * @param {Function} progressCallback - Optional callback for progress updates
   * @returns {Promise<Object>} Sync results
   */
  async syncFromSupabase(progressCallback = null) {
    this.ensureInitialized();

    if (this.mode === 'indexeddb') {
      throw new Error('Cannot sync from Supabase in IndexedDB-only mode');
    }

    const results = {
      totalRecords: 0,
      syncedRecords: 0,
      failedRecords: 0,
      errors: [],
      stores: {}
    };

    // Define store mappings (Supabase table name -> IndexedDB store name)
    const tableMappings = {
      cutting_records: 'cuttingRecords',
      inventory_records: 'inventoryRecords',
      maintenance_logs: 'maintenanceLogs',
      calculator_history: 'calculatorHistory',
      app_settings: 'settings',
      notifications: 'notifications'
    };

    console.error('Starting sync from Supabase to IndexedDB');

    // Process each table
    for (const [tableName, storeName] of Object.entries(tableMappings)) {
      try {
        console.error('Syncing table:', tableName, '->', storeName);

        // Get all data from Supabase table (exclude soft-deleted records)
        const { data: records, error } = await this.supabase.client
          .from(tableName)
          .select('*')
          .is('deleted_at', null);

        if (error) throw error;

        if (!records || records.length === 0) {
          console.error('No records found in table:', tableName);
          continue;
        }

        results.stores[storeName] = {
          total: records.length,
          synced: 0,
          failed: 0
        };

        results.totalRecords += records.length;

        // Clear existing IndexedDB store data
        await this.indexedDB.clear(storeName);

        // Transform and insert records in batches
        const batchSize = 50;
        for (let i = 0; i < records.length; i += batchSize) {
          const batch = records.slice(i, i + batchSize);
          const transformedBatch = batch.map(record => this.transformFromSupabase(record, storeName));

          // Insert each record individually (IndexedDB doesn't support batch insert)
          for (const record of transformedBatch) {
            try {
              await this.indexedDB.add(storeName, record);
              results.syncedRecords++;
              results.stores[storeName].synced++;
            } catch (error) {
              console.error('Failed to sync record to IndexedDB:', error);
              results.errors.push({
                store: storeName,
                recordId: record.id,
                error: error.message
              });
              results.failedRecords++;
              results.stores[storeName].failed++;
            }
          }

          // Progress callback
          if (progressCallback) {
            progressCallback({
              store: storeName,
              processed: Math.min(i + batchSize, records.length),
              total: records.length,
              overall: {
                synced: results.syncedRecords,
                total: results.totalRecords
              }
            });
          }
        }

        console.error('Completed sync for store:', storeName, '-', results.stores[storeName]);

      } catch (error) {
        console.error('Failed to sync table:', tableName, error);
        results.errors.push({
          table: tableName,
          error: error.message
        });
      }
    }

    console.error('Sync complete:', results);
    return results;
  }

  /**
   * Transform data from Supabase format to IndexedDB format
   * @param {Object} record - Supabase record
   * @param {string} storeName - IndexedDB store name
   * @returns {Object} Transformed record for IndexedDB
   */
  transformFromSupabase(record, storeName) {
    const transformed = { ...record };

    // Convert snake_case to camelCase for JavaScript objects
    const snakeToCamel = (str) => str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

    // Transform keys
    Object.keys(transformed).forEach(key => {
      const camelKey = snakeToCamel(key);
      if (camelKey !== key) {
        transformed[camelKey] = transformed[key];
        delete transformed[key];
      }
    });

    // Remove Supabase-specific fields that shouldn't be in IndexedDB
    delete transformed.created_at;
    delete transformed.updated_at;
    delete transformed.user_id; // Multi-user not implemented yet

    return transformed;
  }

  /**
   * Ensure adapter is initialized before operations
   * @private
   */
  ensureInitialized() {
    if (!this.initialized) {
      throw new Error('StorageAdapter must be initialized before use. Call initialize() first.');
    }

    // Check if we have any working storage backend
    if (!this.indexedDB && !this.supabase) {
      throw new Error('No storage backend available. StorageAdapter initialization may have failed.');
    }
  }

  /**
   * Check if the adapter is ready to use
   * @returns {boolean} True if initialized and has a working backend
   */
  isReady() {
    return this.initialized && (this.indexedDB !== null || this.supabase !== null);
  }

  /**
   * Get detailed status information
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      initialized: this.initialized,
      mode: this.mode,
      hasIndexedDB: this.indexedDB !== null,
      hasSupabase: this.supabase !== null,
      isOnline: this.isOnline,
      queuedOperations: this.syncQueue.length
    };
  }
}

// Export for use in other modules
window.StorageAdapter = StorageAdapter;
