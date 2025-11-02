<div align="center">
  <h1 align="center">EECOL Wire Tools Suite</h1>
  <p align="center"><strong>Production-Ready Wire Processing Application</strong></p>
</div>

> ℹ️ **You are on the `supabase` branch.** This branch is production-ready with **IndexedDB** storage. The planned migration will introduce **user-configurable storage backends** (IndexedDB/Supabase/Hybrid) with a simple toggle switch, evolving into a full database configuration page.

**Current Version**: `v0.8.0.1`

## 🎯 **Overview**

A comprehensive Progressive Web Application (PWA) for industrial wire processing operations. Provides tools for wire inventory management, cutting operations tracking, reporting/analytics, and various wire calculation utilities.

### **Core Features**
- **Complete Tool Suite**: Cutting records, inventory management, calculators, reports
- **Offline-First Design**: Works seamlessly without internet connectivity
- **Professional Code**: Clean, production-ready with proper error handling
- **Mobile Responsive**: Optimized for all screen sizes and devices
- **PWA Installable**: Can be installed as a native app on desktop and mobile

### **Current Architecture (v0.8.0.1)**
- **IndexedDB Storage**: Fast, offline-first local database with 12 object stores
- **PWA Features**: Offline functionality, installable app, service workers
- **Professional UI**: EECOL-branded modal dialogs, responsive design

### **Planned Architecture: User-Configurable Storage**
The application is migrating to a flexible storage system where users can choose their preferred backend:

**Phase 1: Simple Toggle Switch**
- Quick settings toggle between IndexedDB and Supabase
- Seamless switching with data migration support
- Hybrid mode for automatic synchronization

**Phase 2: Full Configuration Page**
- Dedicated database configuration interface
- Advanced settings for each storage backend
- Connection testing and health monitoring
- Migration tools and data management

**Storage Modes:**
- **IndexedDB**: Local-only, offline-first (current default)
- **Supabase**: Cloud sync with real-time collaboration
- **Hybrid**: Best of both - local storage with cloud backup

---

## 📋 **Available Tools**

### **Core Operations**
- **Cutting Records**: Track wire cutting operations and history
- **Inventory Records**: Material inventory management and tracking
- **Maintenance Checklists**: Equipment maintenance logging and scheduling

### **Calculators**
- **Wire Weight Estimator**: Calculate wire weight by dimensions
- **Wire Mark Calculator**: Precise cutting mark calculations
- **Stop Mark Calculator**: Stop mark positioning calculations
- **Reel Capacity Estimator**: Calculate reel capacity for different wire sizes
- **Reel Size Estimator**: Recommend optimal reel sizes

### **Reports & Analytics**
- **Cutting Reports**: Analytics and reporting for cutting operations
- **Inventory Reports**: Inventory analytics and usage tracking
- **Live Statistics Dashboard**: Real-time metrics and combined data views for inventory and cutting

### **Additional Tools**
- **Shipping Manifest**: Generate professional shipping documentation
- **Reel Labels**: Print professional wire reel labels
- **Multi-Cut Planner**: Plan complex multi-reel cutting operations *(currently non-functional)*
- **Education Center**: Learning resources and reference materials

---

## 🔧 **Technical Details**

### **Storage Architecture**

#### **Current Implementation (IndexedDB)**
```javascript
// IndexedDB for local storage
const eecolDB = new EECOLIndexedDB();
await eecolDB.add('cuttingRecords', record);
```

**IndexedDB Object Stores (12 total):**
- `cuttingRecords` - Wire cutting operations and history
- `inventoryRecords` - Material inventory tracking
- `maintenanceLogs` - Equipment maintenance records
- `markConverter`, `stopmarkConverter`, `reelcapacityEstimator`, `reelsizeEstimator`, `muticutPlanner` - Calculator history
- `settings` - App configuration and preferences
- `users`, `notifications`, `sessions` - User management

#### **Planned: Configurable Storage Adapter**
```javascript
// Future: Unified storage API with user-selectable backend
const storage = new StorageAdapter({
  mode: 'indexeddb' // or 'supabase' or 'hybrid'
});
await storage.add('cuttingRecords', record);

// Automatic sync in hybrid mode
// Real-time subscriptions when using Supabase
// Offline queue for disconnected operations
```

**Migration Path:**
1. **Storage Abstraction Layer**: Unified API for all backends
2. **Simple Toggle**: Quick switch between IndexedDB/Supabase in settings
3. **Supabase Integration**: Cloud PostgreSQL with real-time subscriptions
4. **Full Config Page**: Advanced database configuration interface

**Benefits:**
- User choice between local-only and cloud sync
- Seamless migration with zero data loss
- Hybrid mode for offline resilience with cloud backup
- Future-proof architecture for additional backends

### **PWA Features**
- **Service Workers**: Background caching and offline functionality
- **Web App Manifest**: Installable on desktop and mobile devices
- **Offline Support**: Full functionality without internet connection
- **Background Sync**: Queues operations for when connectivity returns

---

## 🚀 **Getting Started**

### **Running the Application**
```bash
# Install dependencies
npm install

# Start development server
npm start

# Or serve static files
npx http-server
```

### **Access the Application**
- Open `http://localhost:8080` (or your server port)
- The app works completely offline once loaded
- Install as PWA from browser menu for native app experience

---

## 📊 **Current Status & Known Issues**

### **Working Features**
- ✅ All calculator tools (weight, mark, stop mark, reel capacity/size estimators)
- ✅ Cutting and inventory record management
- ✅ Reports and analytics dashboards
- ✅ Maintenance checklists
- ✅ Shipping manifests and reel labels
- ✅ Education center and learning resources
- ✅ PWA offline functionality
- ✅ Mobile responsive design

### **Known Issues**
- ❌ **Multi-Cut Planner**: Currently non-functional - requires ground-up rebuild
- ⚠️ **Live Statistics Dashboard**: localStorage fallback has crash issue
- ⚠️ **Reel Size Estimator**: User-reported bugs under investigation

### **Recent Updates**
- **November 2, 2025**: Comprehensive Supabase migration roadmap created (`ai-context/memory-bank/roadmap.md`)
- **November 2, 2025**: All documentation unified and corrected to reflect accurate current state
- **v0.8.0.1**: Code modernization, professional UI, comprehensive tool suite ✅
- **Console Cleanup**: Removed 400+ debug `console.log` statements for production readiness ✅
- **Modal System**: Replaced all browser alerts with EECOL-branded dialogs ✅
- **Mobile Navigation**: Consistent menus across all pages ✅

### **Current Status**
- ✅ **Production Ready**: IndexedDB storage fully functional
- 📋 **Migration In Progress**: Configurable storage architecture planned
- 🎯 **Next Priority**: Storage abstraction layer + user toggle switch
- 🔮 **Future**: Full database configuration page

---

## 🛠️ **Development**

### **Project Structure**
```
src/
├── core/
│   ├── database/
│   │   ├── indexeddb.js         # Current: IndexedDB implementation ✅
│   │   ├── gun-sync.js          # ⚠️ DEPRECATED: Being removed
│   │   ├── storage-adapter.js   # 🔄 IN DEVELOPMENT: Unified storage API
│   │   └── supabase-client.js   # 📋 PLANNED: Supabase integration
│   └── modules/                 # Industry standards and product data
├── pages/
│   ├── settings/
│   │   └── storage-settings.html  # 📋 PLANNED: Database config UI
│   └── [other pages]/           # Feature pages
├── assets/                      # CSS, JS, icons, shared resources
└── utils/                       # Helper utilities
```

### **Key Technologies**
**Current Stack:**
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Storage**: IndexedDB (EECOLTools_v2 database)
- **PWA**: Service Workers, Web App Manifest
- **Security**: Client-side data security, transaction-safe operations

**Planned: Configurable Storage Backend**
- **Storage Adapter**: Unified API supporting multiple backends
- **IndexedDB**: Local-only mode (offline-first)
- **Supabase**: Cloud PostgreSQL with real-time sync
- **Hybrid Mode**: Local + cloud automatic synchronization
- **User Toggle**: Simple settings switch (Phase 1)
- **Config Page**: Full database configuration UI (Phase 2)

**Future Enhancements:**
- **Supabase Auth**: Enterprise authentication with RBAC
- **Real-time Subscriptions**: Collaborative features via Supabase
- **Cloud Backups**: Automatic data backup and recovery

### **Contributing**
- Follow the established patterns in existing tools
- Use EECOL-branded modal system for user feedback
- Maintain mobile-responsive design
- Test offline functionality
- Document changes in CONTEXT.md before implementation

---

## 📄 **License**

This project is proprietary software for EECOL Wire Tools operations.
