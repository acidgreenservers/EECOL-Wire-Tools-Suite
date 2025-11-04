# Active Context

## Current Work Focus

### Primary Branch: edge
**Active Development**: v0.8.0.2
**Target Architecture**: Local-first PWA with robust data management tools.

### Recent Changes Summary

#### ✅ Local Data Management Implementation (November 3, 2025)
**Status**: ✅ COMPLETED
**Issue**: The project previously lacked tools for users to manage their local data directly.
**Solution**:
1.  **Created a "Database Config" page:** A new page that allows users to manage their local IndexedDB data.
3.  **Implemented Data Management Features:**
    *   **Export to JSON:** Users can now export their entire database to a JSON file.
    *   **Import from JSON:** Users can import a previously exported JSON file, overwriting their current data.
    *   **Delete Database:** A button to completely wipe the local IndexedDB.
4.  **Implemented Record Management:** The Database Config page also allows users to view and delete individual records from the `markConverter`, `stopmarkConverter`, and `reelcapacityEstimator` stores.
**Impact**: The application is now simpler, more stable, and gives users direct control over their local data.

**Files Modified/Created**:
-   `src/core/database/gun-sync.js` (deleted)
-   `index.html` (modified)
-   `src/pages/index/index.html` (modified)
-   `src/assets/js/cutting-records.js` (modified)
-   `src/pages/p2p-sync-status/*` (deleted)
-   `src/pages/database-config/database-config.html` (created)
-   `src/assets/js/database-config.js` (created)
-   `src/pages/backup/backup.html` (rewritten)
-   `SECURITY.md` (created)
-   `README.md` (updated)

## Next Steps

### Immediate Priorities
1.  **Rebuild Multi-Cut Planner from Scratch (Standalone)**
    -   **Decision**: Complete ground-up rebuild as standalone tool
    -   **Reason**: Previous integration approach broke reel estimators, caused cascading failures
    -   **Approach**: Self-contained tool without cross-tool dependencies
    -   **Requirements**: All functionality internal, no external tool integrations

2.  **Bug Investigation & Fixes**
    -   Reel Size Estimator reported issues (from changelog prioritization)
    -   Live Statistics dashboard localStorage fallback crash

### Medium-Term Goals
- Complete standalone Multi-Cut Planner rebuild
- Implement education hub enhancements
- Add feedback collection system
- PWA offline enhancement improvements

### Long-Term Vision
- Advanced reporting and analytics
- Role-based access control (if ever needed)

## Active Decisions & Considerations

### MANDATORY DOCUMENTATION RULE
**Status**: ACTIVE - UNSKIPPABLE
**Process**: Document changes in `ai-context/` before and after implementation.

### Code Quality Standards
- **No console.log in production**
- **No browser alerts**: EECOL-branded modal system only
- **Error logging preserved**: console.error maintained
- **Professional appearance**: Clean, production-ready code

### Development Patterns

#### File Organization
- Page-centric architecture (HTML + dedicated JS/CSS)
- Core services in src/core/ directory
- Shared utilities for common functionality
- Industry standards and product data modules

#### Data Management
- IndexedDB as the sole primary storage.
- localStorage ONLY for UI state (not application data).
- Robust error handling and fallbacks.

#### User Experience
- EECOL-branded modal dialogs for all user feedback
- Mobile-responsive design (mobile-first approach)
- Accessibility considerations

## Important Patterns & Preferences

### Naming Conventions
- **Functions**: camelCase
- **Files**: kebab-case
- **CSS Classes**: Utility classes
- **IDs**: camelCase

### Git Workflow
- **Main Branch**: `main` - Production releases
- **Development Branch**: `edge` - Active development
- **Commit Messages**: `type(scope): description`

### Testing Approach
- Manual testing for UI/UX features
- Real browser testing for PWA features

## Learnings & Project Insights

### What Works Well
- **Page-centric architecture**: Easy to maintain and understand
- **IndexedDB-first storage**: Reliable, performant, transaction-safe
- **Vanilla JavaScript**: Lower maintenance overhead, no framework lock-in
- **EECOL modal system**: Consistent, professional user experience

### Common Pitfalls Avoided
- **localStorage race conditions**: Migrated to IndexedDB
- **Async database issues**: Proper await/async patterns
- **Browser alert() calls**: Replaced with modal system
- **Console pollution**: Removed debug statements from production

### Best Practices Established
1.  **Always read files before editing**
2.  **Document before and after changes**
3.  **Test in real browser**
4.  **Mobile-first design**
5.  **Preserve error logging**

## Current Technical Debt
- Live Statistics localStorage fallback crash (needs investigation)
- Reel Size Estimator bugs (user-reported, needs investigation)
- Some pages still need PWA offline enhancement
- Education hub content needs expansion
- Feedback system needs implementation

## Integration Points

### Inter-Module Dependencies
- **All Modules ↔ IndexedDB**: Data persistence
- **All Modules ↔ Modal System**: User feedback

## User Feedback Integration
- **User directive**: Two-step documentation process (implemented)
- **User request**: Mobile menu version consistency (completed)
- **User request**: Navigation parity desktop/mobile (completed)
- **User report**: Multi-page checklist data sync (fixed)
- **User request**: PWA prompt location fixes (completed)

## Environment & Tools

### Development Environment
- **Browser**: Chrome/Firefox for testing
- **Package Manager**: npm

### Key Tools
- http-server for local development
- Git for version control
- IndexedDB inspector for data debugging

### Current Setup
- Branch: edge
- Version: v0.8.0.2
