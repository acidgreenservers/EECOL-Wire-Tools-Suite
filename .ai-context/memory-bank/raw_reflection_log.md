---
Date: 2025-11-03
TaskRef: "Supabase Script Loading Order & Table Name Mapping Fixes"

Learnings:
- Script loading order is critical: supabase-client.js must load before storage-adapter.js to avoid "SupabaseClient is not defined" errors
- PostgreSQL stores table identifiers in lowercase, so camelCase table names (cuttingRecords) become snake_case (cuttingrecords) in the database schema
- Supabase error messages provide helpful hints like "Perhaps you meant the table 'public.cuttingrecords'" when table names don't match
- Browser caching can prevent updated JavaScript from loading immediately after fixes

Difficulties_and_Resolutions:
- Initial "SupabaseClient is not defined" error was resolved by adding supabase-client.js before storage-adapter.js in HTML script loading order
- Table name mapping issues (camelCase vs snake_case) were identified through Supabase error hints and resolved by updating the tableMap in SupabaseClient.createTableMap()
- Browser caching prevented immediate visibility of fixes, requiring user to hard refresh or clear cache

Successes:
- Script loading order fix eliminated the critical "SupabaseClient is not defined" error
- Supabase connection test now passes successfully
- StorageAdapter initializes in Supabase mode without falling back to IndexedDB
- Table name mapping correction addresses the root cause of 404 table not found errors

Key_Decisions:
- Updated table mapping from camelCase to snake_case to match PostgreSQL identifier storage rules
- Fixed testConnection method to use correct snake_case table name for connectivity testing
- Maintained backward compatibility by keeping IndexedDB store names in camelCase while mapping to correct database table names

Project_Convention_Verification:
- Verified that table creation SQL uses camelCase names but PostgreSQL stores them as lowercase
- Confirmed that SupabaseClient table mapping correctly handles the camelCase-to-snake_case conversion
- Ensured all CRUD operations use the correct table name mappings

Improvements_Identified_For_Consolidation:
- PostgreSQL identifier case sensitivity: Always map camelCase JavaScript names to snake_case database names
- Browser cache management: Hard refresh required after JavaScript changes in development
- Error message analysis: Supabase error hints provide valuable debugging information for table name issues
---
