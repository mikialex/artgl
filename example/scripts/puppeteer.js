const puppeteer = require('puppeteer');

async function createPuppeteerBrowser() {
  return await puppeteer.launch({
    args: [
      // '--no-sandbox',
      // '--disable-setuid-sandbox',
      // '--disable-web-security'
    ],
    ignoreHTTPSErrors: true,
    devtools: true,
    headless: true,
    defaultViewport: {
      width: 800,
      height: 600
    }
  });
}

async function injectBasicUtil(page) {
  // expose log function for log in node from browser
  await page.exposeFunction('frameLog', (log) => {
    console.log('frameLog: ' + log);
  })

  // expose imageDiff prediction 
  await page.exposeFunction('expectFrame', async (frameName) => {
    const filePath = imageDistDirPath + frameName + '.png';
    console.log(`write image file to: ${filePath}`);
    try {
      await saveScreenShot(page, filePath);
    } catch (error) {
      console.log('save error:\n' + error)
    }
  })

  const testWaiter = new Promise(async (resolve) => {
    await page.exposeFunction('finishTest', async (frameName) => {
      resolve();
    })
  })

  return testWaiter;

}


// async function runHeadlessTest(name, url) {
//   const browser = await createPuppeteerBrowser();
//   const page = await browser.newPage();
//   await injectBasicUtil(page);

//   await page.coverage.startJSCoverage({
//     reportAnonymousScripts: true
//   });


//   await gotoURL(page, global.mockServerURL);
//   const t = require('fs').readFileSync('/Users/mikialex/Desktop/framewatcher/workspace/html/dist/artglwebpack.js', "utf-8");
//   await page.evaluate(t);
//   await testWaiter;

//   const jsCoverage = await page.coverage.stopJSCoverage();

//   // const pti = require('puppeteer-to-istanbul')
//   // pti.write(jsCoverage)

//   await browser.close();
//   console.log(`headless test over for ${name}`);
// }


async function runHeadlessTest(staticUrl) {
  const browser = await createPuppeteerBrowser();
  const page = await browser.newPage();
  await injectBasicUtil(page);

  await page.coverage.startJSCoverage({
    reportAnonymousScripts: true
  });


  await gotoURL(page, global.mockServerURL);
  const t = require('fs').readFileSync('/Users/mikialex/Desktop/framewatcher/workspace/html/dist/artglwebpack.js', "utf-8");
  await page.evaluate(t);
  await testWaiter;

  const jsCoverage = await page.coverage.stopJSCoverage();

  // const pti = require('puppeteer-to-istanbul')
  // pti.write(jsCoverage)

  await browser.close();
  console.log(`headless test over for ${name}`);
}

module.exports = {
  createPuppeteerBrowser,
  runHeadlessTest
}