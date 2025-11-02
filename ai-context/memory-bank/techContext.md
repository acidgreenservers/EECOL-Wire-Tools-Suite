# Technical Context

## Technology Stack

### Core Technologies

#### Frontend
- **HTML5**: Semantic markup, modern web standards
- **CSS3**: Custom styling with EECOL branding
  - Grid and Flexbox for layouts
  - CSS custom properties for theming
  - Responsive design patterns
- **JavaScript (ES6+)**: Vanilla JS, no framework dependencies
  - Module pattern for code organization
  - Async/await for asynchronous operations
  - Modern DOM APIs

#### Data Storage
**Current Implementation (v0.8.0.1)**:
- **IndexedDB**: Browser-based local database
  - ACID-compliant transactions
  - 12 object stores (cuttingRecords, inventoryRecords, etc.)
  - Custom wrapper class: `src/core/database/indexeddb.js`
  - Offline-first architecture
  - Fast, reliable, no external dependencies

**Planned Migration**:
- **Supabase**: Cloud-based PostgreSQL database (NOT yet implemented)
  - Will provide ACID-compliant cloud storage
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Automatic API generation
  - Cross-device synchronization

#### Synchronization
**Current Implementation**:
- **IndexedDB Local Storage**: Local-only data persistence
  - No real-time synchronization
  - Offline-first architecture
  - Fast local operations

**Planned Migration**:
- **Supabase Realtime**: Cloud-based synchronization
  - WebSocket-based real-time updates
  - Multi-client synchronization
  - Offline queue management
  - Real-time subscriptions for live collaboration

#### Security
**Current Implementation**:
- **crypto-js v4.1.1**: Cryptographic utilities
- **uuid v9.0.0**: Unique identifier generation
- **IndexedDB**: Client-side data security

**Planned Migration**:
- **Supabase Auth**: Enterprise authentication (future)
- **Row Level Security**: Database-level access control (future)
- **Supabase TLS/SSL**: Data encryption in transit

### Development Tools

#### Build Tools
- **Webpack v5.75.0**: Module bundler
  - Code splitting
  - Asset optimization
  - Development server
  - Production builds
- **Babel v7.20.0**: JavaScript transpiler
  - ES6+ to ES5 conversion
  - TypeScript support
  - Browser compatibility

#### Type Checking
- **TypeScript v4.9.0**: Optional static typing
  - Type definitions for external libraries
  - Better IDE support
  - Compile-time error detection
  - Note: Currently used for type definitions, not full TypeScript migration

#### Testing
- **Jest v29.3.0**: Unit testing framework
  - JSDOM environment for DOM testing
  - Code coverage reports
  - Snapshot testing
- **Cypress v12.0.0**: End-to-end testing
  - Real browser testing
  - Visual regression testing
  - Network stubbing

#### Code Quality
- **ESLint v8.28.0**: JavaScript linter
  - Code style enforcement
  - Error detection
  - TypeScript ESLint plugin
- **TailwindCSS v3.2.0**: Utility-first CSS framework (planned integration)

#### Development Server
- **http-server v14.1.1**: Simple HTTP server
  - Development mode serving
  - No caching for rapid iteration
  - Cross-origin resource sharing (CORS) support
- **webpack-dev-server v4.11.0**: Hot module replacement

#### Containerization
- **Docker**: Deployment containerization
  - Nginx-based production serving
  - Multi-stage builds for optimization
  - docker-compose for orchestration

## Development Setup

### Prerequisites
```bash
Node.js >= 16.0.0
npm >= 7.0.0
Git for version control
```

### Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd EECOL-Wire-Tools-Suite-Edge

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

#### Development
```bash
# Start development server on http://localhost:3000
npm run dev

# Build for development with watch mode
npm run build:dev
```

#### Production
```bash
# Create optimized production build
npm run build

# Run tests before deployment
npm run test

# Deploy (implementation specific)
npm run deploy
```

#### Testing
```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Open Cypress test runner
npm run cypress
```

#### Code Quality
```bash
# Lint JavaScript/TypeScript
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Type check without emitting files
npm run type-check
```

#### Docker
```bash
# Build Docker image
npm run docker:build

# Run container
npm run docker:run
```

## Project Structure

```
EECOL-Wire-Tools-Suite-Supabase/
├── src/                          # Source code
│   ├── core/                     # Core services and modules
│   │   ├── database/
│   │   │   ├── supabase.js       # Supabase client and configuration
│   │   │   └── migrations.js     # Data migration utilities
│   │   └── modules/
│   │       ├── industry-standards.js
│   │       └── wesco-eecol-products.js
│   ├── pages/                    # Feature pages
│   │   ├── index/
│   │   │   └── index.html
│   │   ├── cutting-records/
│   │   │   └── cutting-records.html
│   │   ├── inventory-records/
│   │   │   └── inventory-records.html
│   │   ├── cutting-reports/
│   │   ├── inventory-reports/
│   │   ├── live-statistics/
│   │   ├── maintenance/
│   │   ├── calculator tools/
│   │   └── education/
│   ├── assets/
│   │   ├── css/                  # Stylesheets
│   │   │   ├── eecol-theme.css   # Global theme
│   │   │   └── [feature].css     # Feature-specific
│   │   ├── js/                   # JavaScript modules
│   │   │   ├── pwa-core.js
│   │   │   ├── [feature].js      # Feature-specific
│   │   │   └── ...
│   │   └── img/                  # Images and icons
├── config/                       # Build configuration
│   ├── build.js
│   ├── test.js
│   └── deploy.js
├── tests/                        # Test suites
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/                         # Documentation
├── docker/                       # Docker configuration
│   ├── docker-compose.yml
│   ├── nginx.conf
│   └── Dockerfile
├── memory-bank/                  # AI assistant memory
├── CONTEXT.md                    # Development context
├── README.md                     # Project overview
├── package.json                  # Dependencies
└── webpack.config.js             # Webpack configuration
```

## Technical Constraints

### Browser Compatibility
**Target**: Modern browsers only
- Chrome/Edge >= 90
- Firefox >= 88
- Safari >= 14
- No Internet Explorer support

**Rationale**:
- IndexedDB v2 features
- ES6+ JavaScript
- Modern CSS Grid/Flexbox
- Service Worker APIs

### Storage Limits
- **IndexedDB**: Unlimited quota (user-granted)
- **localStorage**: 5-10MB (UI state only)
- **Service Worker Cache**: 50MB recommended limit

### Network Requirements
- **Online Sync**: Internet connection required for cloud features (future)
- **Offline**: Full functionality without network
- **Local Network**: Optional for future collaborative features

### Performance Targets
- **Page Load**: < 2 seconds on 3G
- **Time to Interactive**: < 3 seconds
- **First Contentful Paint**: < 1 second
- **Database Operations**: < 100ms for local IndexedDB queries

## Dependencies

### Production Dependencies
**Current (v0.8.0.1)**:
```json
{
  "gun": "^0.2020.1240",           // P2P sync (to be removed)
  "gun/sea": "^0.2020.1240",       // P2P encryption (to be removed)
  "crypto-js": "^4.1.1",           // Cryptography
  "uuid": "^9.0.0"                 // Unique IDs
}
```

**Planned After Migration**:
```json
{
  "@supabase/supabase-js": "^2.x.x", // Supabase client (to be added)
  "crypto-js": "^4.1.1",             // Cryptography
  "uuid": "^9.0.0"                   // Unique IDs
}
```
Note: Gun.js will be removed; Supabase will be added

### Development Dependencies
See package.json for complete list. Key tools:
- Webpack ecosystem (bundling, optimization)
- Babel (transpilation)
- TypeScript (type checking)
- Jest (unit testing)
- Cypress (E2E testing)
- ESLint (code quality)

## Tool Usage Patterns

### Git Workflow
- **Main Branch**: `main` - Production-ready code
- **Development Branch**: `edge` - Active development
- **Feature Branches**: `feature/[name]` - New features
- **Bugfix Branches**: `bugfix/[name]` - Bug fixes

**Commit Convention**:
```
type(scope): description

feat(multi-cut): add phase 1 planner functionality
fix(inventory): resolve race condition in stock updates
docs(changelog): document completed features
refactor(cutting): modernize alert system to modals
```

### Code Style Guidelines

#### JavaScript
- Use `const` by default, `let` when mutation needed
- Avoid `var` entirely
- Use arrow functions for callbacks
- Async/await over Promise chains
- Descriptive variable names (no single letters except loop counters)

#### CSS
- BEM methodology for class names (Block__Element--Modifier)
- EECOL color scheme: `#0058B3` (primary blue)
- Mobile-first responsive design
- Avoid `!important` unless absolutely necessary

#### HTML
- Semantic HTML5 elements
- Accessible markup (ARIA labels, roles)
- Proper heading hierarchy
- Form validation attributes

### Debugging Patterns

#### Production Environment
- **console.error**: Error logging ONLY (preserved)
- **console.warn**: Critical warnings ONLY
- **console.log**: REMOVED from production
- **Modal Dialogs**: User-facing error messages

#### Development Environment
- Browser DevTools for debugging
- Network tab for Supabase API calls
- Supabase dashboard for data verification
- Service Worker inspector for PWA debugging

### Testing Strategy

#### Unit Tests
- Test individual functions in isolation
- Mock external dependencies (Gun.js, IndexedDB)
- Test edge cases and error conditions
- Maintain >80% code coverage

#### Integration Tests
- Test module interactions
- Database operations end-to-end
- Real-time synchronization scenarios (future)
- Authentication flows

#### E2E Tests
- Critical user workflows
- Cross-browser compatibility
- Mobile responsive behavior
- Offline functionality

## Security Practices

### Code Security
- No hardcoded credentials
- Environment variables for sensitive config
- Input validation on all user data
- Output escaping to prevent XSS
- Parameterized queries (IndexedDB)

### Data Security
- Encrypted storage for sensitive data
- Secure session management
- Automatic logout after inactivity
- Audit trails for administrative actions

### Network Security
- HTTPS required in production
- TLS/SSL encryption for data in transit
- Secure API endpoints
- Rate limiting and DDoS protection (via Supabase)

## Deployment

### Build Process
```bash
# 1. Clean previous builds
rm -rf dist/

# 2. Run tests
npm test

# 3. Type check
npm run type-check

# 4. Lint code
npm run lint

# 5. Production build
npm run build

# 6. Build Docker image
npm run docker:build
```

### Production Environment
- **Server**: Nginx or similar static file server
- **HTTPS**: Required for Service Worker and WebRTC
- **Headers**: Proper CORS, CSP, security headers
- **Caching**: Aggressive caching for static assets
- **Compression**: Gzip/Brotli for text resources

### Environment Configuration
- **Development**: `.env.development`
- **Production**: `.env.production`
- **Variables**:
  - `API_URL`: Backend API endpoint (future)
  - `TURN_SERVER`: TURN server for P2P (optional)
  - `SMTP_CONFIG`: Email notification settings
  - `GOTIFY_URL`: Webhook notification URL

## Migration Notes

### Supabase Migration Plan (November 2, 2025)
**Status**: Planning phase - NOT yet started
**Timeline**: 4-5 weeks (8 phases)
**Detailed Roadmap**: See `ai-context/memory-bank/roadmap.md`

**Migration Strategy**:
- **Storage**: IndexedDB + Gun.js → Storage Abstraction Layer → Configurable backend
- **Modes**: Three storage modes (IndexedDB only / Supabase only / Hybrid)
- **Architecture**: Create abstraction layer, maintain backward compatibility
- **Sync**: Gun.js P2P (to be removed) → Supabase Realtime subscriptions
- **Security**: Current client-side → Supabase RLS + Auth (future)

### Data Migration Utilities (To Be Implemented)
**Planned location**: `src/core/database/storage-adapter.js`
**Features**:
- Automated transfer from IndexedDB to Supabase
- Bidirectional sync (IndexedDB ↔ Supabase)
- Integrity verification and conflict resolution
- Rollback capability to IndexedDB
- Offline queue for failed sync operations
- User-controlled migration via settings UI

## Performance Optimization

### Bundle Size
- Code splitting by route
- Lazy loading for heavy features
- Tree shaking for unused code
- Minification and compression

### Runtime Performance
- Debounced input handlers
- Throttled sync operations
- Virtual scrolling for large lists
- IndexedDB index optimization

### Network Optimization
- Service Worker caching
- Network-first strategy for dynamic data
- Cache-first for static assets
- Background sync for offline operations

## Troubleshooting

### Common Issues

#### IndexedDB Issues (Current)
- Check browser compatibility (requires modern browser)
- Verify browser storage quota not exceeded
- Clear browser data if corruption suspected
- Check browser console for IndexedDB errors


#### Future Supabase Issues (After Migration)
- Supabase connection errors: Check internet, verify URL/API key
- Real-time sync issues: Check Realtime enabled, RLS policies
- Authentication issues: Verify Supabase Auth configuration

#### Service Worker Issues
- Unregister and re-register worker
- Clear cache storage
- Check for update loops
- Verify manifest configuration

### Debug Tools
- Chrome DevTools Application tab
- Supabase Dashboard for data inspection
- Network tab for API calls and WebSocket connections
- Browser console for real-time subscription logs
