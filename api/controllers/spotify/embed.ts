const puppeteer = require('puppeteer');
const fs = require('fs').promises;

export async function get_embed(): Promise<String> {
    //initiate the browser 
    const browser = await puppeteer.launch({
        headless: true,
        devtools: true,
        args: [
            '--disable-web-security',
            '--disable-features=IsolateOrigins',
            '--disable-site-isolation-trials'
        ]
    });

    //create a new in headless chrome 
    const page = await browser.newPage();
    page.setUserAgent("5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Mobile Safari/537.36")

    //go to target website 
    await page.goto('https://open.spotify.com/embed/playlist/0Rt5un7cLgJO7MfDlgXnd2?utm_source=generator', {
        //wait for content to load 
        waitUntil: 'networkidle0',
    });

    //get full page html 
    const html = await page.content();

    //close headless chrome 
    await browser.close();

    return html
}