# Task: PRD-002 — Add Top Banner

**Owner:** TBD  
**Priority:** P1 (demo-ready)  
**Estimated Effort:** 45 minutes  
**Status:** Not Started

---

## Overview

Add a top banner showing the app title, subtitle, and a quick info item (task count). The banner provides better visual hierarchy and demo polish.

**Related Documents:**
- [docs/PRD.md](PRD.md) — PRD-002
- [docs/architecture/prd-001-002-003-enhancements.md](architecture/prd-001-002-003-enhancements.md)

---

## Step-by-Step Implementation Plan

### Step 1: Create Banner Component
**File:** [src/components/Banner.jsx](../src/components/Banner.jsx) (new file)

1. Create new component file:
   ```jsx
   function Banner({ title, subtitle, infoText }) {
     return (
       <div className="banner" role="banner">
         <div className="banner__content">
           <h1 className="banner__title">{title}</h1>
           <p className="banner__subtitle">{subtitle}</p>
         </div>
         <div className="banner__info" aria-live="polite">
           {infoText}
         </div>
       </div>
     );
   }

   export default Banner;
   ```

### Step 2: Add Banner Styles
**File:** [src/index.css](../src/index.css)

1. Add banner styles:
   ```css
   .banner {
     display: flex;
     justify-content: space-between;
     align-items: center;
     padding: 1rem 0;
     border-bottom: 2px solid #ddd;
     margin-bottom: 2rem;
   }

   .banner__content {
     flex: 1;
   }

   .banner__title {
     font-size: 3rem;
     margin: 0;
     color: #000;
   }

   .banner__subtitle {
     font-size: 1.2rem;
     color: #666;
     margin: 0.5rem 0 0 0;
   }

   .banner__info {
     font-size: 1.4rem;
     font-weight: bold;
     color: #0066cc;
   }

   @media (max-width: 600px) {
     .banner {
       flex-direction: column;
       align-items: flex-start;
     }
     
     .banner__info {
       margin-top: 1rem;
     }
   }
   ```

### Step 3: Integrate Banner into App
**File:** [src/App.jsx](../src/App.jsx)

1. Import the Banner component:
   ```jsx
   import Banner from "./components/Banner";
   ```

2. Compute task count for info text (add before return statement):
   ```jsx
   const taskNoun = tasks.length !== 1 ? "tasks" : "task";
   const totalTasksText = `${tasks.length} ${taskNoun} total`;
   ```

3. Add Banner component before the existing heading:
   ```jsx
   return (
     <div className="todoapp stack-large">
       <Banner 
         title="TodoMatic" 
         subtitle="React + Vite demo" 
         infoText={totalTasksText} 
       />
       {/* Remove or comment out the existing <h1>TodoMatic</h1> */}
       <Form addTask={addTask} />
       {/* ... rest of the JSX */}
     </div>
   );
   ```

4. Remove the duplicate `<h1>TodoMatic</h1>` heading to avoid redundancy

### Step 4: Test and Verify
1. Run `yarn dev` and verify:
   - Banner appears at the top
   - Title shows "TodoMatic"
   - Subtitle shows "React + Vite demo"
   - Info shows correct task count (e.g., "3 tasks total" or "1 task total")
2. Add and delete tasks to verify count updates dynamically
3. Test responsive layout on mobile viewport
4. Run `yarn lint` and fix any issues
5. Run `yarn build` to ensure production build succeeds

---

## Playwright Testing Plan

### Test File: `tests/banner.spec.js`

#### Test 1: Banner Displays Correctly
```javascript
import { test, expect } from '@playwright/test';

test('Banner displays title, subtitle, and task count', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Check banner is visible
  const banner = page.locator('.banner');
  await expect(banner).toBeVisible();
  
  // Check title
  const title = banner.locator('.banner__title');
  await expect(title).toHaveText('TodoMatic');
  
  // Check subtitle
  const subtitle = banner.locator('.banner__subtitle');
  await expect(subtitle).toHaveText('React + Vite demo');
  
  // Check info shows default task count
  const info = banner.locator('.banner__info');
  await expect(info).toContainText('tasks total');
});
```

#### Test 2: Task Count Updates Dynamically
```javascript
test('Task count updates when tasks are added', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  const bannerInfo = page.locator('.banner__info');
  
  // Get initial count (should be 3 based on default data)
  const initialText = await bannerInfo.textContent();
  const initialMatch = initialText.match(/(\d+) task/);
  const initialCount = initialMatch ? parseInt(initialMatch[1]) : 0;
  
  // Add a new task
  await page.fill('#new-todo-input', 'New test task');
  await page.locator('button').filter({ hasText: 'Add' }).click();
  
  // Verify count increased by 1
  await expect(bannerInfo).toContainText(`${initialCount + 1} task`);
});
```

#### Test 3: Task Count Updates When Tasks Deleted
```javascript
test('Task count updates when tasks are deleted', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  const bannerInfo = page.locator('.banner__info');
  
  // Add a task first
  await page.fill('#new-todo-input', 'Task to delete');
  await page.locator('button').filter({ hasText: 'Add' }).click();
  
  // Get count after adding
  const afterAddText = await bannerInfo.textContent();
  const afterAddMatch = afterAddText.match(/(\d+) task/);
  const countAfterAdd = afterAddMatch ? parseInt(afterAddMatch[1]) : 0;
  
  // Delete the task
  await page.locator('button.btn__danger').filter({ hasText: 'Delete' }).first().click();
  
  // Verify count decreased by 1
  await expect(bannerInfo).toContainText(`${countAfterAdd - 1} task`);
});
```

#### Test 4: Singular vs Plural Task Noun
```javascript
test('Shows correct singular/plural task noun', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  const bannerInfo = page.locator('.banner__info');
  
  // Delete all tasks except one to test singular
  const deleteButtons = page.locator('button.btn__danger');
  const count = await deleteButtons.count();
  
  // Delete all but leave one
  for (let i = 0; i < count - 1; i++) {
    await deleteButtons.first().click();
  }
  
  // Should show "1 task total" (singular)
  await expect(bannerInfo).toHaveText('1 task total');
  
  // Add another task
  await page.fill('#new-todo-input', 'Second task');
  await page.locator('button').filter({ hasText: 'Add' }).click();
  
  // Should show "2 tasks total" (plural)
  await expect(bannerInfo).toHaveText('2 tasks total');
});
```

#### Test 5: Banner Accessibility
```javascript
test('Banner has proper ARIA attributes', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  const banner = page.locator('.banner');
  
  // Check banner has role="banner"
  await expect(banner).toHaveAttribute('role', 'banner');
  
  // Check info section has aria-live for dynamic updates
  const info = page.locator('.banner__info');
  await expect(info).toHaveAttribute('aria-live', 'polite');
});
```

#### Test 6: Responsive Layout
```javascript
test('Banner layout adapts on mobile viewport', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('http://localhost:5173');
  
  const banner = page.locator('.banner');
  
  // Check that banner uses flex-direction: column on mobile
  const flexDirection = await banner.evaluate((el) => 
    window.getComputedStyle(el).flexDirection
  );
  
  expect(flexDirection).toBe('column');
});
```

#### Test 7: Banner Updates Don't Cause Focus Loss
```javascript
test('Adding task updates banner without losing focus', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  const input = page.locator('#new-todo-input');
  const addButton = page.locator('button').filter({ hasText: 'Add' });
  
  // Add a task
  await input.fill('Focus test task');
  await addButton.click();
  
  // Input should be focused after adding (existing behavior)
  // Banner should update without disrupting this
  const bannerInfo = page.locator('.banner__info');
  await expect(bannerInfo).toContainText('tasks total');
  
  // Verify we can immediately type in the input again
  await input.type('Another task');
  await expect(input).toHaveValue('Another task');
});
```

### Running the Tests

1. Install Playwright:
   ```bash
   yarn add -D @playwright/test
   npx playwright install
   ```

2. Create Playwright config if not exists:
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
     },
   };
   ```

3. Run tests:
   ```bash
   yarn test
   ```

---

## Acceptance Criteria Checklist

- [ ] Banner is visible at the top of the app
- [ ] Banner includes title "TodoMatic"
- [ ] Banner includes subtitle "React + Vite demo"
- [ ] Banner includes task count info (e.g., "5 tasks total")
- [ ] Task count updates when tasks are added
- [ ] Task count updates when tasks are deleted
- [ ] Singular/plural noun is correct ("1 task" vs "2 tasks")
- [ ] Banner has proper semantic HTML (`role="banner"`)
- [ ] Info text has `aria-live="polite"` for dynamic updates
- [ ] Banner layout is responsive on mobile viewports
- [ ] `yarn lint` passes
- [ ] `yarn build` succeeds
- [ ] All Playwright tests pass

---

## Dependencies

None (uses existing React and Vite setup)

---

## Rollback Plan

If issues occur:
1. Remove Banner import from [src/App.jsx](../src/App.jsx)
2. Remove `<Banner>` JSX and related variables
3. Restore original `<h1>TodoMatic</h1>` heading
4. Delete [src/components/Banner.jsx](../src/components/Banner.jsx)
5. Remove banner styles from [src/index.css](../src/index.css)
6. Run `yarn build` to verify rollback succeeds
