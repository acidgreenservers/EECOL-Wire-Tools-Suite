<div align="center">
  <h1 align="center">EECOL Wire Tools Suite</h1>
  <p align="center"><strong>Edge Development Branch</strong></p>
</div>

> ⚠️ **You are on the `edge` branch.** This branch contains the latest features and upcoming releases. It is used for testing and may contain experimental or unstable code. For the stable, production-ready version, please use the `main` branch.

**Current Version**: `v0.8.0.1`

## 🎯 **Overview**

A comprehensive Progressive Web Application (PWA) for industrial wire processing operations. Provides tools for wire inventory management, cutting operations tracking, reporting/analytics, and various wire calculation utilities.

### **Core Features**
- **Complete Tool Suite**: Cutting records, inventory management, calculators, reports
- **Offline-First Design**: Works seamlessly without internet connectivity
- **Professional Code**: Clean, production-ready with proper error handling
- **Mobile Responsive**: Optimized for all screen sizes and devices
- **PWA Installable**: Can be installed as a native app on desktop and mobile

### **Architecture**
- **IndexedDB Backend**: High-performance local database for all data persistence
- **PWA Features**: Offline functionality, installable app, service workers
- **Professional UI**: EECOL-branded modal dialogs, responsive design
- **Storage Strategy**: IndexedDB-first with localStorage fallback for UI state

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

### **Storage Layer (IndexedDB)**
```javascript
const db = new EECOLIndexedDB({
  stores: ['cuttingRecords', 'inventoryRecords', 'maintenanceLogs', 'settings']
});
```

**Database Stores:**
- `cuttingRecords` - Wire cutting operations and history
- `inventoryRecords` - Material inventory tracking
- `maintenanceLogs` - Equipment maintenance records
- `settings` - App configuration and preferences

### **P2P Synchronization (Gun.js)**
**Status**: Partially implemented and functional.

The application includes Gun.js for peer-to-peer data synchronization. This functionality is actively being developed and is currently operational for the **Cutting Records** tool, allowing real-time data sharing between connected users on the same local network. Other tools will be integrated in future updates.

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
- ❌ **Multi-Cut Planner**: Currently non-functional - complex tool with integration issues
- ⚠️ **P2P Sync**: Only functional for the `Cutting Records` tool. Other tools do not yet sync.
- ⚠️ **Live Statistics Dashboard**: Has a known issue where it can crash when falling back to `localStorage` in some scenarios.

### **Recent Updates**
- **v0.8.0.1**: Code modernization, professional UI, comprehensive tool suite
- **Console Cleanup**: Removed 400+ debug `console.log` statements for production readiness
- **Modal System**: Replaced all browser alerts with EECOL-branded dialogs
- **Mobile Navigation**: Consistent menus across all pages

---

## 🛠️ **Development**

### **Project Structure**
```
src/
├── core/database/          # IndexedDB and Gun.js sync
├── pages/                  # HTML pages and JavaScript
├── assets/                 # CSS, icons, shared resources
├── utils/                  # Helper utilities
└── core/modules/           # Industry standards and data
```

### **Key Technologies**
- **Frontend**: Vanilla JavaScript, HTML5, TailwindCSS
- **Storage**: IndexedDB (primary), localStorage (fallback)
- **PWA**: Service Workers, Web App Manifest
- **Charts**: `Chart.js` for data visualization
- **Sync**: Gun.js (infrastructure present but non-functional)

### **Contributing**
- Follow the established patterns in existing tools
- Use EECOL-branded modal system for user feedback
- Maintain mobile-responsive design
- Test offline functionality
- Document changes in CONTEXT.md before implementation

---

## 📄 **License**

This project is proprietary software for EECOL Wire Tools operations.
