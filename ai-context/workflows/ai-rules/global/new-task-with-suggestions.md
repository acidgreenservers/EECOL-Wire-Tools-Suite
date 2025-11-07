**"Start new task with context, while providing the user with suggested actions based on reading the memory bank"**

*(Await user input for the specific context and details of the task. After receiving the context, analyze the memory bank to suggest relevant actions.)*

---

**Example of Expected User Input After This Command:**
*"Start new task with context:
We’re working on a web app where the settings button in `root/index.html` has the correct color and icon, but the text is outdated. The button in `src/pages/index.js` has the correct text but lacks the styling. The goal is to sync both buttons so they share the same color, icon, and text."*

---

**AI Response Protocol:**
1. **Acknowledge the new task** and restate the provided context to confirm understanding.
2. **Analyze the memory bank** for related tasks, common issues, or patterns (e.g., previous debugging steps, styling syncs, or IndexedDB fixes).
3. **Provide suggested actions** based on the memory bank and context:
   - *"Sync the color and icon from `root/index.html` to `src/pages/index.js`."*
   - *"Copy the updated text from `src/pages/index.js` to `root/index.html`."*
   - *"Verify CSS classes or inline styles are consistent across both files."*
   - *"Test the buttons in a browser to confirm visual and functional parity."*
   - *"Check for dependencies or scripts that might affect button rendering (e.g., Font Awesome for icons)."*
4. **Ask clarifying questions** if needed:
   - *"Are there specific CSS frameworks (e.g., Tailwind, Bootstrap) being used for styling?"*
   - *"Should we prioritize inline styles or external stylesheets for consistency?"*
5. **Proceed with the solution** based on user confirmation or refine suggestions based on additional input.

---
**Purpose:**
Combine user-provided context with AI-driven suggestions from the memory bank to streamline task execution and improve accuracy.