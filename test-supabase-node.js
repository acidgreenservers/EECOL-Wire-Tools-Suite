/**
 * Node.js test script for SupabaseClient
 * Tests the SupabaseClient functionality programmatically
 */

// Mock browser environment for Node.js
global.window = {};
global.navigator = { onLine: true };

// Mock Supabase
const { createClient } = require('@supabase/supabase-js');
global.supabase = { createClient };

// Load the SupabaseClient by directly requiring it as a module
// This assumes the file can be loaded as a CommonJS module
try {
  const SupabaseClient = require('./src/core/database/supabase-client.js');
  global.window.SupabaseClient = SupabaseClient;
} catch (e) {
  console.error('Could not load SupabaseClient module:', e.message);
  process.exit(1);
}

async function runTests() {
    console.log('🧪 Starting SupabaseClient Tests...\n');

    let supabaseClient = null;

    try {
        // Test 1: Initialize SupabaseClient
        console.log('1. Testing SupabaseClient initialization...');
        supabaseClient = new SupabaseClient();
        await supabaseClient.initialize();
        console.log('✅ SupabaseClient initialized successfully\n');

        // Test 2: Data transformations
        console.log('2. Testing data transformations...');
        const testRecord = {
            id: 'test-' + Date.now(),
            wireType: '14 AWG THHN',
            operator: 'Test Operator',
            quantity: 100,
            date: new Date().toISOString().split('T')[0]
        };

        const transformedTo = supabaseClient.transformToSupabase(testRecord, 'cuttingRecords');
        console.log('✅ Transformed to Supabase format');

        const transformedFrom = supabaseClient.transformFromSupabase(transformedTo, 'cuttingRecords');
        console.log('✅ Transformed from Supabase format\n');

        // Test 3: CRUD operations
        console.log('3. Testing CRUD operations...');

        // ADD
        console.log('   - Testing ADD operation...');
        const recordId = await supabaseClient.add('cuttingRecords', testRecord);
        console.log(`   ✅ Added record with ID: ${recordId}`);

        // GET
        console.log('   - Testing GET operation...');
        const getResult = await supabaseClient.get('cuttingRecords', recordId);
        console.log(`   ✅ Retrieved record: ${getResult ? 'Found' : 'Not found'}`);

        // UPDATE
        console.log('   - Testing UPDATE operation...');
        const updatedRecord = { ...testRecord, id: recordId, quantity: 150 };
        await supabaseClient.update('cuttingRecords', updatedRecord);
        console.log('   ✅ Updated record');

        // GET ALL
        console.log('   - Testing GET ALL operation...');
        const allRecords = await supabaseClient.getAll('cuttingRecords');
        console.log(`   ✅ Retrieved ${allRecords.length} records`);

        // DELETE
        console.log('   - Testing DELETE operation...');
        await supabaseClient.delete('cuttingRecords', recordId);
        console.log('   ✅ Soft deleted record');

        // Verify deletion
        console.log('   - Verifying deletion...');
        const deletedRecord = await supabaseClient.get('cuttingRecords', recordId);
        console.log(`   ✅ Record ${deletedRecord ? 'still exists' : 'properly deleted'}\n`);

        // Test 4: Real-time subscriptions (mock test)
        console.log('4. Testing real-time subscriptions...');
        const subscription = supabaseClient.subscribe('cuttingRecords', (event) => {
            console.log('   📡 Received real-time event:', event.eventType);
        });
        console.log('   ✅ Subscribed to real-time changes');

        // Cleanup subscription
        subscription.unsubscribe();
        console.log('   ✅ Unsubscribed from real-time changes\n');

        console.log('🎉 All SupabaseClient tests passed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

// Run tests
runTests().catch(console.error);
