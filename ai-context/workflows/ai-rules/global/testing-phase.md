---
description: Mandatory testing protocol for all code changes, ensuring user validation, accurate documentation, and state management.
author: [Your Name]
version: 1.0
tags: [testing, workflow, quality-assurance, user-feedback, state-management]
globs: ["**/*.js", "**/*.md"]
---

# Rule: Mandatory Testing Protocol for All Code Changes

## Objective
**MUST** enforce a mandatory testing workflow for all code changes, requiring explicit user validation, accurate documentation of results, and robust state management.

---

## Instructions

### 1. Workflow for Code Changes
**MUST** follow this sequence for all development tasks:

1. **Implement Changes**: Make technical code modifications.
2. **Prompt User Testing**: Explicitly ask the user to enter the testing phase.
3. **Wait for User Interaction**: Pause the workflow until the user provides testing feedback.
4. **Document Results**: Record actual testing results in the memory bank (never assume outcomes).
5. **Validate Success**: Only proceed after confirmed functionality.

---

### 2. Violation Consequences
- **MUST NOT** consider code changes valid without user testing validation.
- **MUST** correct memory bank entries based on assumptions rather than actual results.
- **MUST** include an explicit testing phase in the development workflow.

---

### 3. Post-Completion User Feedback Handling
**MUST** handle user feedback after "successful" testing as follows:

1. **Validate User Feedback**: Treat user reports of incorrect behavior as valid, even if technical tests pass.
2. **Provide Reset Mechanisms**: Include user-accessible ways to clear/reset application state if data appears stale or incorrect.
3. **Document State Management**: Ensure applications provide clear ways for users to manage persistent data state.
4. **Feedback Loop**: Use user reports of incorrect state to improve data validation and state management.

---

### 4. Example Implementation
**MUST** add "clear" or "reset" functionality to UI elements displaying persistent data, allowing users to correct incorrect state without technical intervention.

---

### 5. Improvements for Consolidation
- **Workflow Standardization**: Mandatory testing phase for all code changes.
- **Assumption Prevention**: Never assume fixes work without user validation.
- **Memory Bank Accuracy**: Document actual testing results, not technical assumptions.
- **Development Process**: Implement → Test → Validate → Document → Proceed.
- **Quality Assurance**: User validation required for all functionality claims.
- **State Management**: Provide user controls for persistent data state management.
- **Post-Completion Validation**: Handle user feedback about incorrect behavior after technical success.

---

## Available Tools
- **`ask_followup_question`**: To prompt the user for testing feedback.
- **`attempt_completion`**: To present results after validation.
- **`write_to_file`**: To document testing results.