from playwright.sync_api import Page, expect, sync_playwright
import re
import time

def verify_dark_mode_and_contrast(page: Page):
    # Navigate to Reel Capacity Estimator
    page.goto("http://localhost:3000/src/pages/reel-capacity-estimator/reel-capacity-estimator.html")
    page.wait_for_load_state("networkidle")

    # Enable Dark Mode
    desktop_toggle = page.locator("#darkModeToggle")
    if desktop_toggle.is_visible():
        desktop_toggle.click()
    else:
        # If toggle isn't visible (e.g., hidden in mobile menu or not injected), check local storage or force it
        page.evaluate("window.DarkMode.toggle()")

    # Wait for transition
    time.sleep(1) # Allow for 0.3s transition

    # Check for Dark Mode class
    expect(page.locator("body")).to_have_class(re.compile(r".*dark-mode.*"))

    # Screenshot 1: Reel Capacity Estimator in Dark Mode
    page.screenshot(path="/home/jules/verification/reel_capacity_dark_mode.png")

    # Navigate to Database Config
    page.goto("http://localhost:3000/src/pages/database-config/database-config.html")
    page.wait_for_load_state("networkidle")

    # Ensure Dark Mode is still active (it should persist)
    expect(page.locator("body")).to_have_class(re.compile(r".*dark-mode.*"))

    # Screenshot 2: Database Config in Dark Mode
    page.screenshot(path="/home/jules/verification/database_config_dark_mode.png")

    # Navigate to Index page to check Info Boxes
    page.goto("http://localhost:3000/src/pages/index/index.html")
    page.wait_for_load_state("networkidle")

    # Screenshot 3: Index Page Info Boxes in Dark Mode
    page.screenshot(path="/home/jules/verification/index_info_boxes_dark_mode.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_dark_mode_and_contrast(page)
        finally:
            browser.close()
