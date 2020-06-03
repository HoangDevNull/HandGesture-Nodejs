const puppeteer = require("puppeteer");
const {
  passwordQuestion,
  usernameQuestion,
  closeBrowser,
  googleLogin,
} = require("./helper");

const { username, password } = require("../config");
(async () => {
  //   const username = await usernameQuestion();
  //   const password = await passwordQuestion();

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });
  await page.goto(
    "https://docs.google.com/forms/d/e/1FAIpQLSek-GKkIm87UhaZnpCbMOxmIIDWvlmr-rfjHKR9NAEttOGPtQ/viewform"
  );
  // wait for page navigate finsished
  const navigationPromise = page.waitForNavigation();

  // login to google form
  await googleLogin(username, password, page);

  // wait for page load full content
  await navigationPromise;

  await page.screenshot({ path: "test.png" });

  // browser coding
  await page.evaluate(() => {
    const questionWrapper = document.querySelectorAll(
      ".freebirdFormviewerViewItemList .freebirdFormviewerViewNumberedItemContainer"
    );

    // just go throught childnode and get the list of answer
    var s = Array.from(questionWrapper).map((ele) => {
      const answerItem =
        ele.childNodes[0].childNodes[1].childNodes[0].childNodes[0]
          .childNodes[0].childNodes;
      return answerItem;
    });

    // question 1 anwser 1
    let answer1 = s[0][1].querySelector("label");
    answer1.click();
  });
  await closeBrowser(browser);
})();