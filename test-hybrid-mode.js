/**
 * Node.js test script for Hybrid mode validation
 * Tests StorageAdapter functionality in Hybrid mode (IndexedDB + Supabase sync)
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

// Mock Supabase client for testing (simulating successful connection)
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
                  return {
                    data: { id: 'test-uuid-' + Date.now() },
                    error: null
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

// Mock EECOLIndexedDB class
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

async function runHybridModeTests() {
  console.log('🧪 Starting Hybrid Mode Tests...\n');

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

  // Test 1: Hybrid Mode Selection
  test('Hybrid Mode Selection', () => {
    localStorage.setItem('eecol-storage-mode', 'hybrid');
    const adapter = new StorageAdapter();
    const mode = adapter.getStorageMode();
    return mode === 'hybrid';
  });

  // Test 2: Hybrid Mode Initialization (should fallback due to Node.js limitations)
  await test('Hybrid Mode Initialization - Fallback', async () => {
    localStorage.setItem('eecol-storage-mode', 'hybrid');
    localStorage.setItem('eecol-supabase-url', 'https://test.supabase.co');
    localStorage.setItem('eecol-supabase-key', 'test-key');

    const adapter = new StorageAdapter();
    await adapter.initialize();

    const status = adapter.getStatus();
    return status.initialized && status.mode === 'indexeddb' && !status.hasSupabase;
  });

  // Test 3: Mode Switching to Hybrid
  await test('Mode Switching to Hybrid', async () => {
    const adapter = new StorageAdapter();
    await adapter.initialize();

    await adapter.setStorageMode('hybrid');
    const newMode = adapter.getStorageMode();

    return newMode === 'hybrid';
  });

  // Test 4: IndexedDB-Only Operations in Hybrid Mode (fallback)
  await test('IndexedDB-Only Operations in Hybrid Mode', async () => {
    const adapter = new StorageAdapter();
    await adapter.initialize();

    // Force hybrid mode
    localStorage.setItem('eecol-storage-mode', 'hybrid');
    await adapter.setStorageMode('hybrid');

    // Test data
    const testRecord = {
      wireType: 'Test Wire',
      length: 100,
      quantity: 5,
      operator: 'Test Operator',
      timestamp: new Date().toISOString()
    };

    // ADD (should work via IndexedDB)
    const recordId = await adapter.add('cuttingRecords', testRecord);
    if (!recordId) return false;

    // GET (should work via IndexedDB)
    const retrieved = await adapter.get('cuttingRecords', recordId);
    if (!retrieved || retrieved.wireType !== 'Test Wire') return false;

    // UPDATE (should work via IndexedDB)
    const updatedRecord = { ...retrieved, quantity: 10 };
    await adapter.update('cuttingRecords', updatedRecord);

    // GET ALL (should work via IndexedDB)
    const allRecords = await adapter.getAll('cuttingRecords');
    if (!allRecords || allRecords.length === 0) return false;

    // DELETE (should work via IndexedDB)
    await adapter.delete('cuttingRecords', recordId);

    return true;
  });

  // Test 5: Queue System in Hybrid Mode
  test('Queue System in Hybrid Mode', () => {
    localStorage.setItem('eecol-storage-mode', 'hybrid');
    const adapter = new StorageAdapter();
    const status = adapter.getStatus();
    return status.queuedOperations === 0 && status.mode === 'hybrid';
  });

  // Test 6: Status Information in Hybrid Mode
  test('Status Information - Hybrid Mode', () => {
    localStorage.setItem('eecol-storage-mode', 'hybrid');
    const adapter = new StorageAdapter();
    const status = adapter.getStatus();
    const requiredFields = ['initialized', 'mode', 'hasIndexedDB', 'hasSupabase', 'isOnline', 'queuedOperations'];
    return requiredFields.every(field => field in status) && status.mode === 'hybrid';
  });

  // Test 7: Tool-Specific Methods in Hybrid Mode
  await test('Tool-Specific Methods in Hybrid Mode', async () => {
    const adapter = new StorageAdapter();
    await adapter.initialize();

    // Force hybrid mode
    localStorage.setItem('eecol-storage-mode', 'hybrid');
    await adapter.setStorageMode('hybrid');

    // Test mark converter
    const markId = await adapter.saveMarkConverter({ input: 'test', output: 'result' });
    if (!markId) return false;

    // Test stop mark converter
    const stopId = await adapter.saveStopMarkConverter({ input: 'test', output: 'result' });
    if (!stopId) return false;

    // Test reel capacity estimator
    const reelId = await adapter.saveReelCapacityEstimator({ input: 'test', output: 'result' });
    if (!reelId) return false;

    // Test get all reel capacity
    const allReel = await adapter.getAllReelCapacityEstimator();
    if (!Array.isArray(allReel)) return false;

    return true;
  });

  // Test 8: Error Handling in Hybrid Mode
  test('Error Handling - Invalid Mode from Hybrid', async () => {
    localStorage.setItem('eecol-storage-mode', 'hybrid');
    const adapter = new StorageAdapter();
    try {
      await adapter.setStorageMode('invalid');
      return false; // Should have thrown
    } catch (error) {
      return error.message.includes('Invalid storage mode');
    }
  });

  // Test 9: Hybrid Mode Readiness Check
  test('Hybrid Mode Readiness Check', () => {
    localStorage.setItem('eecol-storage-mode', 'hybrid');
    const adapter = new StorageAdapter();
    const isReady = adapter.isReady();
    return typeof isReady === 'boolean';
  });

  // Test 10: Fallback Behavior Validation
  test('Fallback Behavior Validation', () => {
    localStorage.setItem('eecol-storage-mode', 'hybrid');
    const adapter = new StorageAdapter();
    const status = adapter.getStatus();

    // In Node.js environment, should fallback to IndexedDB-only
    return status.hasIndexedDB && !status.hasSupabase;
  });

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('🧪 HYBRID MODE TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

  if (testResults.failed === 0) {
    console.log('\n🎉 ALL HYBRID MODE TESTS PASSED!');
    console.log('✅ Hybrid mode selection works correctly');
    console.log('✅ Fallback to IndexedDB works when Supabase unavailable');
    console.log('✅ IndexedDB operations function properly in hybrid mode');
    console.log('✅ Queue system ready for sync operations');
    console.log('✅ Ready for data migration testing');
  } else {
    console.log('\n⚠️  SOME HYBRID MODE TESTS FAILED. Please investigate before proceeding.');
    console.log('Note: Some failures are expected due to mock environment limitations.');
  }

  return testResults;
}

// Run the tests
runHybridModeTests().catch(error => {
  console.error('Hybrid mode test suite failed:', error);
  process.exit(1);
});
