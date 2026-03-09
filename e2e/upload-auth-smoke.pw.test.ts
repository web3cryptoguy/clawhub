import { expect, test } from '@playwright/test'
import { stat } from 'node:fs/promises'
import { expectNoRuntimeErrors, trackRuntimeErrors } from './helpers/runtimeErrors'

async function hasAuthStorageState() {
  const path = process.env.PLAYWRIGHT_AUTH_STORAGE_STATE?.trim()
  if (!path) return null
  try {
    const file = await stat(path)
    return file.isFile() ? path : null
  } catch {
    return null
  }
}

test('authenticated upload preflight stays healthy', async ({ browser, baseURL }) => {
  const storageState = await hasAuthStorageState()
  test.skip(!storageState, 'Set PLAYWRIGHT_AUTH_STORAGE_STATE to run authenticated smoke.')

  const context = await browser.newContext({ baseURL, storageState })
  const page = await context.newPage()
  const errors = trackRuntimeErrors(page)

  await page.goto('/upload?updateSlug=gifgrep', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('text=Something went wrong!')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: /publish a skill/i })).toBeVisible()
  await expect(page.locator('#slug')).toHaveValue('gifgrep')
  await expectNoRuntimeErrors(page, errors)

  await context.close()
})

test('authenticated import preflight stays healthy', async ({ browser, baseURL }) => {
  const storageState = await hasAuthStorageState()
  test.skip(!storageState, 'Set PLAYWRIGHT_AUTH_STORAGE_STATE to run authenticated smoke.')

  const context = await browser.newContext({ baseURL, storageState })
  const page = await context.newPage()
  const errors = trackRuntimeErrors(page)

  await page.goto('/import', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('text=Something went wrong!')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Import from GitHub' })).toBeVisible()
  await expect(page.getByPlaceholder('owner/repo')).toBeVisible()
  await expectNoRuntimeErrors(page, errors)

  await context.close()
})
