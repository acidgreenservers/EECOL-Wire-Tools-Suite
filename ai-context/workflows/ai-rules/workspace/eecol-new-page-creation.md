---
description: Ensures all newly created pages adhere to the project’s architecture, styling paradigm, and navigation conventions.
author: [Your Name]
version: 1.0
tags: [page-creation, styling, navigation, workflow]
globs: ["**/*.html", "**/src/pages/*.html", "**/src/assets/css/*.css"]
---

# Workflow: Page Creation and Styling Compliance

<task name="page-creation-and-styling-compliance">

<task_objective>
**Objective:**
Ensure all newly created pages adhere to the project’s architecture, styling paradigm, and navigation conventions. This workflow automates the process of creating consistent, branded, and navigable pages.
</task_objective>

---

## **Instructions**

### **1. Styling Compliance**
- **MUST**: Use the shared `eecol-theme.css` theme located in `src/assets/css`. If it does not exist, create it in `src/assets/css` and ensure it matches the styling of all other pages.
- **MUST**: Pay special attention to the logo tilt in the header and the footer inside the main box window. These elements must be visually consistent with existing pages.
- **DO NOT**: Use inline styles or external CSS files outside the `src/assets/css` directory.

### **2. Modal and Popup Usage**
- **MUST**: Use the custom modal utility in `src/utils` for all browser popups/dialogues. Ensure the modal follows the project’s professional theme and branding.

### **3. Button and Navigation Consistency**
- **MUST**: Copy the ‘home’ button and the ‘useful tool’ button from the `index` page to all new pages.
- **MUST**: Use the correct `href` links for navigation:
  - In the root `index.html`, use:
    ```html
    <a href="src/pages/wire-weight-estimator/wire-weight-estimator.html">
    ```
  - In `src/pages/index.html`, use:
    ```html
    <a href="../wire-weight-estimator/wire-weight-estimator.html">
    ```
- **MUST**: Ensure all ‘home’ and ‘useful tool’ buttons use the correct `href` links, example:
<a href="../wire-weight-estimator/wire-weight-estimator.html">

### **4. Navigation Integration**
- **MUST**: Ensure the new page is navigable from the `index`. If no navigation button or system is found, use the `ask_followup_question` tool to ask the user where to place the navigation button for the new page.

---

<detailed_sequence_steps>

### **Step 1: Create the Page File**
- Create a new HTML file in the appropriate directory (e.g., `src/pages/new-page/new-page.html`).
- Ensure the file structure matches the project’s existing architecture.

### **Step 2: Apply Styling**
- Link the `eecol-theme.css` file in the `<head>` of the new page:
  ```html
  <link rel="stylesheet" href="../../assets/css/eecol-theme.css">
  ```
- Verify the logo tilt in the header and the footer inside the main box window match existing pages.

### **Step: 3 Add Navigation Buttons**
- Copy the ‘home’ and ‘useful tool’ buttons from the `index` page.
- Update the `href` attributes to match the file’s location (root or `src/pages`).

### **Step 4: Integrate Custom Modal**
- Import the custom modal utility from `src/utils`:
  ```javascript
  import { showModal } from '../../utils/modal';
  ```
- Use the modal for all popups/dialogues, ensuring branding consistency.

### **Step 5: Ensure Navigation Accessibility**
- Check if the new page is accessible from the `index`. If not, use `ask_followup_question` to clarify navigation placement with the user.

### **Step 6: Review and Validate**
- Review the page for compliance with styling, navigation, and modal usage.
- Validate all links and ensure the page is fully functional.
- If no navigation button or system is found on index page, use the ask_followup_question tool to ask the user where to place the navigation button for the new page.

</detailed_sequence_steps>

---

</task>