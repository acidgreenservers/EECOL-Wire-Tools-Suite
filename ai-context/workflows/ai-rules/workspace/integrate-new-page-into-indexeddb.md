
---
description: Ensures all new pages requiring IndexedDB persistence use the project's EECOLIndexedDB class and follow established patterns for database connectivity, configuration loading, and record management.
author: [Your Name]
version: 1.0
tags: [database, indexeddb, eecol, integration, workflow]
globs: ["**/*.js", "**/indexeddb.js", "**/cutting-records.js", "**/inventory-records.js"]
---

<task name="integrate-new-page-into-indexeddb">

<task_objective>
This workflow ensures all new pages requiring IndexedDB persistence use the project's `EECOLIndexedDB` class and follow established patterns for database connectivity, configuration loading, and record management.

Key tools: `EECOLIndexedDB`, `window.eecolDB`

Expected output: A new page fully integrated with IndexedDB, using the correct database calls and error handling.
</task_objective>

<detailed_sequence_steps>

# Integrate New Page into IndexedDB Process - Detailed Sequence of Steps

## 1. Verify Database Connectivity
1. Check if `EECOLIndexedDB` is available:
    ```javascript
    if (typeof EECOLIndexedDB === 'undefined') {
        console.error('❌ EECOLIndexedDB class not found');
        return { success: false, error: 'EECOLIndexedDB class not available' };
    }
    ```

2. Check if the database instance exists:
    ```javascript
    if (!window.eecolDB) {
        console.error('❌ Database instance not found');
        return { success: false, error: 'Database instance not initialized' };
    }
    ```

3. Check if the database is ready:
    ```javascript
    const isReady = await window.eecolDB.isReady();
    if (!isReady) {
        console.error('❌ Database not ready');
        return { success: false, error: 'Database not ready' };
    }
    ```

## 2. Load Configurations
1. Initialize a new `EECOLIndexedDB` instance:
    ```javascript
    const db = new EECOLIndexedDB();
    await db.ready;
    ```

2. Load configurations from the specified store:
    ```javascript
    let configurations = [];
    try {
        configurations = await db.getAll('storeName') || [];
        configurations.sort((a, b) => b.timestamp - a.timestamp);
        console.log(`✅ Loaded ${configurations.length} configurations from storeName`);
    } catch (error) {
        console.error(`❌ Failed to load configurations from storeName:`, error);
        configurations = [];
    }
    ```

## 3. Save Records
1. Add a new record to the specified store:
    ```javascript
    async function saveRecord(storeName, record) {
        try {
            await db.add(storeName, record);
            console.log(`✅ Record saved to ${storeName}`);
        } catch (error) {
            console.error(`❌ Failed to save record to ${storeName}:`, error);
        }
    }
    ```

## 4. Error Handling
1. Wrap all database operations in try-catch blocks.
2. Log errors with descriptive messages using `❌` and successes with `✅`.

## 5. Finalize Integration
1. Use the `attempt_completion` tool to present the results of the integration.

</detailed_sequence_steps>

</task>
