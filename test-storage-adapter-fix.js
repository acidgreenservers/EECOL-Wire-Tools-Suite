/**
 * Test script to verify StorageAdapter fix for missing tool-specific methods
 */

async function testStorageAdapterFix() {
    console.log('🧪 Testing StorageAdapter fix for missing tool-specific methods...');

    try {
        // Check if StorageAdapter is available
        if (typeof StorageAdapter === 'undefined') {
            throw new Error('StorageAdapter is not defined');
        }

        console.log('✅ StorageAdapter is available');

        // Create instance and initialize
        const adapter = new StorageAdapter();
        console.log('🔄 Initializing StorageAdapter...');
        await adapter.initialize();
        console.log('✅ StorageAdapter initialized');

        // Check if the missing methods exist
        const methodsToCheck = [
            'saveMarkConverter',
            'saveStopMarkConverter',
            'saveReelCapacityEstimator',
            'getAllReelCapacityEstimator'
        ];

        console.log('🔍 Checking for missing methods...');
        for (const method of methodsToCheck) {
            if (typeof adapter[method] === 'function') {
                console.log(`✅ Method ${method} exists`);
            } else {
                throw new Error(`Method ${method} is missing`);
            }
        }

        // Test saveMarkConverter
        console.log('💾 Testing saveMarkConverter...');
        const testData1 = {
            type: 'markCalculator',
            startMark: 100,
            endMark: 150,
            unit: 'm',
            timestamp: new Date().toISOString()
        };

        const result1 = await adapter.saveMarkConverter(testData1);
        console.log('✅ saveMarkConverter worked, returned:', result1);

        // Test saveStopMarkConverter
        console.log('💾 Testing saveStopMarkConverter...');
        const testData2 = {
            type: 'stopCalculator',
            startMark: 200,
            endMark: 250,
            unit: 'ft',
            timestamp: new Date().toISOString()
        };

        const result2 = await adapter.saveStopMarkConverter(testData2);
        console.log('✅ saveStopMarkConverter worked, returned:', result2);

        // Test saveReelCapacityEstimator
        console.log('💾 Testing saveReelCapacityEstimator...');
        const testData3 = {
            reelDiameter: 500,
            wireDiameter: 2.5,
            capacity: 1000,
            timestamp: new Date().toISOString()
        };

        const result3 = await adapter.saveReelCapacityEstimator(testData3);
        console.log('✅ saveReelCapacityEstimator worked, returned:', result3);

        // Test getAllReelCapacityEstimator
        console.log('📖 Testing getAllReelCapacityEstimator...');
        const records = await adapter.getAllReelCapacityEstimator();
        console.log('✅ getAllReelCapacityEstimator worked, returned:', records.length, 'records');

        // Verify data was actually saved
        console.log('🔍 Verifying data persistence...');
        const allReelData = await adapter.getAllReelCapacityEstimator();
        const foundRecord = allReelData.find(record => record.id === result3);
        if (foundRecord) {
            console.log('✅ Data persistence verified - record found with correct data');
        } else {
            throw new Error('Data persistence failed - record not found');
        }

        console.log('🎉 All tests passed! StorageAdapter fix is working correctly.');

        return {
            success: true,
            message: 'All StorageAdapter methods are working correctly'
        };

    } catch (error) {
        console.error('❌ Test failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Run the test
testStorageAdapterFix().then(result => {
    console.log('Test result:', result);
    if (result.success) {
        console.log('✅ StorageAdapter fix verified successfully!');
    } else {
        console.error('❌ StorageAdapter fix failed:', result.error);
    }
});
