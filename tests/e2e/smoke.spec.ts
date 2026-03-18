import { expect, test } from "@playwright/test";

function trackConsole(page: Parameters<typeof test>[0]["page"]) {
  const errors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });

  page.on("pageerror", (error) => {
    errors.push(error.message);
  });

  return errors;
}

async function assertPulseApp(page: Parameters<typeof test>[0]["page"]) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "PULSE" })).toBeVisible();
  await expect(page.getByText("KEY METRICS FROM PUBLIC DATA")).toBeVisible();
}

test("home page loads cleanly", async ({ page }) => {
  const errors = trackConsole(page);

  await assertPulseApp(page);

  expect(errors).toEqual([]);
});

test("sources page loads cleanly", async ({ page }) => {
  const errors = trackConsole(page);

  await page.goto("/sources");
  await expect(page.getByText("DATA SOURCES & UPDATE CADENCE")).toBeVisible();
  await expect(page.getByText("SECTION STATUS")).toBeVisible();

  expect(errors).toEqual([]);
});

test("all section pages render cleanly", async ({ page }) => {
  const errors = trackConsole(page);

  await assertPulseApp(page);

  for (const path of [
    "/section/pm-approval",
    "/section/election-polls",
    "/section/betting-odds",
    "/section/govt-approval",
    "/section/gov-trust-trend",
    "/section/national-debt",
    "/section/gdp",
    "/section/economy",
    "/section/tax",
    "/section/employment",
    "/section/crime-stats",
    "/section/nhs",
    "/section/migration",
    "/section/uk-regions",
    "/section/policy-links",
    "/section/political-compass",
  ]) {
    await page.goto(path);
    await expect(page.locator("main")).toBeVisible();
  }

  expect(errors).toEqual([]);
});
