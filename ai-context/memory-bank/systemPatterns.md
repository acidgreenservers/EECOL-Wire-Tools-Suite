# System Patterns

## System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                      Browser Layer (PWA)                     │
├─────────────────────────────────────────────────────────────┤
│  Pages Layer                                                 │
│  ├─ Index/Dashboard                                         │
│  ├─ Cutting Records        ├─ Inventory Records            │
│  ├─ Cutting Reports        ├─ Inventory Reports            │
│  ├─ Calculator Tools       ├─ Maintenance Checklists       │
│  └─ Database Config        └─ Live Statistics              │
├─────────────────────────────────────────────────────────────┤
│  Application Layer (JavaScript Modules)                      │
│  ├─ Page-specific logic (src/assets/js/*.js)               │
│  └─ Shared utilities and helpers                            │
├─────────────────────────────────────────────────────────────┤
│  Core Services Layer                                        │
│  ├─ Database: src/core/database/indexeddb.js               │
│  ├─ PWA Core: src/assets/js/pwa-core.js                    │
│  └─ Modules: industry-standards.js, product-data.js        │
├─────────────────────────────────────────────────────────────┤
│  Storage Layer                                              │
│  ├─ IndexedDB (primary persistent storage)                 │
│  └─ localStorage (UI state only)                            │
└─────────────────────────────────────────────────────────────┘
```

## Key Technical Decisions

### 1. Storage Strategy: IndexedDB-First
**Decision**: Use IndexedDB as the primary storage for all application data.
**Rationale**:
- IndexedDB provides a transaction-safe, high-performance local database.
- It eliminates the race conditions and storage limitations of localStorage.
- It's a browser-native technology with no external dependencies.

**Implementation**:
- Core database wrapper: `src/core/database/indexeddb.js`
- All application data flows through this abstraction layer.

### 2. Page-Centric Architecture
**Decision**: Each major feature is a standalone HTML page with a dedicated JavaScript module.
**Rationale**:
- Simpler mental model for development.
- Easy to test and maintain individual features.
- Better browser caching.

**Structure**:
```
src/pages/[feature-name]/
  ├─ [feature-name].html
  └─ (JS in src/assets/js/[feature-name].js)
```

### 3. No Framework Dependencies
**Decision**: Vanilla JavaScript with minimal dependencies.
**Rationale**:
- Lower learning curve for maintenance.
- Smaller bundle size and faster load times.
- Better long-term maintainability.

### 4. EECOL-Branded Modal System
**Decision**: Custom modal dialog system replacing browser alerts.
**Rationale**:
- Professional appearance consistent with the brand.
- Better UX with custom styling and animations.
- Central implementation in shared utilities.

## Design Patterns in Use

### 1. Module Pattern
Each feature uses a revealing module pattern for encapsulation.

### 2. Repository Pattern
Database access is abstracted through a repository-like interface:
```javascript
// IndexedDB wrapper provides a consistent API
const db = new EECOLIndexedDB();
await db.add('cuttingRecords', record);
await db.getAll('cuttingRecords');
```

### 3. Singleton Pattern
Core services like the database are instantiated once and shared.

## Component Relationships

### Core Application Components

#### 1. Cutting Records System
**Files**:
- `src/pages/cutting-records/cutting-records.html`
- `src/assets/js/cutting-records.js`
**Dependencies**:
- IndexedDB (data persistence)
- Inventory Records (material availability check)
- Wire Mark Calculator (integrated calculations)

#### 2. Inventory Records System
**Files**:
- `src/pages/inventory-records/inventory-records.html`
- `src/assets/js/inventory-records.js`
**Dependencies**:
- IndexedDB (data persistence)
- Product data module (wire specifications)

#### 3. Calculator Tools Suite
**Files**:
- `src/assets/js/wire-weight-estimator.js`
- `src/assets/js/wire-mark-calculator.js`
- etc.
**Dependencies**:
- Industry standards module (wire specifications)

#### 4. Reporting System
**Files**:
- `src/assets/js/cutting-reports.js`
- `src/assets/js/inventory-reports.js`
- `src/assets/js/live-statistics.js`
**Dependencies**:
- IndexedDB (historical data)
- Chart/visualization libraries (future)

### Core Service Components

#### 1. IndexedDB Service
**File**: `src/core/database/indexeddb.js`
**Responsibilities**:
- Database initialization and schema migration.
- Transaction-safe CRUD operations.
- Index management.

**Stores**:
- `cuttingRecords`, `inventoryRecords`, `maintenanceLogs`, `users`, `notifications`, `calculations`, `settings`, `markConverter`, `stopmarkConverter`, `reelcapacityEstimator`

#### 2. PWA Core Service
**File**: `src/assets/js/pwa-core.js`
**Responsibilities**:
- Service worker registration
- Offline functionality
- Cache management

## Critical Implementation Paths

### Data Flow: Creating a Cutting Record
```
1. User fills form in cutting-records.html
2. JavaScript validates input (cutting-records.js)
3. Check inventory availability (query IndexedDB)
4. Calculate wire usage (use industry-standards module)
5. Save to IndexedDB (via database service)
6. Update inventory levels (trigger inventory module)
```

## Error Handling Patterns

### Database Errors
- Transaction rollback on failure
- Automatic retry with exponential backoff
- User-friendly error messages via modal system
- Detailed logging to console.error (preserved)

### Network Errors
- The application is designed to be fully functional offline.

### Validation Errors
- Client-side validation before database operations
- Clear field-level error indicators
- Helpful error messages explaining constraints

## Performance Patterns

### Caching Strategy
- Service worker: Network-first for dynamic data
- IndexedDB for persistent application data
- localStorage only for UI preferences

### Debouncing/Throttling
- Search input debouncing (300ms)
- Window resize event throttling
- Scroll event optimization

## Security Patterns

### Data Encryption
- Data is not encrypted at rest. It relies on the security of the underlying operating system and browser.

### Access Control
- The application is single-user and does not have access control features.

## Code Quality Standards

### Modernization Achievements
- ✅ **Zero browser alert() calls**: All replaced with EECOL modal system
- ✅ **Zero console.log pollution**: Debug statements removed from production code.
- ✅ **console.error preservation**: Error tracking maintained.

### Documentation Requirements
**MANDATORY TWO-STEP PROCESS**:
1.  **BEFORE fixes**: Document the issue in `ai-context/`.
2.  **AFTER fixes**: Update documentation with implementation details.
