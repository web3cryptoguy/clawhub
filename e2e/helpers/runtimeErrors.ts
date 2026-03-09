import { expect, type Page } from '@playwright/test'

export function trackRuntimeErrors(page: Page) {
  const errors: string[] = []

  page.on('pageerror', (error) => {
    errors.push(`pageerror:${error.message}`)
  })

  page.on('console', (message) => {
    if (message.type() !== 'error') return
    errors.push(`console:${message.text()}`)
  })

  return errors
}

export async function expectNoRuntimeErrors(page: Page, errors: string[]) {
  await expect
    .poll(() => errors, {
      message: `Unexpected runtime errors on ${page.url() || 'unknown page'}`,
      timeout: 1000,
    })
    .toEqual([])
}
