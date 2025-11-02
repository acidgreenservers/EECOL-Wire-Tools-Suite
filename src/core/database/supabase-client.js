/**
 * SupabaseClient - Cloud database client for EECOL Wire Tools Suite
 *
 * Provides cloud database operations with Supabase integration, including
 * CRUD operations, real-time subscriptions, and data transformation.
 *
 * @author Claude AI
 * @version 1.0.0
 * @since Phase 3 Supabase Migration
 */

class SupabaseClient {
  /**
   * Constructor - Initialize Supabase client with configuration
   */
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.connectionStatus = 'disconnected';
    this.tableMap = {};
    this.subscriptions = new Map();
    this.auth = null;

    // Bind methods
    this.initialize = this.initialize.bind(this);
    this.createTableMap = this.createTableMap.bind(this);
    this.transformToSupabase = this.transformToSupabase.bind(this);
    this.transformFromSupabase = this.transformFromSupabase.bind(this);
    this.add = this.add.bind(this);
    this.get = this.get.bind(this);
    this.getAll = this.getAll.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.clear = this.clear.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.unsubscribe = this.unsubscribe.bind(this);
  }

  /**
   * Initialize Supabase client with connection test
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      // Get Supabase configuration from localStorage or use defaults
      let supabaseUrl = localStorage.getItem('eecol-supabase-url');
      let supabaseKey = localStorage.getItem('eecol-supabase-key');

      // Fallback to hardcoded values if not configured
      if (!supabaseUrl) {
        supabaseUrl = 'https://nywkaaqumyxpqecbenyw.supabase.co';
      }
      if (!supabaseKey) {
        supabaseKey = 'sb_publishable_ICiwfRDDsh3AKvi8iSKs3Q_ccRraE0i';
      }

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration missing. Please configure Supabase URL and key in settings.');
      }

      // Dynamically import Supabase client
      console.log('Importing Supabase client...');
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      console.log('Supabase client imported successfully');

      // Initialize Supabase client
      this.client = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      });

      // Create table name mappings
      this.createTableMap();

      // Test connection
      await this.testConnection();

      // Setup auth state change listener
      this.setupAuthListener();

      this.isConnected = true;
      this.connectionStatus = 'connected';

      console.log('SupabaseClient initialized successfully');

    } catch (error) {
      this.connectionStatus = 'error';
      console.error('SupabaseClient initialization failed:', error);
      throw new Error(`Failed to initialize Supabase client: ${error.message}`);
    }
  }

  /**
   * Test database connection
   * @returns {Promise<void>}
   */
  async testConnection() {
    if (!this.client) {
      throw new Error('Supabase client not initialized');
    }

    try {
      // Test connection by querying a table that definitely has an id column
      const { data, error } = await this.client
        .from('cutting_records')
        .select('id')
        .limit(1);

      if (error) {
        // If the table doesn't exist or other error, try a different approach
        // Just check if we can connect by getting the current user (which may be null)
        const { data: userData, error: userError } = await this.client.auth.getUser();
        if (userError && userError.message !== 'Auth session missing!') {
          throw userError;
        }
      }

      console.log('Supabase connection test successful');
    } catch (error) {
      console.error('Supabase connection test failed:', error);
      throw error;
    }
  }

  /**
   * Setup authentication state change listener
   */
  setupAuthListener() {
    if (!this.client) return;

    this.client.auth.onAuthStateChange((event, session) => {
      console.log('Supabase auth state changed:', event, session?.user?.id || 'no user');

      if (event === 'SIGNED_IN') {
        this.auth = {
          user: session.user,
          session: session
        };
      } else if (event === 'SIGNED_OUT') {
        this.auth = null;
      }
    });
  }

  /**
   * Create table name mapping from IndexedDB stores to Supabase tables
   */
  createTableMap() {
    this.tableMap = {
      cuttingRecords: 'cutting_records',
      inventoryRecords: 'inventory_records',
      maintenanceLogs: 'maintenance_logs',
      calculatorHistory: 'calculator_history',
      settings: 'app_settings',
      notifications: 'notifications'
    };
  }

  /**
   * Transform data from JavaScript/IndexedDB format to Supabase format
   * @param {Object} data - Data to transform
   * @param {string} storeName - IndexedDB store name
   * @returns {Object} Transformed data for Supabase
   */
  transformToSupabase(data, storeName) {
    if (!data) return data;

    const transformed = { ...data };

    // Convert camelCase to snake_case for database columns
    const camelToSnake = (str) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

    // Transform all keys
    Object.keys(transformed).forEach(key => {
      const snakeKey = camelToSnake(key);
      if (snakeKey !== key) {
        transformed[snakeKey] = transformed[key];
        delete transformed[key];
      }
    });

    // Add timestamps
    const now = new Date().toISOString();
    if (!transformed.created_at) {
      transformed.created_at = now;
    }
    transformed.updated_at = now;

    // Handle specific store transformations
    switch (storeName) {
      case 'cuttingRecords':
        // Ensure required fields for cutting records
        if (!transformed.wire_type) transformed.wire_type = '';
        if (!transformed.operator) transformed.operator = '';
        if (!transformed.quantity) transformed.quantity = 0;
        // Map 'date' field to 'timestamp' for database compatibility
        if (transformed.date && !transformed.timestamp) {
          transformed.timestamp = transformed.date;
          delete transformed.date;
        }
        break;

      case 'inventoryRecords':
        // Ensure numeric fields for inventory
        if (transformed.current_stock !== undefined) {
          transformed.current_stock = parseFloat(transformed.current_stock) || 0;
        }
        if (transformed.min_stock !== undefined) {
          transformed.min_stock = parseFloat(transformed.min_stock) || 0;
        }
        if (transformed.max_stock !== undefined) {
          transformed.max_stock = parseFloat(transformed.max_stock) || 0;
        }
        break;

      case 'maintenanceLogs':
        // Ensure maintenance log fields
        if (!transformed.equipment_id) transformed.equipment_id = '';
        if (!transformed.technician) transformed.technician = '';
        if (!transformed.date) transformed.date = now.split('T')[0];
        break;

      case 'calculatorHistory':
        // Calculator history has unified storage - ensure tool_name is present
        if (!transformed.tool_name) {
          console.warn('Calculator history record missing tool_name field');
        }
        break;

      case 'settings':
        // Settings can have various data types, ensure proper JSON storage
        if (typeof transformed.value === 'object') {
          transformed.value = JSON.stringify(transformed.value);
        }
        break;

      case 'notifications':
        // Ensure notification fields
        if (!transformed.type) transformed.type = 'info';
        if (!transformed.message) transformed.message = '';
        if (!transformed.timestamp) transformed.timestamp = now;
        if (transformed.read === undefined) transformed.read = false;
        break;
    }

    // Remove fields that shouldn't go to Supabase
    delete transformed.deleted_at; // Handle soft deletes separately

    return transformed;
  }

  /**
   * Transform data from Supabase format to JavaScript/IndexedDB format
   * @param {Object} data - Data from Supabase
   * @param {string} storeName - IndexedDB store name
   * @returns {Object} Transformed data for JavaScript use
   */
  transformFromSupabase(data, storeName) {
    if (!data) return data;

    const transformed = { ...data };

    // Convert snake_case to camelCase for JavaScript objects
    const snakeToCamel = (str) => str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

    // Transform all keys
    Object.keys(transformed).forEach(key => {
      const camelKey = snakeToCamel(key);
      if (camelKey !== key) {
        transformed[camelKey] = transformed[key];
        delete transformed[key];
      }
    });

    // Handle specific store transformations
    switch (storeName) {
      case 'cuttingRecords':
        // Map 'timestamp' field back to 'date' for JavaScript compatibility
        if (transformed.timestamp && !transformed.date) {
          transformed.date = transformed.timestamp;
          delete transformed.timestamp;
        }
        break;

      case 'calculatorHistory':
        // Extract calculator data based on tool_name
        if (transformed.toolName && transformed.inputData) {
          // Data is already in correct format
        }
        break;

      case 'settings':
        // Parse JSON values back to objects if needed
        if (typeof transformed.value === 'string') {
          try {
            transformed.value = JSON.parse(transformed.value);
          } catch (e) {
            // Keep as string if not valid JSON
          }
        }
        break;
    }

    // Remove Supabase-specific fields
    delete transformed.created_at;
    delete transformed.updated_at;
    delete transformed.user_id; // Multi-user not implemented yet

    return transformed;
  }

  /**
   * Add a record to Supabase
   * @param {string} storeName - IndexedDB store name
   * @param {Object} data - Data to add
   * @returns {Promise<string>} ID/key of added record
   */
  async add(storeName, data) {
    this.ensureConnected();

    const tableName = this.tableMap[storeName];
    if (!tableName) {
      throw new Error(`Unknown store name: ${storeName}`);
    }

    try {
      const transformedData = this.transformToSupabase(data, storeName);

      let selectField;

      // Handle special case for app_settings table which uses 'name' as primary key
      if (tableName === 'app_settings') {
        // app_settings uses 'name' as primary key, ensure it's present
        if (!transformedData.name) {
          throw new Error('app_settings records must have a name field');
        }
        selectField = 'name';
      } else {
        // For other tables, remove the id field to let database auto-generate UUID
        delete transformedData.id;
        selectField = 'id';
      }

      const { data: result, error } = await this.client
        .from(tableName)
        .insert(transformedData)
        .select(selectField)
        .single();

      if (error) throw error;

      const recordId = result[selectField];
      console.log(`Added record to ${tableName}:`, recordId);
      return recordId;

    } catch (error) {
      console.error(`Failed to add record to ${storeName}:`, error);
      throw new Error(`Failed to add record: ${error.message}`);
    }
  }

  /**
   * Get a record from Supabase by ID/key
   * @param {string} storeName - IndexedDB store name
   * @param {string} key - Record ID/key
   * @returns {Promise<Object|null>} Retrieved record or null if not found
   */
  async get(storeName, key) {
    this.ensureConnected();

    const tableName = this.tableMap[storeName];
    if (!tableName) {
      throw new Error(`Unknown store name: ${storeName}`);
    }

    try {
      // Handle special case for app_settings table which uses 'name' as primary key
      const keyField = tableName === 'app_settings' ? 'name' : 'id';

      const { data, error } = await this.client
        .from(tableName)
        .select('*')
        .eq(keyField, key)
        .is('deleted_at', null)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null;
        }
        throw error;
      }

      const transformed = this.transformFromSupabase(data, storeName);
      return transformed;

    } catch (error) {
      console.error(`Failed to get record from ${storeName}:`, error);
      throw new Error(`Failed to get record: ${error.message}`);
    }
  }

  /**
   * Get all records from Supabase (excluding soft-deleted)
   * @param {string} storeName - IndexedDB store name
   * @returns {Promise<Array>} Array of records
   */
  async getAll(storeName) {
    this.ensureConnected();

    const tableName = this.tableMap[storeName];
    if (!tableName) {
      throw new Error(`Unknown store name: ${storeName}`);
    }

    try {
      const { data, error } = await this.client
        .from(tableName)
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformed = data.map(record => this.transformFromSupabase(record, storeName));
      return transformed;

    } catch (error) {
      console.error(`Failed to get all records from ${storeName}:`, error);
      throw new Error(`Failed to get all records: ${error.message}`);
    }
  }

  /**
   * Update a record in Supabase
   * @param {string} storeName - IndexedDB store name
   * @param {Object} data - Updated data (must include ID/key)
   * @returns {Promise<void>}
   */
  async update(storeName, data) {
    this.ensureConnected();

    // Check for ID or name field depending on table
    const tableName = this.tableMap[storeName];
    if (!tableName) {
      throw new Error(`Unknown store name: ${storeName}`);
    }

    const keyField = tableName === 'app_settings' ? 'name' : 'id';
    const keyValue = data[keyField] || data.id;

    if (!keyValue) {
      throw new Error(`Update operation requires a ${keyField} field`);
    }

    try {
      const transformedData = this.transformToSupabase(data, storeName);

      const { error } = await this.client
        .from(tableName)
        .update(transformedData)
        .eq(keyField, keyValue);

      if (error) throw error;

      console.log(`Updated record in ${tableName}:`, keyValue);

    } catch (error) {
      console.error(`Failed to update record in ${storeName}:`, error);
      throw new Error(`Failed to update record: ${error.message}`);
    }
  }

  /**
   * Soft delete a record in Supabase
   * @param {string} storeName - IndexedDB store name
   * @param {string} key - Record ID/key to delete
   * @returns {Promise<void>}
   */
  async delete(storeName, key) {
    this.ensureConnected();

    const tableName = this.tableMap[storeName];
    if (!tableName) {
      throw new Error(`Unknown store name: ${storeName}`);
    }

    try {
      // Handle special case for app_settings table which uses 'name' as primary key
      const keyField = tableName === 'app_settings' ? 'name' : 'id';

      const { error } = await this.client
        .from(tableName)
        .update({ deleted_at: new Date().toISOString() })
        .eq(keyField, key);

      if (error) throw error;

      console.log(`Soft deleted record from ${tableName}:`, key);

    } catch (error) {
      console.error(`Failed to delete record from ${storeName}:`, error);
      throw new Error(`Failed to delete record: ${error.message}`);
    }
  }

  /**
   * Clear all records from a Supabase table (hard delete)
   * @param {string} storeName - IndexedDB store name
   * @returns {Promise<void>}
   */
  async clear(storeName) {
    this.ensureConnected();

    const tableName = this.tableMap[storeName];
    if (!tableName) {
      throw new Error(`Unknown store name: ${storeName}`);
    }

    try {
      const { error } = await this.client
        .from(tableName)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (error) throw error;

      console.log(`Cleared all records from ${tableName}`);

    } catch (error) {
      console.error(`Failed to clear records from ${storeName}:`, error);
      throw new Error(`Failed to clear records: ${error.message}`);
    }
  }

  /**
   * Subscribe to real-time changes for a table
   * @param {string} storeName - IndexedDB store name
   * @param {Function} callback - Callback function for change events
   * @returns {Object} Subscription object with unsubscribe method
   */
  subscribe(storeName, callback) {
    this.ensureConnected();

    const tableName = this.tableMap[storeName];
    if (!tableName) {
      throw new Error(`Unknown store name: ${storeName}`);
    }

    try {
      const channelName = `${storeName}-changes`;
      const subscription = this.client
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: tableName,
            filter: 'deleted_at=is.null'
          },
          (payload) => {
            console.log(`Realtime event for ${storeName}:`, payload.eventType);

            // Transform the data
            let transformedData = null;
            if (payload.new) {
              transformedData = this.transformFromSupabase(payload.new, storeName);
            } else if (payload.old) {
              transformedData = this.transformFromSupabase(payload.old, storeName);
            }

            // Call the callback with event details
            callback({
              eventType: payload.eventType,
              table: tableName,
              store: storeName,
              data: transformedData,
              raw: payload
            });
          }
        )
        .subscribe();

      // Store subscription for cleanup
      this.subscriptions.set(storeName, subscription);

      console.log(`Subscribed to real-time changes for ${storeName}`);

      return {
        unsubscribe: () => this.unsubscribe(storeName)
      };

    } catch (error) {
      console.error(`Failed to subscribe to ${storeName}:`, error);
      throw new Error(`Failed to subscribe: ${error.message}`);
    }
  }

  /**
   * Unsubscribe from real-time changes for a table
   * @param {string} storeName - IndexedDB store name
   */
  unsubscribe(storeName) {
    const subscription = this.subscriptions.get(storeName);
    if (subscription) {
      this.client.removeChannel(subscription);
      this.subscriptions.delete(storeName);
      console.log(`Unsubscribed from real-time changes for ${storeName}`);
    }
  }

  /**
   * Sign in with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Auth response
   */
  async signIn(email, password) {
    this.ensureConnected();

    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      console.log('User signed in:', data.user.id);
      return data;

    } catch (error) {
      console.error('Sign in failed:', error);
      throw new Error(`Sign in failed: ${error.message}`);
    }
  }

  /**
   * Sign out current user
   * @returns {Promise<void>}
   */
  async signOut() {
    this.ensureConnected();

    try {
      const { error } = await this.client.auth.signOut();

      if (error) throw error;

      console.log('User signed out');

    } catch (error) {
      console.error('Sign out failed:', error);
      throw new Error(`Sign out failed: ${error.message}`);
    }
  }

  /**
   * Get current user information
   * @returns {Object|null} Current user or null if not authenticated
   */
  getUser() {
    return this.auth?.user || null;
  }

  /**
   * Ensure client is connected before operations
   * @private
   */
  ensureConnected() {
    if (!this.isConnected || !this.client) {
      throw new Error('SupabaseClient is not connected. Call initialize() first.');
    }
  }
}

// Export for use in other modules
window.SupabaseClient = SupabaseClient;
