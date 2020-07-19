const puppeteer = require("puppeteer");
require("dotenv").config();

const {
  passwordQuestion,
  usernameQuestion,
  closeBrowser,
  googleLogin,
} = require("./helper");

module.exports = {
  getPage: async (eventEmiter) => {
    // const username = await usernameQuestion();
    // const password = await passwordQuestion();

    const username = process.env.EMAIL;
    const password = process.env.PASS;

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    page.waitFor(1000);
    await page.goto(
      "https://docs.google.com/forms/d/e/1FAIpQLSek-GKkIm87UhaZnpCbMOxmIIDWvlmr-rfjHKR9NAEttOGPtQ/viewform",
    );
    // wait for page navigate finsished
    const navigationPromise = page.waitForNavigation();

    // login to google form
    await googleLogin(username, password, page);

    // wait for page load full content
    await navigationPromise;

    eventEmiter.emit("page", page);

    await closeBrowser(browser);
  },
  doAnswer: async (data, page) => {
    console.log("do answer", data);
    // browser coding
    await page.evaluate(({ question, answer }) => {
      const questionWrapper = document.querySelectorAll(
        ".freebirdFormviewerViewItemList .freebirdFormviewerViewNumberedItemContainer",
      );

      // // just go throught childnode and get the list of answer
      var s = Array.from(questionWrapper).map((ele) => {
        const answerItem =
          ele.childNodes[0].childNodes[0].childNodes[1].childNodes[1]
            .childNodes[0].childNodes[0].childNodes[0];
        return answerItem;
      });
      // question 1 anwser 2
      let answer1 = s[question].childNodes[answer].querySelector("label");
      answer1.click();
    }, data);
  },
};
