# Project Brief

## Project Identity
- **Name**: EECOL Wire Tools Suite - Edge
- **Version**: 0.8.0.2
- **Repository**: EECOL-Wire-Tools-Suite-Edge
- **Location**: /home/gamer/Documents/GitTea/EECOL-Wire-Tools-Suite-Edge
- **Branch**: edge (main branch for PRs: main)
- **Developers**: Lucas (PM/Business) & Claude AI (Engineering)

## Core Purpose
Enterprise-grade wire processing and inventory management suite designed for EECOL manufacturing operations. The system provides offline-first functionality and robust local data management tools for shop floor teams.

## Primary Goals
1. **Reliability**: Eliminate async race conditions and data corruption issues
2. **Data Integrity**: Provide users with tools to manage their own data backups and restores.
3. **Security**: Implement enterprise-grade authentication and authorization
4. **Accessibility**: Work seamlessly offline.
5. **Professionalism**: Maintain clean, production-ready codebase

## Key Requirements

### Functional Requirements
- **Wire Cutting Operations**: Track cutting records and manage operations.
- **Inventory Management**: Real-time material tracking.
- **Reporting & Analytics**: Production metrics, historical analysis, performance tracking
- **Calculator Tools**: Wire weight, wire mark, stop mark, reel capacity estimators
- **Maintenance Tracking**: Equipment scheduling, work orders, automated reminders
- **Education Hub**: Training materials, knowledge base, feedback system
- **Local Data Management**: Tools for users to export, import, and delete their local database.

### Technical Requirements
- **Storage**: IndexedDB-first for local data storage.
- **Authentication**: Role-based access control (Admin, Management, Auditor, Inventory Ops, Wire Ops)
- **PWA Support**: Installable, offline-first, service worker background sync
- **Security**: Shop-network containment, VPN support
- **Performance**: Zero console pollution, professional UX

### Non-Functional Requirements
- **Browser Support**: Modern browsers (>1%, not IE11)
- **Node Version**: >= 16.0.0
- **Network**: Local network/VPN only
- **Data Integrity**: Robust data validation and backup/restore functionality.
- **Audit Trail**: Comprehensive logging for compliance

## Success Criteria
- Zero async race conditions in database operations
- 100% uptime for data persistence
- Enterprise-grade security audit compliance
- Professional production environment (no debug pollution)

## Project Constraints
- **No Cloud Dependencies**: Must operate 100% on-premises
- **Legacy Compatibility**: Must migrate existing localStorage data
- **User Experience**: Consistent EECOL-branded modal system (no browser alerts)

## Current Phase
**Phase**: Active development on Edge branch
**Status**: v0.8.0.2 production-ready
**Recent Achievement**: Local Data Management tools implemented.
**Focus**: Maintaining stability while implementing enterprise features

## Key Stakeholders
- **Primary Users**: Shop floor wire cutting operators
- **Secondary Users**: Inventory managers, maintenance technicians
- **Administrative Users**: Management, auditors, system administrators
- **Development Team**: Lucas (PM), Claude AI (Engineering)
