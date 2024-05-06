const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

app.post('/calculate', async (req, res) => {
  const url = req.body.url;
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

  const result = {
    itemCount: prices.length,
    totalPrice: totalPrice.toFixed(2),
  };

  console.log('Sending response:', result);
  res.json(result);
  console.log('Response sent');
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});