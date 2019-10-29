const puppeteer = require("puppeteer");

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        ignoreHTTPSErrors: true
    });
    const page = await browser.newPage();

    page.on("console", async (msg) => {
        const txt = msg.text();

        console.log(`LOG: ${msg.text()}`);
        if (txt === 'gdcPageLoaded') {
            await page.waitFor(5000);
            await page.emulateMedia("screen");
            await page.pdf({
                path: "viz_pdf.pdf"
            });
            await browser.close();
        }
    });
    await page.goto(
        "embedded_url_here",
        { waitUntil: "networkidle0" }
    );
    await page.waitForSelector(".s-login-login");
    await page.type(
        '.s-login-login > input[type="email"]',
        "username_here"
    );
    await page.type('.s-login-password > input[type="password"]', "password_here");
    await page.click(".form-submit .s-login-button")

    // await page.evaluate(() => {
    //     document.querySelector('.fck-hr').style.height = "100px";
    //     document.querySelector('.fck-hr').style.backgroundColor = "green";
    // });
    await waitForNetworkIdle(page, 10000, 0);
    //await page.waitFor(5000);



    function waitForNetworkIdle(page, timeout, maxInflightRequests = 0) {
        page.on("request", onRequestStarted);
        page.on("requestfinished", onRequestFinished);
        page.on("requestfailed", onRequestFinished);

        let inflight = 0;
        let fulfill;
        let promise = new Promise(x => (fulfill = x));
        let timeoutId = setTimeout(onTimeoutDone, timeout);
        return promise;

        function onTimeoutDone() {
            page.removeListener("request", onRequestStarted);
            page.removeListener("requestfinished", onRequestFinished);
            page.removeListener("requestfailed", onRequestFinished);
            fulfill();
        }

        function onRequestStarted() {
            ++inflight;
            if (inflight > maxInflightRequests) clearTimeout(timeoutId);
        }

        function onRequestFinished() {
            if (inflight === 0) return;
            --inflight;
            if (inflight === maxInflightRequests)
                timeoutId = setTimeout(onTimeoutDone, timeout);
        }
    }
})();
