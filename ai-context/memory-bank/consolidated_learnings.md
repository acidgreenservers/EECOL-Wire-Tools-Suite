# Consolidated Learnings & Patterns

This document contains curated, summarized, and actionable insights derived from `raw_reflection_log.md`. It serves as the primary, refined knowledge base for long-term use.

---

## UI & Frontend Patterns

### Pattern: Complex Dynamic Print Layouts
- **Strategy**: For generating complex print layouts from dynamic user data (e.g., labels, manifests), use a dedicated, hidden `<div>` on the page.
- **Implementation**: Populate this hidden `div` with the print-ready HTML and apply print-specific styles using `@media print` CSS rules. The print function should target this specific element.
- **Rationale**: This decouples the on-screen UI from the printed output, allowing for highly customized, professional, and consistent print results across different browsers without affecting the user's view. It effectively creates a "print preview" buffer.