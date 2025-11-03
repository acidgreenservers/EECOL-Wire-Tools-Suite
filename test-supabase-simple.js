/**
 * Simple test script for SupabaseClient UUID and CRUD operations
 */

// Mock browser environment
global.window = {};

// Import Supabase
import { createClient } from '@supabase/supabase-js';
global.supabase = { createClient };

// Import SupabaseClient
import('./src/core/database/supabase-client.js');

async function testSupabaseClient() {
  console.log('🧪 Testing SupabaseClient UUID and CRUD operations...\n');

  try {
    // Initialize client
    const client = new window.SupabaseClient();
    await client.initialize();
    console.log('✅ SupabaseClient initialized\n');

    // Test data with string ID (should be ignored by database)
    const testData = {
      id: 'test-' + Date.now(),
      wireType: '14 AWG THHN',
      operator: 'Test Operator',
      quantity: 100,
      date: new Date().toISOString().split('T')[0]
    };

    console.log('📝 Test data created with string ID:', testData.id);

    // Test ADD - should return UUID
    console.log('➕ Testing ADD operation...');
                const recordId = await client.add('cuttingRecords', testData);
                console.log('Record added with UUID:', recordId);
    console.log('✅ Record added with UUID:', recordId);

    // Verify it's a proper UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(recordId)) {
      console.log('✅ Returned ID is valid UUID format');
    } else {
      throw new Error('Returned ID is not a valid UUID: ' + recordId);
    }

    // Test GET with UUID
    console.log('🔍 Testing GET operation with UUID...');
    const retrieved = await client.get('cuttingRecords', recordId);
    if (retrieved) {
      console.log('✅ Record retrieved successfully');
      console.log('   - Original ID in data:', retrieved.id);
      console.log('   - Wire Type:', retrieved.wireType);
      console.log('   - Quantity:', retrieved.quantity);
    } else {
      throw new Error('Record not found after adding');
    }

    // Test UPDATE with UUID
    console.log('✏️  Testing UPDATE operation...');
    const updatedData = { ...testData, id: recordId, quantity: 150 };
    await client.update('cuttingRecords', updatedData);
    console.log('✅ Record updated');

    // Verify update
    const updated = await client.get('cuttingRecords', recordId);
    if (updated && updated.quantity === 150) {
      console.log('✅ Update verified - quantity changed to 150');
    } else {
      throw new Error('Update verification failed');
    }

    // Test GET ALL
    console.log('📋 Testing GET ALL operation...');
    const allRecords = await client.getAll('cuttingRecords');
    console.log(`✅ Retrieved ${allRecords.length} total records`);

    // Test DELETE
    console.log('🗑️  Testing DELETE operation...');
    await client.delete('cuttingRecords', recordId);
    console.log('✅ Record soft deleted');

    // Verify deletion
    const deleted = await client.get('cuttingRecords', recordId);
    if (!deleted) {
      console.log('✅ Deletion verified - record no longer found');
    } else {
      throw new Error('Deletion verification failed - record still exists');
    }

    console.log('\n🎉 All SupabaseClient CRUD tests passed!');
    console.log('✅ UUID generation working correctly');
    console.log('✅ CRUD operations working with UUIDs');
    console.log('✅ Data transformation working');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run test
testSupabaseClient();
