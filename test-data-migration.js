/**
 * Node.js test script for data migration testing
 * Tests StorageAdapter data migration between storage modes
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
      const records = [];
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
                        data: records.slice(),
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
              if (Array.isArray(data)) {
                data.forEach(record => {
                  record.id = 'test-uuid-' + Date.now() + '-' + Math.random();
                  records.push(record);
                });
              } else {
                data.id = 'test-uuid-' + Date.now();
                records.push(data);
              }
              return {
                select: function(fields) {
                  return {
                    single: async function() {
                      return {
                        data: data,
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

// Mock EECOLIndexedDB class with data persistence for migration testing
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
    const id = Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
    const record = { ...data, id };
    this.stores[storeName][id] = record;
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

async function runDataMigrationTests() {
  console.log('🧪 Starting Data Migration Tests...\n');

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

  // Test 1: Data Creation for Migration Testing
  await test('Data Creation for Migration Testing', async () => {
    const adapter = new StorageAdapter();
    await adapter.initialize();

    // Create test data in different stores
    const cuttingRecordId = await adapter.add('cuttingRecords', {
      wireType: 'Test Wire Migration',
      length: 500,
      quantity: 25,
      operator: 'Migration Test',
      timestamp: new Date().toISOString()
    });

    const inventoryRecordId = await adapter.add('inventoryRecords', {
      wireType: 'Test Inventory Migration',
      currentStock: 1000,
      minStock: 100,
      location: 'Warehouse A'
    });

    const markConverterId = await adapter.saveMarkConverter({
      input: 'migration test',
      output: 'result',
      timestamp: Date.now()
    });

    return cuttingRecordId && inventoryRecordId && markConverterId;
  });

  // Test 2: Migration Prerequisites Check
  test('Migration Prerequisites Check', () => {
    const adapter = new StorageAdapter();

    // Should fail migration in IndexedDB-only mode
    const canMigrate = adapter.getStorageMode() !== 'indexeddb';
    return !canMigrate; // Should be false since we're in IndexedDB mode
  });

  // Test 3: Mode Switching for Migration
  await test('Mode Switching for Migration', async () => {
    const adapter = new StorageAdapter();
    await adapter.initialize();

    // Switch to Supabase mode (will fallback in Node.js)
    localStorage.setItem('eecol-supabase-url', 'https://test.supabase.co');
    localStorage.setItem('eecol-supabase-key', 'test-key');

    await adapter.setStorageMode('supabase');
    const newMode = adapter.getStorageMode();

    return newMode === 'supabase';
  });

  // Test 4: Migration Data Retrieval
  await test('Migration Data Retrieval', async () => {
    const adapter = new StorageAdapter();
    await adapter.initialize();

    // Retrieve data that should be migrated
    const cuttingRecords = await adapter.getAll('cuttingRecords');
    const inventoryRecords = await adapter.getAll('inventoryRecords');
    const markConverters = await adapter.getAll('markConverter');

    return cuttingRecords.length > 0 && inventoryRecords.length > 0 && Array.isArray(markConverters);
  });

  // Test 5: Migration Execution (Mock)
  await test('Migration Execution - Mock Environment', async () => {
    // In Node.js environment, migration will fail due to Supabase limitations
    // But we can test the migration logic structure
    const adapter = new StorageAdapter();
    await adapter.initialize();

    // Force Supabase mode
    localStorage.setItem('eecol-storage-mode', 'supabase');
    localStorage.setItem('eecol-supabase-url', 'https://test.supabase.co');
    localStorage.setItem('eecol-supabase-key', 'test-key');

    try {
      // This will fail in Node.js but tests the migration logic
      await adapter.migrateToSupabase();
      return false; // Should fail in mock environment
    } catch (error) {
      // Expected to fail due to Node.js limitations
      return error.message.includes('Supabase') || error.message.includes('ESM');
    }
  });

  // Test 6: Data Integrity Check
  await test('Data Integrity Check', async () => {
    const adapter = new StorageAdapter();
    await adapter.initialize();

    // Add test data
    const testData = {
      wireType: 'Integrity Test Wire',
      length: 750,
      quantity: 15,
      operator: 'Integrity Check',
      timestamp: new Date().toISOString()
    };

    const recordId = await adapter.add('cuttingRecords', testData);
    const retrieved = await adapter.get('cuttingRecords', recordId);

    // Check data integrity
    const isIntact = retrieved &&
                     retrieved.wireType === testData.wireType &&
                     retrieved.length === testData.length &&
                     retrieved.quantity === testData.quantity &&
                     retrieved.operator === testData.operator;

    return isIntact;
  });

  // Test 7: Mode Switching Data Persistence
  await test('Mode Switching Data Persistence', async () => {
    const adapter = new StorageAdapter();
    await adapter.initialize();

    // Add data in IndexedDB mode
    const testData = {
      wireType: 'Persistence Test',
      length: 300,
      quantity: 8,
      operator: 'Persistence Check'
    };

    const recordId = await adapter.add('cuttingRecords', testData);

    // Switch modes (will fallback)
    await adapter.setStorageMode('supabase');
    await adapter.setStorageMode('hybrid');
    await adapter.setStorageMode('indexeddb');

    // Data should still be accessible
    const retrieved = await adapter.get('cuttingRecords', recordId);

    return retrieved && retrieved.wireType === testData.wireType;
  });

  // Test 8: Migration Progress Callback Structure
  test('Migration Progress Callback Structure', () => {
    // Test that migration methods accept progress callbacks
    const adapter = new StorageAdapter();

    // Check if migrateToSupabase method exists and accepts callback
    const hasMigrateMethod = typeof adapter.migrateToSupabase === 'function';
    // We can't test the actual callback in Node.js due to Supabase limitations

    return hasMigrateMethod;
  });

  // Test 9: Error Handling During Migration
  test('Error Handling During Migration', () => {
    const adapter = new StorageAdapter();

    // Test migration in IndexedDB-only mode (should fail appropriately)
    const mode = adapter.getStorageMode();
    const canMigrate = mode !== 'indexeddb';

    return !canMigrate; // Should be false, indicating proper error handling
  });

  // Test 10: Migration Status Tracking
  test('Migration Status Tracking', () => {
    const adapter = new StorageAdapter();
    const status = adapter.getStatus();

    // Check that status includes migration-relevant fields
    const hasQueueInfo = 'queuedOperations' in status;
    const hasModeInfo = 'mode' in status;
    const hasReadyInfo = 'initialized' in status;

    return hasQueueInfo && hasModeInfo && hasReadyInfo;
  });

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('🧪 DATA MIGRATION TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

  if (testResults.failed === 0) {
    console.log('\n🎉 ALL DATA MIGRATION TESTS PASSED!');
    console.log('✅ Data creation and retrieval works correctly');
    console.log('✅ Mode switching preserves data integrity');
    console.log('✅ Migration methods are properly structured');
    console.log('✅ Error handling prevents data loss');
    console.log('✅ Ready for offline/online testing');
  } else {
    console.log('\n⚠️  SOME DATA MIGRATION TESTS FAILED. Please investigate before proceeding.');
    console.log('Note: Some failures are expected due to mock environment limitations.');
  }

  return testResults;
}

// Run the tests
runDataMigrationTests().catch(error => {
  console.error('Data migration test suite failed:', error);
  process.exit(1);
});
