const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const emptyAnswer = (question, resolve) => {
  rl.question(question + " not allowed to be empty", (answer) => {
    resolve(answer);
  });
};

const usernameQuestion = async () => {
  return new Promise((resolve) => {
    rl.question("enter username: ", (answer) => {
      if (answer === "") emptyAnswer("username", resolve);
      else resolve(answer);
    });
  });
};
const passwordQuestion = async () => {
  return new Promise((resolve) => {
    rl.question("enter password: ", (answer) => {
      if (answer === "") emptyAnswer("password", resolve);
      else resolve(answer);
    });
  });
};

const closeBrowser = (browser) => {
  rl.question("Type exit to Close your browser: ", (answer) => {
    if (answer.includes("exit")) {
      browser.close();
      process.exit(1);
    }
  });
};

const googleLogin = async (username, password, page) => {
  // wait for button next
  await page.waitForSelector("#identifierNext");
  await page.type('input[type="email"]', username);
  await page.click("#identifierNext");
  // wait for input show up
  await page.waitForSelector('input[type="password"]', { visible: true });
  await page.type('input[type="password"]', password);

  await page.waitForSelector("#passwordNext", { visible: true });
  await page.click("#passwordNext");

  await page.waitForNavigation();
};

module.exports = {
  googleLogin,
  usernameQuestion,
  passwordQuestion,
  closeBrowser,
};
