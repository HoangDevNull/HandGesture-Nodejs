const puppeteer = require('puppeteer');
const { passwordQuestion, usernameQuestion, closeBrowser, googleLogin } = require("./helper");

(async () => {
    const username = await usernameQuestion();
    const password = await passwordQuestion();

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 })
    await page.goto('https://docs.google.com/forms/d/e/1FAIpQLSek-GKkIm87UhaZnpCbMOxmIIDWvlmr-rfjHKR9NAEttOGPtQ/viewform');
    // wait for page navigate finsished
    const navigationPromise = page.waitForNavigation();

    // login to google form
    await googleLogin(username, password, page);

    // wait for page load full content
    await navigationPromise;

    const $answers = page.$$(".freebirdFormviewerViewNumberedItemContainer");

    (await $answers).forEach(ele => {
        console.log("log" + ele)
    })

    await closeBrowser(browser);
})();