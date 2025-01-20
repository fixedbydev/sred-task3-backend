const puppeteer = require("puppeteer");

async function fetchCookiesFromHtml(htmlString) {
  // Launch Puppeteer
  const browser = await puppeteer.launch({
    headless: "new"
  });
  const page = await browser.newPage();

  // Set the HTML content directly
  await page.setContent(htmlString, { waitUntil: "networkidle2" });

  // Retrieve cookies
  const cookies = await page.cookies();
  console.log("Cookies set by the page:", cookies);

  // Close the browser
  await browser.close();

  return cookies;
}


async function fetchCookiesFromAirTableLogin({ email, password }) {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();

  // Go to the login page
  await page.goto("https://airtable.com/login");

  // Wait for the login page to load
  await page.waitForSelector('input[name="email"]');

  // Fill in the email and password
  await page.type('input[name="email"]', email);

  // Click the login button
  await page.click('button[type="submit"]');


  // Wait for the password field to appear
  await page.waitForSelector('input[name="password"]');
  await page.type('input[name="password"]', password);


  // Click the SignIn button
  await page.click('button[type="submit"]');

  // Wait for the login to complete
  await page.waitForNavigation();

  // Retrieve cookies
  const cookies = await page.cookies();
  
  await browser.close();
  
  // Close the browser
  const cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
  
  console.log("Cookies set by the page:", cookieString);
  return cookieString;
}

module.exports = {
  fetchCookiesFromHtml,
  fetchCookiesFromAirTableLogin
};
