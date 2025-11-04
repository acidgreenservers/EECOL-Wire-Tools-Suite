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
- **IndexedDB**: Primary persistent storage
  - Transaction-safe operations
  - Indexed queries for performance
  - Large storage capacity (unlimited quota)
  - Browser-native, no external dependencies

### Development Tools

#### Development Server
- **http-server**: A simple, zero-configuration command-line HTTP server.

## Development Setup

### Prerequisites
- A modern web browser that supports IndexedDB and ES6+.
- A local web server to serve the files, for example `http-server`.

### Initial Setup
1.  Clone the repository.
2.  Navigate to the project directory.
3.  Start a local web server. For example, if you have Node.js installed:
    ```bash
    npx http-server
    ```
4.  Open your browser to the local server's address.

## Project Structure

```
EECOL-Wire-Tools-Suite-Edge/
├── src/                          # Source code
│   ├── core/                     # Core services and modules
│   │   ├── database/
│   │   │   └── indexeddb.js      # IndexedDB wrapper
│   │   └── modules/
│   │       ├── industry-standards.js
│   │       └── wesco-eecol-products.js
│   ├── pages/                    # Feature pages
│   │   ├── index/
│   │   ├── cutting-records/
│   │   ├── inventory-records/
│   │   ├── database-config/
│   │   └── ...
│   ├── assets/
│   │   ├── css/
│   │   ├── js/
│   │   └── img/
├── ai-context/                   # AI assistant memory and documentation
├── README.md                     # Project overview
└── SECURITY.md                   # Security policy
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
- The application is designed to be fully functional offline.

### Performance Targets
- **Page Load**: < 2 seconds on 3G
- **Time to Interactive**: < 3 seconds
- **First Contentful Paint**: < 1 second

## Dependencies
This project has no runtime dependencies. It uses vanilla JavaScript, HTML, and CSS. TailwindCSS is used for styling and is loaded from a CDN.

## Tool Usage Patterns

### Git Workflow
- **Main Branch**: `main` - Production-ready code
- **Development Branch**: `edge` - Active development

**Commit Convention**:
```
type(scope): description
```

### Code Style Guidelines

#### JavaScript
- Use `const` by default, `let` when mutation needed
- Avoid `var` entirely
- Use arrow functions for callbacks
- Async/await over Promise chains

#### CSS
- Utility-first CSS (TailwindCSS)
- EECOL color scheme: `#0058B3` (primary blue)
- Mobile-first responsive design

#### HTML
- Semantic HTML5 elements
- Accessible markup

### Debugging Patterns

- **Browser DevTools**: For debugging JavaScript, inspecting the DOM, and analyzing network requests.
- **IndexedDB inspector**: For viewing and managing the local database.
- **Service Worker inspector**: For debugging PWA functionality.

## Security Practices

### Code Security
- Input validation on all user data
- Output escaping to prevent XSS

### Data Security
- All data is stored locally on the user's device.
- No data is transmitted over the network.

## Deployment
The application is deployed as a set of static files. It can be hosted on any static web hosting service.

## Performance Optimization

### Runtime Performance
- Debounced input handlers
- Virtual scrolling for large lists
- IndexedDB index optimization

### Network Optimization
- Service Worker caching
- Network-first strategy for dynamic data
- Cache-first for static assets
- Background sync for offline operations

## Troubleshooting

### Common Issues

#### IndexedDB Errors
- Check browser quota limits
- Verify database schema version
- Inspect transactions for deadlocks
- Use the "Delete Database" button on the Database Config page to clear and re-initialize if corrupted.
