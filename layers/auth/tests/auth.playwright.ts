import { test, expect } from "@playwright/test"
import { auth } from "../server/utils/auth"

test("dashboard shows user name", async ({ context, page }) => {
    const ctx = await auth.$context
    const testUtils = ctx.test

    // Create and save user
    const user = testUtils.createUser({
        email: "e2e@example.com",
        name: "E2E User"
    })
    await testUtils.saveUser(user)

    // Get cookies and inject into browser
    const cookies = await testUtils.getCookies({
        userId: user.id,
        domain: "localhost"
    })
    await context.addCookies(cookies)

    // Navigate to protected page
    await page.goto("/dashboard")

    // Assert user name is visible
    await expect(page.getByText("E2E User")).toBeVisible()

    // Cleanup
    await testUtils.deleteUser(user.id)
})