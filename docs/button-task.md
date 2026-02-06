# Task: PRD-001 — Improve Button Styling

**Owner:** TBD  
**Priority:** P1 (demo-ready)  
**Estimated Effort:** 30 minutes  
**Status:** Not Started

---

## Overview

Update button styles to make primary actions and destructive actions visually distinct with clear hover states and filter button selection states.

**Related Documents:**
- [docs/PRD.md](PRD.md) — PRD-001
- [docs/architecture/prd-001-002-003-enhancements.md](architecture/prd-001-002-003-enhancements.md)

---

## Step-by-Step Implementation Plan

### Step 1: Update CSS for Button Styles
**File:** [src/index.css](../src/index.css)

1. Add primary button styling (for "Add" and "Save" buttons):
   ```css
   .btn__primary {
     background-color: #0066cc;
     color: white;
   }
   
   .btn__primary:hover,
   .btn__primary:focus {
     background-color: #004d99;
   }
   ```

2. Add danger button styling (for "Delete" buttons):
   ```css
   .btn__danger {
     background-color: #d32f2f;
     color: white;
   }
   
   .btn__danger:hover,
   .btn__danger:focus {
     background-color: #a52222;
   }
   ```

3. Add filter button selected state styling:
   ```css
   .toggle-btn--selected {
     border: 3px solid #333;
     background-color: #e6e6e6;
     font-weight: bold;
   }
   ```

4. Ensure all buttons have hover states:
   ```css
   .btn:hover,
   .btn:focus {
     box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
   }
   ```

### Step 2: Update FilterButton Component
**File:** [src/components/FilterButton.jsx](../src/components/FilterButton.jsx)

1. Add conditional class based on `isPressed` prop:
   ```jsx
   <button
     type="button"
     className={`btn toggle-btn ${props.isPressed ? 'toggle-btn--selected' : ''}`}
     aria-pressed={props.isPressed}
     onClick={() => props.setFilter(props.name)}
   >
     <span className="visually-hidden">Show </span>
     <span>{props.name}</span>
     <span className="visually-hidden"> tasks</span>
   </button>
   ```

### Step 3: Verify Existing Button Classes
**Files to check:**
- [src/components/Form.jsx](../src/components/Form.jsx) — Ensure "Add" button has `className="btn btn__primary"`
- [src/components/Todo.jsx](../src/components/Todo.jsx) — Ensure "Save" button has `className="btn btn__primary"` and "Delete" button has `className="btn btn__danger"`

### Step 4: Test and Verify
1. Run `yarn dev` and visually verify:
   - Primary buttons (Add, Save) are blue
   - Delete buttons are red
   - Filter buttons show bold border when selected
   - All buttons show hover state (darker shade or shadow)
2. Test keyboard navigation to verify focus states work
3. Run `yarn lint` to check for style issues
4. Run `yarn build` to ensure production build succeeds

---

## Playwright Testing Plan

### Test File: `tests/button-styling.spec.js`

#### Test 1: Primary Button Styling
```javascript
test('Add and Save buttons have primary styling', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Check Add button has primary class
  const addButton = page.locator('button.btn__primary').filter({ hasText: 'Add' });
  await expect(addButton).toBeVisible();
  
  // Add a task and enter edit mode to check Save button
  await page.fill('#new-todo-input', 'Test task');
  await addButton.click();
  
  // Click Edit to enter edit mode
  await page.locator('button').filter({ hasText: 'Edit' }).first().click();
  
  // Check Save button has primary class
  const saveButton = page.locator('button.btn__primary').filter({ hasText: 'Save' });
  await expect(saveButton).toBeVisible();
});
```

#### Test 2: Danger Button Styling
```javascript
test('Delete button has danger styling', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Add a task first
  await page.fill('#new-todo-input', 'Task to delete');
  await page.locator('button').filter({ hasText: 'Add' }).click();
  
  // Check Delete button has danger class
  const deleteButton = page.locator('button.btn__danger').filter({ hasText: 'Delete' });
  await expect(deleteButton).toBeVisible();
});
```

#### Test 3: Filter Button Selected State
```javascript
test('Filter buttons show selected state', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // By default, "All" should be selected
  const allButton = page.locator('button.toggle-btn').filter({ hasText: 'All' });
  await expect(allButton).toHaveClass(/toggle-btn--selected/);
  await expect(allButton).toHaveAttribute('aria-pressed', 'true');
  
  // Click "Active" filter
  const activeButton = page.locator('button.toggle-btn').filter({ hasText: 'Active' });
  await activeButton.click();
  
  // Active should now have selected class
  await expect(activeButton).toHaveClass(/toggle-btn--selected/);
  await expect(activeButton).toHaveAttribute('aria-pressed', 'true');
  
  // All should no longer have selected class
  await expect(allButton).not.toHaveClass(/toggle-btn--selected/);
  await expect(allButton).toHaveAttribute('aria-pressed', 'false');
});
```

#### Test 4: Button Hover States
```javascript
test('Buttons show hover states', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  const addButton = page.locator('button').filter({ hasText: 'Add' });
  
  // Get initial background color
  const initialBg = await addButton.evaluate((el) => 
    window.getComputedStyle(el).backgroundColor
  );
  
  // Hover over button
  await addButton.hover();
  
  // Background should change on hover
  const hoverBg = await addButton.evaluate((el) => 
    window.getComputedStyle(el).backgroundColor
  );
  
  expect(initialBg).not.toBe(hoverBg);
});
```

#### Test 5: Accessibility - Contrast Requirements
```javascript
test('Button colors meet WCAG contrast requirements', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // This test requires a contrast checking library like axe-core
  // Install: npm install -D @axe-core/playwright
  const { injectAxe, checkA11y } = require('axe-playwright');
  
  await injectAxe(page);
  
  // Check for contrast violations on buttons
  await checkA11y(page, '.btn', {
    rules: {
      'color-contrast': { enabled: true }
    }
  });
});
```

### Running the Tests

1. Install Playwright:
   ```bash
   yarn add -D @playwright/test
   npx playwright install
   ```

2. Add test script to `package.json`:
   ```json
   "scripts": {
     "test": "playwright test",
     "test:ui": "playwright test --ui"
   }
   ```

3. Run tests:
   ```bash
   yarn test
   ```

---

## Acceptance Criteria Checklist

- [ ] "Add" button uses consistent primary style (blue background, white text)
- [ ] "Save" button uses consistent primary style (blue background, white text)
- [ ] "Delete" button has destructive style (red background, white text)
- [ ] Filter buttons show clear selected state (bold border, darker background)
- [ ] All buttons have visible hover state (darker shade or shadow)
- [ ] Button styles meet WCAG 4.5:1 contrast requirements
- [ ] `yarn lint` passes
- [ ] `yarn build` succeeds
- [ ] All Playwright tests pass

---

## Dependencies

None (CSS-only changes)

---

## Rollback Plan

If issues occur:
1. Revert CSS changes in [src/index.css](../src/index.css)
2. Remove conditional class from [src/components/FilterButton.jsx](../src/components/FilterButton.jsx)
3. Run `yarn build` to verify rollback succeeds
