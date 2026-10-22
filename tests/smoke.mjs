import { chromium, expect } from "@playwright/test";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
  });
  page.setDefaultTimeout(10000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(process.env.APP_URL || "http://127.0.0.1:8081");
await expect(
  page.getByRole("heading", {
    name: "Plan purchases with the full picture.",
  }),
).toBeVisible();
  await page.screenshot({
    path: "/tmp/nxt-workspace-desktop.png",
    fullPage: true,
  });
  console.log("Checking projects");
  await page.getByRole("button", { name: "Projects", exact: true }).click();
  await page.getByRole("button", { name: "New project", exact: true }).click();
  await page.getByLabel("Project name").fill("Team refresh");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Create project", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Team refresh", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Compare", exact: true }).click();
  await page.getByRole("button", { name: "Security", exact: true }).click();
  await expect(page.locator(".product")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "Endpoint protection" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "All", exact: true }).click();
  await page.getByLabel("Search products").fill("thinkpad");
  await expect(page.locator(".product")).toHaveCount(1);
  await page.getByRole("button", { name: "Build a quote" }).click();
  await page.getByLabel("Quantity", { exact: true }).fill("0");
  await expect(page.getByRole("button", { name: "Save quote" })).toBeDisabled();
  await page.getByLabel("Quantity", { exact: true }).fill("20");
  await page
    .getByLabel("Project", { exact: true })
    .selectOption("Team refresh");
  await expect(page.getByRole("dialog").getByText("$21,560")).toBeVisible();
  await page.getByRole("button", { name: "Save quote" }).click();
  await expect(page.locator(".quote-row")).toHaveCount(1);
  await expect(page.locator(".quote-row")).toContainText("Team refresh");
  await page.reload();
  await page.getByRole("button", { name: /^Quotes/ }).click();
  await expect(page.locator(".quote-row")).toHaveCount(1);
  const dl = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV" }).click();
  const download = await dl;
  await download.saveAs("/tmp/nxt-quotes-test.csv");
  const { readFile } = await import("node:fs/promises");
  const csv = await readFile("/tmp/nxt-quotes-test.csv", "utf8");
  if (!csv.includes("ThinkPad T14 Gen 5") || !csv.includes("21560"))
    throw Error("CSV data mismatch");
  await page.getByRole("button", { name: "Advisor", exact: true }).click();
  await page.getByLabel("Message BoBo").fill("We need security");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator(".message.advisor")).toContainText(
    "endpoint protection",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Overview", exact: true }).click();
await expect(
  page.getByRole("heading", {
    name: "Plan purchases with the full picture.",
  }),
).toBeVisible();
  if (
    await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  )
    throw Error("Mobile horizontal overflow");
  await page.screenshot({
    path: "/tmp/nxt-workspace-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: /^Quotes/ }).click();
  await page.getByRole("button", { name: /Delete quote/ }).click();
  await expect(page.locator(".quote-row")).toHaveCount(0);
  if (errors.length) throw Error(errors.join("\n"));
  console.log(
    "PASS: desktop and mobile rendering, project creation, catalog filters/search, quantity validation, transparent totals, quote saving/persistence/deletion, CSV export, advisor guidance; no runtime errors.",
  );
} finally {
  await browser.close();
}
