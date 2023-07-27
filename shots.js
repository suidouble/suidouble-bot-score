const puppeteer = require('puppeteer');

const makeAShot = async(percent)=>{
    // Create a browser instance
    const browser = await puppeteer.launch({ headless: false });
    
    // Create a new page
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3738.0 Safari/537.36');

    await page.setViewport({ width: 400, height: 400 });
    const website_url = 'http://localhost:8090/shot/'+percent;
    // Open URL in current page  
    await page.goto(website_url);
    await new Promise((res)=>setTimeout(res, 2000));
    await page.screenshot({
        path: 'shots/'+percent+'.png',
      });

    // Close the browser instance
    await browser.close();
}

const run = async()=>{
    // for (let i = 0; i <= 100; i++) {
    //     await makeAShot(i);
    // }
    await makeAShot(78);
    await makeAShot(87);
    await makeAShot(88);
    await makeAShot(89);
    await makeAShot(93);
    // await makeAShot(73);
    // await makeAShot(74);
    // await makeAShot(42);
    // await makeAShot(43);
    // await makeAShot(44);
};

run();