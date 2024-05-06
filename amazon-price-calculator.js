const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function main() {
  const url = 'https://www.amazon.com/hz/wishlist/ls/1YWPWG9NHD4RP?ref_=wl_share';

  // launch the browser
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url);

  // initialize the array and variable for item prices
  let prices = [];
  let totalPrice = 0;

  // get the HTML content
  const html = await page.content();

  // parse the HTML using cheerio
  const $ = cheerio.load(html);

  $('span.a-price').each((index, element) => {
    const priceText = $(element).find('span').first().text().replace('$', '');
    prices.push(parseFloat(priceText));
  });

  totalPrice = prices.reduce((acc, current) => acc + current, 0);

  console.log(`Count: ${prices.length}`);
  console.log(`Total Price: $${totalPrice.toFixed(2)}`);

  // close the browser
  await browser.close();
}

main();