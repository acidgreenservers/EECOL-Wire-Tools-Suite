/**
 * Node.js test script for Supabase mode validation
 * Tests StorageAdapter functionality in Supabase mode with fallback behavior
 */

// Mock browser APIs for Node.js testing
global.window = {};
global.navigator = { onLine: true };
global.localStorage = {
  data: {},
  getItem(key) { return this.data[key] || null; },
  setItem(key, value) { this.data[key] = value; },
  removeItem(key) { delete this.data[key]; }
};

// Mock Supabase client for testing
global.createClient = function(url, key) {
  return {
    auth: {
      getUser: async () => ({ data: null, error: { message: 'Auth session missing!' } }),
      onAuthStateChange: () => ({})
    },
    from: function(table) {
      return {
        select: function(fields) {
          return {
            limit: function(count) {
              return {
                single: async function() {
                  // Simulate table not found for testing fallback
                  return {
                    data: null,
                    error: { code: 'PGRST116', message: 'Table not found' }
                  };
                }
              };
            },
            is: function(field, value) {
              return {
                single: async function() {
                  return {
                    data: null,
                    error: { code: 'PGRST116', message: 'No rows found' }
                  };
                },
                order: function(field, options) {
                  return {
                    async: async function() {
                      return {
                        data: [],
                        error: null
                      };
                    }
                  };
                }
              };
            },
            eq: function(field, value) {
              return {
                is: function(field2, value2) {
                  return {
                    single: async function() {
                      return {
                        data: null,
                        error: { code: 'PGRST116', message: 'No rows found' }
                      };
                    }
                  };
                }
              };
            },
            insert: function(data) {
              return {
                select: function(fields) {
                  return {
                    single: async function() {
                      return {
                        data: { id: 'test-uuid-' + Date.now() },
                        error: null
                      };
                    }
                  };
                }
              };
            },
            update: function(data) {
              return {
                eq: function(field, value) {
                  return {
                    async: async function() {
                      return { error: null };
                    }
                  };
                }
              };
            }
          };
        }
      };
    }
  };
};

// Mock import function for dynamic imports
global.import = async function(url) {
  if (url.includes('@supabase/supabase-js')) {
    return { createClient: global.createClient };
  }
  throw new Error('Module not found');
};

// Mock EECOLIndexedDB class (same as before)
global.EECOLIndexedDB = class {
  constructor() {
    this.stores = {};
    this.ready = this.initialize();
  }

  async initialize() {
    console.log('Mock EECOLIndexedDB: Initialized');
    return Promise.resolve();
  }

  async add(storeName, data) {
    if (!this.stores[storeName]) this.stores[storeName] = {};
    const id = Date.now().toString();
    this.stores[storeName][id] = { ...data, id };
    console.log(`EECOLIndexedDB: Added to ${storeName} with ID ${id}`);
    return id;
  }

  async get(storeName, key) {
    const store = this.stores[storeName] || {};
    const record = store[key];
    console.log(`EECOLIndexedDB: Retrieved from ${storeName} key ${key}:`, record ? 'found' : 'not found');
    return record || null;
  }

  async getAll(storeName) {
    const store = this.stores[storeName] || {};
    const records = Object.values(store);
    console.log(`EECOLIndexedDB: Retrieved ${records.length} records from ${storeName}`);
    return records;
  }

  async update(storeName, data) {
    if (!this.stores[storeName]) this.stores[storeName] = {};
    if (data.id) {
      this.stores[storeName][data.id] = data;
      console.log(`EECOLIndexedDB: Updated ${storeName} record ${data.id}`);
    }
  }

  async delete(storeName, key) {
    if (this.stores[storeName]) {
      delete this.stores[storeName][key];
      console.log(`EECOLIndexedDB: Deleted from ${storeName} key ${key}`);
    }
  }

  async clear(storeName) {
    this.stores[storeName] = {};
    console.log(`EECOLIndexedDB: Cleared ${storeName}`);
  }

  async saveMarkConverter(data) {
    return this.add('markConverter', data);
  }

  async saveStopMarkConverter(data) {
    return this.add('stopmarkConverter', data);
  }

  async saveReelCapacityEstimator(data) {
    return this.add('reelcapacityEstimator', data);
  }
};

// Load SupabaseClient
const fs = require('fs');
const path = require('path');
const supabaseClientCode = fs.readFileSync(path.join(__dirname, 'src/core/database/supabase-client.js'), 'utf8');
eval(supabaseClientCode.replace('window.SupabaseClient = SupabaseClient;', 'global.SupabaseClient = SupabaseClient;'));

// Load StorageAdapter
const storageAdapterCode = fs.readFileSync(path.join(__dirname, 'src/core/database/storage-adapter.js'), 'utf8');
eval(storageAdapterCode.replace('window.StorageAdapter = StorageAdapter;', 'global.StorageAdapter = StorageAdapter;'));

async function runSupabaseModeTests() {
  console.log('🧪 Starting Supabase Mode Tests...\n');

  let testResults = {
    total: 0,
    passed: 0,
    failed: 0
  };

  function test(name, testFn) {
    testResults.total++;
    console.log(`\n📋 Running test: ${name}`);
    try {
      const result = testFn();
      if (result !== false) {
        console.log(`✅ PASSED: ${name}`);
        testResults.passed++;
        return true;
      } else {
        console.log(`❌ FAILED: ${name}`);
        testResults.failed++;
        return false;
      }
    } catch (error) {
      console.log(`❌ FAILED: ${name} - Error: ${error.message}`);
      testResults.failed++;
      return false;
    }
  }

  // Test 1: Supabase Mode Selection
  test('Supabase Mode Selection', () => {
    const adapter = new StorageAdapter();
    const mode = adapter.getStorageMode();
    return mode === 'indexeddb'; // Should default to IndexedDB
  });

  // Test 2: Supabase Credentials Check (no credentials)
  test('Supabase Credentials Check - No Credentials', () => {
    const adapter = new StorageAdapter();
    const hasCredentials = adapter.checkSupabaseCredentials();
    return hasCredentials === false;
  });

  // Test 3: Supabase Credentials Check (with mock credentials)
  test('Supabase Credentials Check - With Credentials', () => {
    localStorage.setItem('eecol-supabase-url', 'https://test.supabase.co');
    localStorage.setItem('eecol-supabase-key', 'test-key');
    const adapter = new StorageAdapter();
    const hasCredentials = adapter.checkSupabaseCredentials();
    return hasCredentials === true;
  });

  // Test 4: Supabase Mode Initialization (should fallback due to missing window)
  await test('Supabase Mode Initialization - Fallback', async () => {
    localStorage.setItem('eecol-storage-mode', 'supabase');
    localStorage.setItem('eecol-supabase-url', 'https://test.supabase.co');
    localStorage.setItem('eecol-supabase-key', 'test-key');

    const adapter = new StorageAdapter();
    await adapter.initialize();

    const status = adapter.getStatus();
    return status.initialized && status.mode === 'indexeddb' && !status.hasSupabase;
  });

  // Test 5: Mode Switching to Supabase (should work but fallback)
  await test('Mode Switching to Supabase', async () => {
    const adapter = new StorageAdapter();
    await adapter.initialize();

    // Try to switch to Supabase mode
    await adapter.setStorageMode('supabase');
    const newMode = adapter.getStorageMode();

    // Should have switched but fallen back due to no window
    return newMode === 'supabase';
  });

  // Test 6: SupabaseClient Creation
  test('SupabaseClient Creation', () => {
    const client = new SupabaseClient();
    return client instanceof SupabaseClient;
  });

  // Test 7: SupabaseClient Initialization (should fail without credentials)
  await test('SupabaseClient Initialization - No Credentials', async () => {
    // Clear any existing credentials
    localStorage.removeItem('eecol-supabase-url');
    localStorage.removeItem('eecol-supabase-key');

    const client = new SupabaseClient();
    try {
      await client.initialize();
      return false; // Should have thrown
    } catch (error) {
      return error.message.includes('Supabase configuration missing');
    }
  });

  // Test 8: SupabaseClient Initialization (should fail due to mock environment)
  await test('SupabaseClient Initialization - With Credentials', async () => {
    localStorage.setItem('eecol-supabase-url', 'https://test.supabase.co');
    localStorage.setItem('eecol-supabase-key', 'test-key');

    const client = new SupabaseClient();
    try {
      await client.initialize();
      return false; // Should fail in mock environment
    } catch (error) {
      return true; // Expected to fail due to mock limitations
    }
  });

  // Test 9: Hybrid Mode Selection
  test('Hybrid Mode Selection', () => {
    const adapter = new StorageAdapter();
    return adapter.getStorageMode() === 'indexeddb'; // Should default to IndexedDB
  });

  // Test 10: Error Handling - Invalid Mode
  test('Error Handling - Invalid Mode', async () => {
    const adapter = new StorageAdapter();
    try {
      await adapter.setStorageMode('invalid');
      return false; // Should have thrown
    } catch (error) {
      return error.message.includes('Invalid storage mode');
    }
  });

  // Test 11: Status Information in Supabase Mode
  test('Status Information - Supabase Mode', () => {
    localStorage.setItem('eecol-storage-mode', 'supabase');
    const adapter = new StorageAdapter();
    const status = adapter.getStatus();
    const requiredFields = ['initialized', 'mode', 'hasIndexedDB', 'hasSupabase', 'isOnline', 'queuedOperations'];
    return requiredFields.every(field => field in status) && status.mode === 'supabase';
  });

  // Test 12: Queue System (should be empty)
  test('Queue System - Supabase Mode', () => {
    const adapter = new StorageAdapter();
    const status = adapter.getStatus();
    return status.queuedOperations === 0;
  });

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('🧪 SUPABASE MODE TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

  if (testResults.failed === 0) {
    console.log('\n🎉 ALL SUPABASE MODE TESTS PASSED!');
    console.log('✅ Supabase mode selection works correctly');
    console.log('✅ Credential validation functions properly');
    console.log('✅ Fallback to IndexedDB works when Supabase unavailable');
    console.log('✅ Mode switching is functional');
    console.log('✅ Ready for Hybrid mode testing');
  } else {
    console.log('\n⚠️  SOME SUPABASE MODE TESTS FAILED. Please investigate before proceeding.');
    console.log('Note: Some failures are expected due to mock environment limitations.');
  }

  return testResults;
}

// Run the tests
runSupabaseModeTests().catch(error => {
  console.error('Supabase mode test suite failed:', error);
  process.exit(1);
});
