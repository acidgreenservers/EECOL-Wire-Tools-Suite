---
description: Defines the mandatory protocol for handling all code contributions (new features, bug fixes, refactors) to ensure they are high-quality, consistent, and documented in the project's memory bank.
author: https://github.com/jeanibarz
version: 1.0
tags: ["protocol", "contribution", "workflow", "quality-assurance", "documentation", "core-behavior"]
globs: ["src/**/*", "tests/**/*", "README.md", "package.json"]
---
# Cline Contribution Protocol

**Objective:** To establish a rigorous and consistent workflow for all code contributions. This protocol ensures that every change aligns with project standards (`EECOL-Style.md`, `techContext.md`), is thoroughly planned, and is documented within the project's knowledge base (`memory-bank/`) before completion.
 
**Core Principle:** All contributions are a formal process. This protocol is **mandatory** for any task involving code modification, new feature creation, bug fixing, or refactoring. It integrates directly with the **Continuous Improvement Protocol**.
 
---

## Phase 1: Contribution Analysis & Planning

Before writing any code, I **must** perform the following analysis and gain user approval for the proposed plan.

### 1.1. Deconstruct the Request
*   **Identify Goal:** Clearly define the primary objective. Is it a `new feature`, `bug fix`, `refactor`, or `documentation` update?
*   **Define Scope:** Determine the boundaries of the task. What parts of the application will be affected? What is explicitly out of scope?
*   **Clarify Ambiguities:** If the request is unclear, ask clarifying questions to ensure complete understanding before proceeding.

### 1.2. Align with Project Standards
*   **Project Style Guide Review:** Explicitly reference the project's style guide (e.g., `STYLE.md`, `EECOL-Style.md`).
    *   Which existing component, file, or module is the best style reference?
    *   Which shared components, classes, or utilities can and **must** be used?
    *   Does this require a new shared component/utility? If so, a proposal must be generated as per the project's guidelines.
*   **Technical Context Review:** Check for relevant technical constraints, dependencies, or established patterns (e.g., data storage patterns, framework conventions, architectural rules).

### 1.3. Formulate & Propose an Action Plan
*   Present a clear, structured plan to the user for approval. This plan **must** include:
    *   **Action:** A summary of the goal.
    *   **Files to be Modified/Created:** A list of all files that will be touched.
    *   **Utils to be Used:** An explicit list of existing utils that will be leveraged.
    *   **Reasoning:** A brief justification for the approach.
    *   **Expected Outcome:** A description of the final result.

*Example Action Plan Proposal:*
```markdown
### Proposed Action Plan

**Action:** Add a new `config:set` command to the CLI tool.
**Files to be Created/Modified:**
- `src/commands/config/set.js` (new)
- `src/services/config-manager.js` (modified)
- `docs/commands.md` (modified)
**Utils to be Used:**
- `src/utils/file-system.js` for reading/writing the config file.
- `src/utils/logger.js` for console output.
**Reasoning:** This command will allow users to update configuration values directly from the command line, improving usability and scriptability.
**Expected Outcome:** A new, fully functional CLI command `my-cli config:set <key> <value>` that safely updates the project's configuration file.

**Waiting for your approval to proceed.**
```

---

## Phase 2: Implementation

Once the user approves the action plan, proceed with code generation.

### 2.1. Generate Code
*   Implement the changes exactly as described in the approved plan.
*   Adhere strictly to the `EECOL-Style.md` checklist regarding visual and code consistency.
*   Ensure all new code follows the project's technical patterns (e.g., Vanilla JS, IndexedDB for storage, no `console.log` spam).

### 2.2. Self-Correction and Verification
*   After generation, review the code against the action plan and the `EECOL-Style.md` checklist.
*   Verify that no utility functions were unnecessarily rewritten.
*   Confirm that all new UI elements match the established theme.
*   Ensure no debugging artifacts (`console.log`, commented-out code) remain.

---

## Phase 3: Mandatory Documentation & Knowledge Capture

This phase is a **non-skippable** step that ties the contribution directly into the project's long-term memory. It **must** be executed before signaling task completion.

### 3.1. Execute Continuous Improvement Protocol
*   This contribution task requires a formal reflection. The **`continuous-improvement.md`** protocol is now active.
*   I will now perform the "Task Review & Analysis" step (1.1) from that protocol.

### 3.2. Log Contribution Details to `memory-bank/raw_reflection_log.md`
*   Based on the review, create a detailed, timestamped entry in `memory-bank/raw_reflection_log.md`.
*   This entry serves as the permanent record of the contribution's context, challenges, and solutions.

### 3.3. Required Log Content
The log entry **must** contain the following sections:

*   **`Date`**: The current date (`YYYY-MM-DD`).
*   **`TaskRef`**: A descriptive title, e.g., `"Contribution: [Summary of the feature/fix]"`.
*   **`Action_Plan`**: A copy of the user-approved action plan from Phase 1.
*   **`Implementation_Details`**:
    *   A summary of how the plan was executed.
    *   Mention any deviations from the plan and why they were necessary.
*   **`Learnings`**:
    *   What new patterns were discovered or applied?
    *   Was a new aspect of a library (`Chart.js`, `Gun.js`) or API (IndexedDB) learned?
*   **`Difficulties_and_Resolutions`**:
    *   What was challenging? (e.g., "Ensuring the print layout was consistent across browsers.")
    *   How were these challenges overcome? (e.g., "Used `@media print` CSS rules to hide non-essential UI elements.")
*   **`Key_Decisions`**:
    *   Document critical choices made during implementation.
    *   *Example:* "Decided against adding a new util for date formatting as the existing `toLocaleDateString()` was sufficient for the display requirements, preventing unnecessary code."
*   **`EECOL_Style_Checklist_Verification`**:
    *   A confirmation statement: "Verified that the implementation adheres to all relevant sections of `EECOL-Style.md`. Visuals match the reference page `[page_name].html`, and shared utils were used for modals and printing."
*   **`Improvements_Identified_For_Consolidation`**:
    *   Identify any generalizable patterns or critical insights from this task that should be moved to `memory-bank/consolidated_learnings.md` in the future.

*Example Entry Snippet in `raw_reflection_log.md`:*
```markdown
---
Date: 2025-11-03
TaskRef: "Contribution: Fix Multi-Cut Planner Functionality"

Action_Plan:
- Action: Fix the non-functional "Multi-Cut Planner" tool.
- Files to be Modified: `src/pages/multi-cut-planner/multi-cut-planner.js`, `src/pages/multi-cut-planner/multi-cut-planner.html`
- Utils to be Used: `modal.js`, `reel-capacity-estimator.js`, `reel-size-estimator.js`

Implementation_Details:
- Diagnosed that ES6 module functions were not accessible to HTML `onclick` handlers due to module scoping.
- Implemented global exports (`window.functionName = functionName`) for all functions called by the HTML to bridge the scope gap.

Difficulties_and_Resolutions:
- The initial fixes for module loading (`type="module"`) did not resolve the issue. The root cause was function accessibility, not module loading. This required a deeper level of debugging to differentiate between a loaded module and callable functions.

Key_Decisions:
- Decided to export functions to the `window` object as a targeted solution, as this pattern is necessary for legacy HTML event attributes (`onclick`) to interact with modern ES6 modules.

EECOL_Style_Checklist_Verification:
- Verified that the implementation adheres to all relevant sections of `EECOL-Style.md`. The `modal.js` util is used for all user notifications.

Improvements_Identified_For_Consolidation:
- Pattern: When using ES6 modules, functions called by HTML event attributes (e.g., `onclick`) must be explicitly exported to the global `window` scope to be accessible.
---
```

---

## Phase 4: Completion

Only after all previous phases, especially the documentation in Phase 3, are complete,
and i have output to the file "contributing.md" in the "memory-bank" folder can I signal task completion to the user. i need to search for where the "memory-bank" folder is if i dont already know, so i dont create a new file, if one already exsists in the "memory-bank" folder.