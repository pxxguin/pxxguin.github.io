import { chromium } from 'playwright';

(async () => {
    console.log("Starting playwright...");
    const browser = await chromium.launch();
    console.log("Browser launched.");
    const page = await browser.newPage();
    
    // Listen for all console events and errors
    page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
    page.on('pageerror', error => console.error('BROWSER_ERROR:', error));
    page.on('requestfailed', request => console.log('BROWSER_REQUEST_FAILED:', request.url(), request.failure()?.errorText));
    
    await page.goto('http://localhost:4321/archive/?category=CI/CD', { waitUntil: 'networkidle' });
    
    await new Promise(r => setTimeout(r, 2000)); // wait for Svelte hydration
    await browser.close();
    console.log("Done.");
})();
