# Task: PRD-003 — Add Due Date Field

**Owner:** TBD  
**Priority:** P1 (demo-ready)  
**Estimated Effort:** 90 minutes  
**Status:** Not Started

---

## Overview

Add an optional due date field to tasks. Users can set a due date when creating a task, view it in the task list, and edit it later. This adds basic task scheduling capability to TodoMatic.

**Related Documents:**
- [docs/PRD.md](PRD.md) — PRD-003
- [docs/architecture/prd-001-002-003-enhancements.md](architecture/prd-001-002-003-enhancements.md)

---

## Step-by-Step Implementation Plan

### Step 1: Update Data Model
**File:** [src/App.jsx](../src/App.jsx)

1. Update the initial `DATA` array to include `dueDate` field:
   ```jsx
   const DATA = [
     { id: "todo-0", name: "Eat", completed: true, dueDate: null },
     { id: "todo-1", name: "Sleep", completed: false, dueDate: "2026-02-10" },
     { id: "todo-2", name: "Repeat", completed: false, dueDate: null }
   ];
   ```

### Step 2: Add Date Input to Form Component
**File:** [src/components/Form.jsx](../src/components/Form.jsx)

1. Add `dueDate` state:
   ```jsx
   const [dueDate, setDueDate] = useState('');
   ```

2. Add date input field after the name input:
   ```jsx
   <label htmlFor="new-todo-duedate" className="label__lg">
     Due Date <span className="optional-label">(optional)</span>
   </label>
   <input
     type="date"
     id="new-todo-duedate"
     className="input input__lg"
     value={dueDate}
     onChange={(e) => setDueDate(e.target.value)}
   />
   ```

3. Update `handleSubmit` to pass both name and dueDate:
   ```jsx
   function handleSubmit(e) {
     e.preventDefault();
     if (name.trim()) {
       props.addTask(name, dueDate || null);
       setName('');
       setDueDate('');
     }
   }
   ```

### Step 3: Update addTask Function in App
**File:** [src/App.jsx](../src/App.jsx)

1. Update `addTask` signature to accept `dueDate`:
   ```jsx
   function addTask(name, dueDate) {
     const newTask = {
       id: "todo-" + nanoid(),
       name: name,
       completed: false,
       dueDate: dueDate
     };
     setTasks([...tasks, newTask]);
   }
   ```

2. Pass `dueDate` prop to Todo components:
   ```jsx
   const taskList = tasks
     .filter(FILTER_MAP[filter])
     .map((task) => (
       <Todo
         id={task.id}
         name={task.name}
         completed={task.completed}
         dueDate={task.dueDate}
         key={task.id}
         toggleTaskCompleted={toggleTaskCompleted}
         deleteTask={deleteTask}
         editTask={editTask}
       />
     ));
   ```

### Step 4: Display Due Date in Todo Component
**File:** [src/components/Todo.jsx](../src/components/Todo.jsx)

1. Create date formatting helper function at the top of the file:
   ```jsx
   function formatDate(isoString) {
     if (!isoString) return '';
     const date = new Date(isoString);
     return date.toLocaleDateString('en-US', { 
       month: 'short', 
       day: 'numeric', 
       year: 'numeric' 
     });
   }
   ```

2. Update `viewTemplate` to display due date:
   ```jsx
   const viewTemplate = (
     <div className="stack-small">
       <div className="c-cb">
         <input
           id={props.id}
           type="checkbox"
           defaultChecked={props.completed}
           onChange={() => props.toggleTaskCompleted(props.id)}
         />
         <label className="todo-label" htmlFor={props.id}>
           {props.name}
         </label>
       </div>
       {props.dueDate && (
         <p className="todo-duedate">
           Due: {formatDate(props.dueDate)}
         </p>
       )}
       <div className="btn-group">
         <button type="button" className="btn" onClick={() => setEditing(true)}>
           Edit <span className="visually-hidden">{props.name}</span>
         </button>
         <button
           type="button"
           className="btn btn__danger"
           onClick={() => props.deleteTask(props.id)}
         >
           Delete <span className="visually-hidden">{props.name}</span>
         </button>
       </div>
     </div>
   );
   ```

### Step 5: Add Date Editing to Todo Component
**File:** [src/components/Todo.jsx](../src/components/Todo.jsx)

1. Add `newDueDate` state:
   ```jsx
   const [newDueDate, setNewDueDate] = useState('');
   ```

2. Update the `useEffect` that initializes edit mode to include due date:
   ```jsx
   useEffect(() => {
     if (!wasEditing && isEditing) {
       setNewName(props.name);
       setNewDueDate(props.dueDate || '');
       editFieldRef.current.focus();
     }
     if (wasEditing && !isEditing) {
       editButtonRef.current.focus();
     }
   }, [isEditing, wasEditing, props.name, props.dueDate]);
   ```

3. Update dependency array of the effect to include `props.dueDate`

4. Update `editingTemplate` to include date input:
   ```jsx
   const editingTemplate = (
     <form className="stack-small" onSubmit={handleSubmit}>
       <div className="form-group">
         <label className="todo-label" htmlFor={props.id}>
           New name for {props.name}
         </label>
         <input
           id={props.id}
           className="todo-text"
           type="text"
           value={newName}
           onChange={handleChange}
           ref={editFieldRef}
         />
       </div>
       <div className="form-group">
         <label className="todo-label" htmlFor={`${props.id}-duedate`}>
           Due Date
         </label>
         <input
           type="date"
           id={`${props.id}-duedate`}
           className="todo-text"
           value={newDueDate}
           onChange={(e) => setNewDueDate(e.target.value)}
         />
       </div>
       <div className="btn-group">
         <button type="button" className="btn todo-cancel" onClick={() => setEditing(false)}>
           Cancel
           <span className="visually-hidden">renaming {props.name}</span>
         </button>
         <button type="submit" className="btn btn__primary todo-edit">
           Save
           <span className="visually-hidden">new name for {props.name}</span>
         </button>
       </div>
     </form>
   );
   ```

5. Update `handleSubmit` to pass both name and due date:
   ```jsx
   function handleSubmit(e) {
     e.preventDefault();
     if (newName.trim()) {
       props.editTask(props.id, newName, newDueDate || null);
       setNewName('');
       setNewDueDate('');
       setEditing(false);
     }
   }
   ```

### Step 6: Update editTask Function in App
**File:** [src/App.jsx](../src/App.jsx)

1. Update `editTask` signature to accept `dueDate`:
   ```jsx
   function editTask(id, newName, newDueDate) {
     const editedTaskList = tasks.map((task) => {
       if (id === task.id) {
         return { ...task, name: newName, dueDate: newDueDate };
       }
       return task;
     });
     setTasks(editedTaskList);
   }
   ```

### Step 7: Add Styling for Due Date Display
**File:** [src/index.css](../src/index.css)

1. Add styles for due date display:
   ```css
   .todo-duedate {
     font-size: 1.2rem;
     color: #666;
     margin: 0.5rem 0 0 2.5rem; /* Indent to align with checkbox label */
     font-style: italic;
   }

   .optional-label {
     font-size: 0.9em;
     color: #999;
     font-weight: normal;
   }
   ```

### Step 8: Test and Verify
1. Run `yarn dev` and verify:
   - Form has a due date field labeled "Due Date (optional)"
   - Can add tasks with and without due dates
   - Tasks with due dates show "Due: MMM DD, YYYY" format
   - Tasks without due dates show no extra text
   - Can edit task to add, update, or remove due date
   - Date input works correctly in edit mode
2. Run `yarn lint` and fix any issues
3. Run `yarn build` to ensure production build succeeds
4. Test keyboard navigation and screen reader announcements

---

## Playwright Testing Plan

### Test File: `tests/duedate.spec.js`

#### Test 1: Add Task with Due Date
```javascript
import { test, expect } from '@playwright/test';

test('Can add a task with a due date', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Fill in task name
  await page.fill('#new-todo-input', 'Task with due date');
  
  // Fill in due date
  await page.fill('#new-todo-duedate', '2026-03-15');
  
  // Click Add
  await page.locator('button').filter({ hasText: 'Add' }).click();
  
  // Verify task appears with due date
  const taskItem = page.locator('li').filter({ hasText: 'Task with due date' });
  await expect(taskItem).toBeVisible();
  
  // Check due date is displayed
  const dueDate = taskItem.locator('.todo-duedate');
  await expect(dueDate).toContainText('Due:');
  await expect(dueDate).toContainText('Mar 15, 2026');
});
```

#### Test 2: Add Task without Due Date
```javascript
test('Can add a task without a due date', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Fill in task name only
  await page.fill('#new-todo-input', 'Task without due date');
  
  // Click Add (leave due date empty)
  await page.locator('button').filter({ hasText: 'Add' }).click();
  
  // Verify task appears
  const taskItem = page.locator('li').filter({ hasText: 'Task without due date' });
  await expect(taskItem).toBeVisible();
  
  // Verify no due date is displayed
  const dueDate = taskItem.locator('.todo-duedate');
  await expect(dueDate).not.toBeVisible();
});
```

#### Test 3: Edit Task to Add Due Date
```javascript
test('Can edit a task to add a due date', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add task without due date
  await page.fill('#new-todo-input', 'Add due date later');
  await page.locator('button').filter({ hasText: 'Add' }).click();
  
  // Click Edit
  const taskItem = page.locator('li').filter({ hasText: 'Add due date later' });
  await taskItem.locator('button').filter({ hasText: 'Edit' }).click();
  
  // Set due date in edit mode
  await page.fill(`input[type="date"]`, '2026-04-20');
  
  // Click Save
  await page.locator('button.btn__primary').filter({ hasText: 'Save' }).click();
  
  // Verify due date now appears
  const dueDate = taskItem.locator('.todo-duedate');
  await expect(dueDate).toContainText('Apr 20, 2026');
});
```

#### Test 4: Edit Task to Update Due Date
```javascript
test('Can edit a task to update the due date', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add task with due date
  await page.fill('#new-todo-input', 'Update due date');
  await page.fill('#new-todo-duedate', '2026-05-10');
  await page.locator('button').filter({ hasText: 'Add' }).click();
  
  // Click Edit
  const taskItem = page.locator('li').filter({ hasText: 'Update due date' });
  await taskItem.locator('button').filter({ hasText: 'Edit' }).click();
  
  // Update due date
  const dateInput = page.locator(`input[type="date"]`);
  await dateInput.fill('2026-05-25');
  
  // Click Save
  await page.locator('button.btn__primary').filter({ hasText: 'Save' }).click();
  
  // Verify due date is updated
  const dueDate = taskItem.locator('.todo-duedate');
  await expect(dueDate).toContainText('May 25, 2026');
});
```

#### Test 5: Edit Task to Remove Due Date
```javascript
test('Can edit a task to remove the due date', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add task with due date
  await page.fill('#new-todo-input', 'Remove due date');
  await page.fill('#new-todo-duedate', '2026-06-15');
  await page.locator('button').filter({ hasText: 'Add' }).click();
  
  // Click Edit
  const taskItem = page.locator('li').filter({ hasText: 'Remove due date' });
  await taskItem.locator('button').filter({ hasText: 'Edit' }).click();
  
  // Clear due date
  const dateInput = page.locator(`input[type="date"]`);
  await dateInput.clear();
  
  // Click Save
  await page.locator('button.btn__primary').filter({ hasText: 'Save' }).click();
  
  // Verify due date is removed
  const dueDate = taskItem.locator('.todo-duedate');
  await expect(dueDate).not.toBeVisible();
});
```

#### Test 6: Date Format Display
```javascript
test('Due date displays in correct format', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  const testCases = [
    { input: '2026-01-05', expected: 'Jan 5, 2026' },
    { input: '2026-12-25', expected: 'Dec 25, 2026' },
    { input: '2027-07-04', expected: 'Jul 4, 2027' }
  ];
  
  for (const testCase of testCases) {
    // Add task with specific date
    await page.fill('#new-todo-input', `Date test ${testCase.input}`);
    await page.fill('#new-todo-duedate', testCase.input);
    await page.locator('button').filter({ hasText: 'Add' }).click();
    
    // Verify format
    const taskItem = page.locator('li').filter({ hasText: `Date test ${testCase.input}` });
    const dueDate = taskItem.locator('.todo-duedate');
    await expect(dueDate).toContainText(testCase.expected);
  }
});
```

#### Test 7: Due Date Persists Through Filter Changes
```javascript
test('Due date persists when switching filters', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add incomplete task with due date
  await page.fill('#new-todo-input', 'Filtered task');
  await page.fill('#new-todo-duedate', '2026-08-10');
  await page.locator('button').filter({ hasText: 'Add' }).click();
  
  // Switch to Active filter
  await page.locator('button.toggle-btn').filter({ hasText: 'Active' }).click();
  
  // Verify task still shows due date
  const taskItem = page.locator('li').filter({ hasText: 'Filtered task' });
  const dueDate = taskItem.locator('.todo-duedate');
  await expect(dueDate).toContainText('Aug 10, 2026');
  
  // Mark as complete
  await taskItem.locator('input[type="checkbox"]').check();
  
  // Switch to Completed filter
  await page.locator('button.toggle-btn').filter({ hasText: 'Completed' }).click();
  
  // Verify due date still shows
  await expect(dueDate).toContainText('Aug 10, 2026');
});
```

#### Test 8: Form Clears After Submission
```javascript
test('Due date field clears after adding task', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  const dueDateInput = page.locator('#new-todo-duedate');
  
  // Fill in both fields
  await page.fill('#new-todo-input', 'Clear test');
  await dueDateInput.fill('2026-09-20');
  
  // Submit
  await page.locator('button').filter({ hasText: 'Add' }).click();
  
  // Verify due date field is cleared
  await expect(dueDateInput).toHaveValue('');
});
```

#### Test 9: Accessibility - Date Input Labels
```javascript
test('Date inputs have proper labels', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Check Form date input has label
  const formDateInput = page.locator('#new-todo-duedate');
  const formLabel = page.locator('label[for="new-todo-duedate"]');
  await expect(formLabel).toBeVisible();
  await expect(formLabel).toContainText('Due Date');
  
  // Add a task and enter edit mode
  await page.fill('#new-todo-input', 'Edit label test');
  await page.locator('button').filter({ hasText: 'Add' }).click();
  
  const taskItem = page.locator('li').filter({ hasText: 'Edit label test' });
  await taskItem.locator('button').filter({ hasText: 'Edit' }).click();
  
  // Check edit mode date input has label
  const editDateLabel = page.locator('label').filter({ hasText: 'Due Date' });
  await expect(editDateLabel).toBeVisible();
});
```

#### Test 10: Due Date with Completed Tasks
```javascript
test('Due date displays correctly for completed tasks', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add task with due date
  await page.fill('#new-todo-input', 'Complete with date');
  await page.fill('#new-todo-duedate', '2026-10-15');
  await page.locator('button').filter({ hasText: 'Add' }).click();
  
  // Mark as complete
  const taskItem = page.locator('li').filter({ hasText: 'Complete with date' });
  await taskItem.locator('input[type="checkbox"]').check();
  
  // Verify due date still shows
  const dueDate = taskItem.locator('.todo-duedate');
  await expect(dueDate).toContainText('Oct 15, 2026');
  
  // Uncheck
  await taskItem.locator('input[type="checkbox"]').uncheck();
  
  // Verify due date still shows
  await expect(dueDate).toContainText('Oct 15, 2026');
});
```

### Running the Tests

1. Install Playwright:
   ```bash
   yarn add -D @playwright/test
   npx playwright install
   ```

2. Create Playwright config:
   ```javascript
   // playwright.config.js
   module.exports = {
     testDir: './tests',
     use: {
       baseURL: 'http://localhost:5173',
     },
     webServer: {
       command: 'yarn dev',
       port: 5173,
       reuseExistingServer: !process.env.CI,
     },
   };
   ```

3. Run tests:
   ```bash
   yarn test
   ```

---

## Acceptance Criteria Checklist

- [ ] Form has optional due date input field with clear label
- [ ] Can add task with due date (stored as ISO 8601 string)
- [ ] Can add task without due date (stores `null`)
- [ ] Tasks with due dates display "Due: MMM DD, YYYY" format
- [ ] Tasks without due dates show no extra text
- [ ] Can edit task to add due date
- [ ] Can edit task to update due date
- [ ] Can edit task to remove due date
- [ ] Due date persists through filter changes
- [ ] Due date displays correctly for completed tasks
- [ ] Date inputs have proper `<label>` elements
- [ ] Form clears due date field after submission
- [ ] Edit mode initializes with current due date value
- [ ] `yarn lint` passes
- [ ] `yarn build` succeeds
- [ ] All Playwright tests pass

---

## Dependencies

None (uses native HTML5 date input)

---

## Edge Cases & Considerations

1. **Browser compatibility:** HTML5 `<input type="date">` is not supported in IE11, but Vite/React 19 doesn't target IE11
2. **Date validation:** Native date input prevents invalid formats (e.g., Feb 30)
3. **Timezone handling:** Dates are stored as ISO 8601 strings (YYYY-MM-DD) with no time component, avoiding timezone issues
4. **Empty state:** `null` or empty string both represent "no due date" 
5. **Future enhancement:** Could add visual indicators for overdue tasks (requires date comparison logic)

---

## Rollback Plan

If issues occur:
1. Revert changes to [src/App.jsx](../src/App.jsx):
   - Remove `dueDate` from `DATA` array
   - Revert `addTask` to single parameter
   - Revert `editTask` to two parameters
   - Remove `dueDate` prop from `<Todo>` components
2. Revert changes to [src/components/Form.jsx](../src/components/Form.jsx):
   - Remove `dueDate` state and input field
   - Revert `handleSubmit` to pass only `name`
3. Revert changes to [src/components/Todo.jsx](../src/components/Todo.jsx):
   - Remove `formatDate` helper
   - Remove due date from `viewTemplate`
   - Remove `newDueDate` state
   - Remove due date input from `editingTemplate`
   - Revert `handleSubmit` to pass only name
4. Remove due date styles from [src/index.css](../src/index.css)
5. Run `yarn build` to verify rollback succeeds
