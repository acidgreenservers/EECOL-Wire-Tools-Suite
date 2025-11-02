# System Patterns

## System Architecture

### High-Level Architecture (CURRENT - v0.8.0.1 + Phase 2 Complete)
```
┌─────────────────────────────────────────────────────────────┐
│                      Browser Layer (PWA)                     │
├─────────────────────────────────────────────────────────────┤
│  Pages Layer                                                 │
│  ├─ Index/Dashboard                                         │
│  ├─ Cutting Records        ├─ Inventory Records            │
│  ├─ Cutting Reports        ├─ Inventory Reports            │
│  ├─ Calculator Tools       ├─ Maintenance Checklists       │
│  └─ Education Hub          └─ Live Statistics              │
├─────────────────────────────────────────────────────────────┤
│  Application Layer (JavaScript Modules)                      │
│  ├─ Page-specific logic (src/assets/js/*.js)               │
│  └─ Shared utilities and helpers                            │
├─────────────────────────────────────────────────────────────┤
│  Core Services Layer                                        │
│  ├─ Storage Adapter: src/core/database/storage-adapter.js  │
│  │   ├─ IndexedDB Client (v0.8.0.1)                        │
│  │   ├─ Supabase Client (Phase 3 - TODO)                   │
│  │   ├─ Offline Queue System (Phase 2 ✅)                  │
│  │   └─ Migration Utilities (Phase 2 ✅)                   │
│  ├─ PWA Core: src/assets/js/pwa-core.js                    │
│  └─ Modules: industry-standards.js, wesco-eecol-products.js│
├─────────────────────────────────────────────────────────────┤
│  Storage & Sync Layer (Configurable - Phase 2 ✅)           │
│  ├─ Mode 1: IndexedDB (local-only, offline-first)          │
│  ├─ Mode 2: Supabase (cloud sync - Phase 3 TODO)           │
│  └─ Mode 3: Hybrid (IndexedDB + Supabase auto-sync)        │
└─────────────────────────────────────────────────────────────┘
```

### Target Architecture (Post-Migration Complete)
```
┌─────────────────────────────────────────────────────────────┐
│                      Browser Layer (PWA)                     │
├─────────────────────────────────────────────────────────────┤
│  Pages Layer                                                 │
│  ├─ Index/Dashboard                                         │
│  ├─ Cutting Records        ├─ Inventory Records            │
│  ├─ Cutting Reports        ├─ Inventory Reports            │
│  ├─ Calculator Tools       ├─ Maintenance Checklists       │
│  └─ Education Hub          └─ Live Statistics              │
├─────────────────────────────────────────────────────────────┤
│  Application Layer (JavaScript Modules)                      │
│  ├─ Page-specific logic (src/assets/js/*.js)               │
│  └─ Shared utilities and helpers                            │
├─────────────────────────────────────────────────────────────┤
│  Core Services Layer                                        │
│  ├─ Storage Adapter: src/core/database/storage-adapter.js  │
│  │   ├─ IndexedDB Client (legacy support)                  │
│  │   ├─ Supabase Client (real-time subscriptions)          │
│  │   ├─ Offline Queue System (background sync)             │
│  │   └─ Migration Utilities (data transfer)                │
│  ├─ PWA Core: src/assets/js/pwa-core.js                    │
│  └─ Modules: industry-standards.js, wesco-eecol-products.js│
├─────────────────────────────────────────────────────────────┤
│  Storage & Sync Layer (Cloud-Enabled)                       │
│  ├─ Mode 1: IndexedDB (local-only, offline-first)          │
│  ├─ Mode 2: Supabase (cloud sync with PostgreSQL)          │
│  └─ Mode 3: Hybrid (IndexedDB + Supabase auto-sync)        │
└─────────────────────────────────────────────────────────────┘
```

## Key Technical Decisions

### 1. Storage Strategy: IndexedDB with Planned Supabase Migration
**Current Implementation (v0.8.0.1)**: IndexedDB
**Status**: Production-ready, fully functional
**Rationale**:
- IndexedDB provides reliable offline-first data persistence
- No external dependencies required for core functionality
- Fast, secure, local-first architecture

**Current Implementation**:
- IndexedDB wrapper: `src/core/database/indexeddb.js`
- 12 object stores in EECOLTools_v2 database
- localStorage for UI state

**Planned Migration Target**: Supabase Cloud Database
**Migration Status**: Phase 2 ✅ COMPLETED - Storage Abstraction Layer implemented
**Migration Strategy**:
- Phase 1 ✅: Foundation & Setup (Supabase project, dependencies, schema)
- Phase 2 ✅: Storage Abstraction Layer (unified API with three modes)
- Phase 3 🔄: Supabase Client Implementation (real-time subscriptions)
- Phase 4 ⏳: Remove Gun.js P2P module (replaced by Supabase real-time)
- Phase 5 ⏳: Configuration UI with toggle switch (IndexedDB/Supabase/Hybrid)
- Phase 6 ⏳: Integration & Testing (all modules updated)
- Phase 7 ⏳: Documentation Unification
- Phase 8 ⏳: Production Deployment

**Supabase Benefits** (when implemented):
- ACID-compliant PostgreSQL database with enterprise security
- Real-time subscriptions for instant multi-user collaboration
- Row Level Security (RLS) for fine-grained access control
- Automatic API generation and cloud backups
- Cross-device synchronization

### 2. Page-Centric Architecture
**Decision**: Each major feature is a standalone HTML page with dedicated JavaScript module
**Rationale**:
- Simpler mental model for development
- Easy to test and maintain individual features
- Better browser caching (static HTML files)
- Progressive enhancement friendly

**Structure**:
```
src/pages/[feature-name]/
  ├─ [feature-name].html    # Page structure
  ├─ (CSS in src/assets/css/[feature-name].css)
  └─ (JS in src/assets/js/[feature-name].js)
```

### 3. No Framework Dependencies
**Decision**: Vanilla JavaScript with minimal dependencies
**Rationale**:
- Lower learning curve for maintenance
- Smaller bundle size and faster load times
- Better long-term maintainability
- Easier debugging and troubleshooting
- Core dependencies limited to utility libraries

### 4. EECOL-Branded Modal System
**Decision**: Custom modal dialog system replacing browser alerts
**Rationale**:
- Professional appearance consistent with brand
- Better UX with custom styling and animations
- Accessible (keyboard navigation, ARIA labels)
- Mobile-responsive design
- Central implementation in shared utilities

### 5. Role-Based Access Control (RBAC)
**Decision**: Implement authentication with role-based permissions
**Rationale**:
- Different user types need different capabilities
- Audit compliance requires access tracking
- Security best practice for multi-user systems
- Enables delegation of responsibilities

**Roles**:
- ADMIN: Full system access
- MANAGEMENT: Business operations oversight
- AUDITOR: Read-only audit access
- INVENTORY_OPS: Material management
- WIRE_OPS: Cutting operations

## Design Patterns in Use

### 1. Module Pattern
Each feature uses revealing module pattern for encapsulation:
```javascript
// Example from cutting-records.js
const CuttingRecordsModule = (function() {
  // Private variables and functions
  let records = [];

  function privateHelper() { }

  // Public API
  return {
    init: function() { },
    addRecord: function(data) { },
    getRecords: function() { }
  };
})();
```

### 2. Observer Pattern (via Supabase Real-time)
Real-time data synchronization uses observer pattern:
```javascript
// Supabase real-time subscriptions
supabase
  .channel('cuttingRecords')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'cutting_records' }, payload => {
    // UI automatically updates when data changes
    updateUI(payload.new);
  })
  .subscribe();
```

### 3. Repository Pattern
Database access abstracted through repository interfaces:
```javascript
// IndexedDB wrapper provides consistent API
const db = new EECOLIndexedDB();
await db.add('cuttingRecords', record);
await db.getAll('cuttingRecords');
```

### 4. Strategy Pattern
Different notification channels use strategy pattern:
```javascript
// Email, Gotify, or in-app notifications
const notifier = NotificationFactory.create(channelType);
notifier.send(message);
```

### 5. Singleton Pattern
Core services instantiated once and shared:
```javascript
// Database connection is singleton
const db = DatabaseService.getInstance();
```

## Component Relationships

### Core Application Components

#### 1. Cutting Records System
**Files**:
- `src/pages/cutting-records/cutting-records.html`
- `src/assets/js/cutting-records.js`
- `src/assets/css/cutting-records.css`

**Dependencies**:
- IndexedDB (data persistence)
- Inventory Records (material availability check)
- Wire Mark Calculator (integrated calculations)

**Responsibilities**:
- Create/edit/view cutting records
- Validate against inventory levels
- Calculate wire usage and waste
- Integration with calculator tools

#### 2. Inventory Records System
**Files**:
- `src/pages/inventory-records/inventory-records.html`
- `src/assets/js/inventory-records.js`

**Dependencies**:
- IndexedDB (data persistence)
- Notification system (low-stock alerts)
- Product data module (wire specifications)

**Responsibilities**:
- Track material levels across locations
- Low-stock alert generation
- Integration with cutting records
- Historical usage tracking

#### 3. Calculator Tools Suite
**Files**:
- `src/assets/js/wire-weight-estimator.js`
- `src/assets/js/wire-mark-calculator.js`
- `src/assets/js/stop-mark-converter.js`
- `src/assets/js/reel-capacity-estimator.js`
- `src/assets/js/reel-size-estimator.js`
- `src/assets/js/multi-cut-planner.js`

**Dependencies**:
- Industry standards module (wire specifications)
- Product data module (EECOL/Wesco catalog)

**Responsibilities**:
- Perform specialized wire processing calculations
- Cache results in IndexedDB
- Integrate with operational workflows
- Provide printable outputs

#### 4. Reporting System
**Files**:
- `src/assets/js/cutting-reports.js`
- `src/assets/js/inventory-reports.js`
- `src/assets/js/live-statistics.js`

**Dependencies**:
- IndexedDB (historical data)
- Chart/visualization libraries (future)

**Responsibilities**:
- Generate analytics and insights
- Real-time dashboard updates
- Export capabilities
- Historical trend analysis

#### 5. Maintenance System
**Files**:
- `src/assets/js/machine-maintenance-checklist.js`
- `src/assets/js/machine-maintenance-checklist-multi-page.js`

**Dependencies**:
- IndexedDB (checklist data)
- Notification system (reminders)

**Responsibilities**:
- Digital maintenance checklists
- Schedule tracking
- Photo documentation
- Work order management

### Core Service Components

#### 1. IndexedDB Service
**File**: `src/core/database/indexeddb.js`

**Responsibilities**:
- Database initialization and schema migration
- Transaction-safe CRUD operations
- Index management
- Error handling and recovery

**Stores**:
- `cuttingRecords`: Wire cutting operations
- `inventoryRecords`: Material inventory
- `maintenanceLogs`: Equipment maintenance
- `users`: Authentication and roles
- `notifications`: System notification queue
- `calculations`: Cached calculator results
- `settings`: App configuration


#### 3. PWA Core Service
**File**: `src/assets/js/pwa-core.js`

**Responsibilities**:
- Service worker registration
- Offline functionality
- Background sync
- Push notification handling
- Cache management

#### 4. Product Data Module
**File**: `src/core/modules/wesco-eecol-products.js`

**Responsibilities**:
- EECOL/Wesco product catalog
- Wire specifications and properties
- Pricing information (optional)
- Product search and filtering

#### 5. Industry Standards Module
**File**: `src/core/modules/industry-standards.js`

**Responsibilities**:
- Wire gauge standards (AWG, metric)
- Material properties (copper density, etc.)
- Industry calculation formulas
- Unit conversions

## Critical Implementation Paths

### Data Flow: Creating a Cutting Record
```
1. User fills form in cutting-records.html
2. JavaScript validates input (cutting-records.js)
3. Check inventory availability (query IndexedDB)
4. Calculate wire usage (use industry-standards module)
5. Save to IndexedDB (via database service)
6. Broadcast via Supabase real-time subscriptions
7. Update inventory levels (trigger inventory module)
8. All connected clients receive update instantly
```

### Data Flow: Low-Stock Alert
```
1. Inventory level updated (manual or via cutting record)
2. IndexedDB triggers check against threshold
3. Notification service generates alert
4. Multi-channel delivery:
   - Email via SMTP
   - Webhook to Gotify
   - In-app notification
5. Supabase broadcasts to all subscribers
6. UI updates on all connected clients
```

### Sync Flow: Multi-Client Collaboration
```
1. Client A modifies cutting record
2. Save to Supabase PostgreSQL (via API)
3. Supabase broadcasts change via real-time subscriptions
4. Client B receives update via Supabase subscription
5. Supabase handles conflict resolution (last-write-wins)
6. Client B updates local IndexedDB cache
7. Client B UI updates reactively
8. Process repeats for all connected clients
```

### Authentication Flow
```
1. User enters credentials on login page
2. Credentials validated against users store
3. JWT token generated with role information
4. Token stored in IndexedDB (encrypted)
5. Page-level permission checks on navigation
6. API-level permission checks on operations
7. Automatic token refresh before expiry
8. Secure logout with token invalidation
```

## Error Handling Patterns

### Database Errors
- Transaction rollback on failure
- Automatic retry with exponential backoff
- User-friendly error messages via modal system
- Detailed logging to console.error (preserved)
- Fallback to localStorage for critical UI state

### Network Errors
- Graceful degradation when P2P unavailable
- Queue operations for background sync
- Clear user feedback about offline status
- Automatic reconnection attempts
- No data loss during temporary disconnection

### Validation Errors
- Client-side validation before database operations
- Clear field-level error indicators
- Helpful error messages explaining constraints
- Prevention of invalid data entry
- Server-side validation for future API integration

## Performance Patterns

### Lazy Loading
- Load modules only when needed
- Defer non-critical JavaScript
- Progressive image loading
- Dynamic import for heavy features

### Caching Strategy
- Service worker: Network-first for dynamic data
- IndexedDB for persistent application data
- localStorage only for UI preferences
- Supabase provides automatic data caching and offline sync

### Debouncing/Throttling
- Search input debouncing (300ms)
- Real-time sync throttling to prevent flooding
- Window resize event throttling
- Scroll event optimization

## Security Patterns

### Data Encryption
- Supabase TLS/SSL encryption for data in transit
- PostgreSQL encryption at rest
- Encrypted token storage
- Secure password hashing
- No plaintext sensitive data

### Access Control
- Role-based permission matrix
- Route-level access guards
- API-level authorization checks
- Audit trail for sensitive operations

### Network Security
- Shop network containment
- VPN detection and enforcement
- WebRTC encrypted connections
- No public internet P2P exposure

## Code Quality Standards

### Modernization Achievements
- ✅ **Zero browser alert() calls**: All replaced with EECOL modal system
- ✅ **Zero console.log pollution**: 400+ debug statements removed
- ✅ **console.error preservation**: Error tracking maintained
- ✅ **Professional production code**: Clean, maintainable codebase

### Documentation Requirements
**MANDATORY TWO-STEP PROCESS** (from CONTEXT.md):
1. **BEFORE fixes**: Document issue in CONTEXT.md with technical details
2. **AFTER fixes**: Update documentation with implementation details

This ensures complete change tracking and prevents gaps in project history.
