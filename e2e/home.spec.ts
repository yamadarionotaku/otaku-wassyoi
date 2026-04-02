import { expect, test } from "@playwright/test";

test.describe("home page", () => {
  test("renders the global shell", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/おたくわっしょい/);

    const navigation = page.getByRole("navigation", {
      name: "グローバルナビゲーション",
    });

    await expect(navigation).toBeVisible();
    await expect(
      navigation.getByRole("link", { name: "グッズ一覧" }),
    ).toBeVisible();
    await expect(
      navigation.getByRole("link", { name: "キャラ別" }),
    ).toBeVisible();
    await expect(navigation.getByRole("link", { name: "記事" })).toBeVisible();

    await expect(page.locator("footer")).toBeVisible();
  });
});
