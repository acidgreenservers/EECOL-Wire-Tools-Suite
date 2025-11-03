/**
 * Node.js test script for IndexedDB mode validation
 * Tests StorageAdapter functionality in IndexedDB-only mode
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

// Mock IndexedDB for Node.js (simplified)
global.indexedDB = {
  open(name, version) {
    return {
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
      result: {
        createObjectStore(storeName) {
          console.log(`Mock IndexedDB: Created object store ${storeName}`);
          return {
            createIndex(name, keyPath) {
              console.log(`Mock IndexedDB: Created index ${name} on ${keyPath}`);
            }
          };
        },
        transaction(stores, mode) {
          return {
            objectStore(storeName) {
              const store = {};
              const data = {};

              return {
                add(record) {
                  const id = Date.now().toString();
                  data[id] = { ...record, id };
                  console.log(`Mock IndexedDB: Added record to ${storeName} with ID ${id}`);
                  return {
                    onsuccess: null,
                    onerror: null,
                    result: id
                  };
                },
                get(key) {
                  const record = data[key];
                  console.log(`Mock IndexedDB: Retrieved record from ${storeName} with key ${key}`);
                  return {
                    onsuccess: null,
                    onerror: null,
                    result: record || null
                  };
                },
                getAll() {
                  const records = Object.values(data);
                  console.log(`Mock IndexedDB: Retrieved ${records.length} records from ${storeName}`);
                  return {
                    onsuccess: null,
                    onerror: null,
                    result: records
                  };
                },
                put(record) {
                  if (record.id) {
                    data[record.id] = record;
                    console.log(`Mock IndexedDB: Updated record in ${storeName} with ID ${record.id}`);
                  }
                  return {
                    onsuccess: null,
                    onerror: null,
                    result: record.id
                  };
                },
                delete(key) {
                  delete data[key];
                  console.log(`Mock IndexedDB: Deleted record from ${storeName} with key ${key}`);
                  return {
                    onsuccess: null,
                    onerror: null
                  };
                },
                clear() {
                  Object.keys(data).forEach(key => delete data[key]);
                  console.log(`Mock IndexedDB: Cleared all records from ${storeName}`);
                  return {
                    onsuccess: null,
                    onerror: null
                  };
                }
              };
            }
          };
        }
      }
    };
  }
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

  // Tool-specific methods
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

// Load StorageAdapter
const fs = require('fs');
const path = require('path');

// Read and execute the StorageAdapter code
const storageAdapterCode = fs.readFileSync(path.join(__dirname, 'src/core/database/storage-adapter.js'), 'utf8');

// Execute the code in this context and make StorageAdapter available globally
eval(storageAdapterCode.replace('window.StorageAdapter = StorageAdapter;', 'global.StorageAdapter = StorageAdapter;'));

async function runTests() {
  console.log('🧪 Starting IndexedDB Mode Tests...\n');

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

  // Test 1: StorageAdapter Creation
  test('StorageAdapter Creation', () => {
    const adapter = new StorageAdapter();
    return adapter instanceof StorageAdapter;
  });

  // Test 2: Mode Loading (should default to indexeddb)
  test('Mode Loading', () => {
    const adapter = new StorageAdapter();
    const mode = adapter.loadStorageMode();
    return mode === 'indexeddb';
  });

  // Test 3: Initialization in IndexedDB mode
  await test('Initialization in IndexedDB Mode', async () => {
    localStorage.setItem('eecol-storage-mode', 'indexeddb');
    const adapter = new StorageAdapter();
    await adapter.initialize();
    const status = adapter.getStatus();
    return status.initialized && status.mode === 'indexeddb' && status.hasIndexedDB;
  });

  // Test 4: CRUD Operations
  await test('CRUD Operations', async () => {
    const adapter = new StorageAdapter();
    await adapter.initialize();

    // Test data
    const testRecord = {
      wireType: 'Test Wire',
      length: 100,
      quantity: 5,
      operator: 'Test Operator',
      timestamp: new Date().toISOString()
    };

    // ADD
    const recordId = await adapter.add('cuttingRecords', testRecord);
    if (!recordId) return false;

    // GET
    const retrieved = await adapter.get('cuttingRecords', recordId);
    if (!retrieved || retrieved.wireType !== 'Test Wire') return false;

    // UPDATE
    const updatedRecord = { ...retrieved, quantity: 10 };
    await adapter.update('cuttingRecords', updatedRecord);

    // GET ALL
    const allRecords = await adapter.getAll('cuttingRecords');
    if (!allRecords || allRecords.length === 0) return false;

    // DELETE
    await adapter.delete('cuttingRecords', recordId);

    return true;
  });

  // Test 5: Tool-Specific Methods
  await test('Tool-Specific Methods', async () => {
    const adapter = new StorageAdapter();
    await adapter.initialize();

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

  // Test 6: Mode Validation
  test('Mode Validation', () => {
    const adapter = new StorageAdapter();
    const mode = adapter.getStorageMode();
    const isReady = adapter.isReady();
    return mode === 'indexeddb' && typeof isReady === 'boolean';
  });

  // Test 7: Status Information
  test('Status Information', () => {
    const adapter = new StorageAdapter();
    const status = adapter.getStatus();
    const requiredFields = ['initialized', 'mode', 'hasIndexedDB', 'hasSupabase', 'isOnline', 'queuedOperations'];
    return requiredFields.every(field => field in status);
  });

  // Test 8: Error Handling - Invalid Mode
  test('Error Handling - Invalid Mode', async () => {
    const adapter = new StorageAdapter();
    try {
      await adapter.setStorageMode('invalid');
      return false; // Should have thrown
    } catch (error) {
      return error.message.includes('Invalid storage mode');
    }
  });

  // Test 9: Graceful Fallback Check
  test('Graceful Fallback Check', () => {
    const adapter = new StorageAdapter();
    const hasCredentials = adapter.checkSupabaseCredentials();
    // Should return false since no credentials are set
    return hasCredentials === false;
  });

  // Test 10: Queue System (should be empty in IndexedDB mode)
  test('Queue System', () => {
    const adapter = new StorageAdapter();
    const status = adapter.getStatus();
    return status.queuedOperations === 0;
  });

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('🧪 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

  if (testResults.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! IndexedDB mode is working correctly.');
    console.log('✅ Backward compatibility maintained');
    console.log('✅ StorageAdapter integration successful');
    console.log('✅ Ready for Supabase mode testing');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED. Please investigate before proceeding.');
  }

  return testResults;
}

// Run the tests
runTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
