const express = require('express');
const cors = require('cors')
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(cors({
  origin: ['https://meganle414.github.io'],
  credentials: true,
}));

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Ready to calculate' });
});

app.post('/calculate', async (req, res) => {
  const prices = [];
  const totalPrice = 0;
    try {
        const url = req.body.url;
        // const browser = await puppeteer.launch();
        const browser = await puppeteer.launch({
          executablePath: '/app/.apt/usr/bin/google-chrome',
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          headless: true,
          chrome_revision: '125.0.6422.112', // specify the Chrome version
        });
        const page = await browser.newPage();
        await page.goto(url);

        await autoScroll(page);

        // initialize the array and variable for item prices
        // let prices = [];
        // let totalPrice = 0;

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

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to calculate price' });
      }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

async function autoScroll(page){
  await page.evaluate(async () => {
      await new Promise((resolve) => {
          var totalHeight = 0;
          var distance = 100;
          var timer = setInterval(() => {
              var scrollHeight = document.body.scrollHeight;
              window.scrollBy(0, distance);
              totalHeight += distance;

              if(totalHeight >= scrollHeight - window.innerHeight){
                  clearInterval(timer);
                  resolve();
              }
          }, 100);
      });
  });
}