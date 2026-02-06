import { test, expect } from '@playwright/test';

test.describe('Button Styling Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Add and Save buttons have primary styling', async ({ page }) => {
    // Check Add button has primary class
    const addButton = page.locator('button.btn__primary').filter({ hasText: 'Add' });
    await expect(addButton).toBeVisible();
    
    // Verify Add button has correct background color (blue)
    const addButtonBg = await addButton.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );
    expect(addButtonBg).toBe('rgb(0, 102, 204)'); // #0066cc
    
    // Add a task and enter edit mode to check Save button
    await page.fill('#new-todo-input', 'Test task');
    await addButton.click();
    
    // Click Edit to enter edit mode
    await page.locator('button').filter({ hasText: 'Edit' }).first().click();
    
    // Check Save button has primary class
    const saveButton = page.locator('button.btn__primary').filter({ hasText: 'Save' });
    await expect(saveButton).toBeVisible();
    
    // Verify Save button has correct background color (blue)
    const saveButtonBg = await saveButton.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );
    expect(saveButtonBg).toBe('rgb(0, 102, 204)'); // #0066cc
  });

  test('Delete button has danger styling', async ({ page }) => {
    // Add a task first
    await page.fill('#new-todo-input', 'Task to delete');
    await page.locator('button').filter({ hasText: 'Add' }).click();
    
    // Check Delete button has danger class - use first() to handle multiple delete buttons
    const deleteButton = page.locator('button.btn__danger').filter({ hasText: 'Delete' }).first();
    await expect(deleteButton).toBeVisible();
    
    // Verify Delete button has correct background color (red)
    const deleteButtonBg = await deleteButton.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );
    expect(deleteButtonBg).toBe('rgb(211, 47, 47)'); // #d32f2f
  });

  test('Filter buttons show selected state', async ({ page }) => {
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

  test('Buttons show hover states', async ({ page }) => {
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
    expect(hoverBg).toBe('rgb(0, 77, 153)'); // #004d99 (darker blue)
  });

  test('Button hover states show box shadow', async ({ page }) => {
    // Test general button hover state with box shadow
    const editButton = page.locator('button').filter({ hasText: 'Edit' }).first();
    
    // We need to add a task first to have an Edit button
    await page.fill('#new-todo-input', 'Test task for hover');
    await page.locator('button').filter({ hasText: 'Add' }).click();
    
    // Get initial box shadow (should be none)
    const initialShadow = await editButton.evaluate((el) => 
      window.getComputedStyle(el).boxShadow
    );
    
    // Hover over the Edit button
    await editButton.hover();
    
    // Box shadow should now be present
    const hoverShadow = await editButton.evaluate((el) => 
      window.getComputedStyle(el).boxShadow
    );
    
    expect(hoverShadow).toContain('rgba(0, 0, 0, 0.2)');
    expect(hoverShadow).not.toBe(initialShadow);
  });
});
