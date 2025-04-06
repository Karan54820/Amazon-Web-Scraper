import puppeteer from 'puppeteer';
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { summarizeReviews } from './utils/openAi.utils.js';

// Add the stealth plugin to puppeteer
puppeteerExtra.use(StealthPlugin());

// Utility function for waiting
const waitForTimeout = async (page, ms) => {
  return page.evaluate((timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  }, ms);
};

// Setup browser launch options with optimized worker settings
const getBrowserLaunchOptions = () => {
  return {
    headless: true,
    args: [
      "--no-sandbox", 
      "--disable-setuid-sandbox",
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
      "--window-size=1920,1080",
      "--disable-dev-shm-usage", // Prevents running out of memory in containers
      "--single-process", // Reduces worker issues in constrained environments
      "--no-zygote" // Prevents worker issues
    ],
    // Set conservative browser timeouts
    timeout: 60000,
    protocolTimeout: 60000
  };
};

/**
 * Fetches product data from Amazon
 * @param {string} url - Amazon product URL
 * @returns {Promise<Object>} - Product data
 */
export async function fetchAmazonData(url) {
  if (!url || !url.includes('amazon')) {
    throw new Error('Please provide a valid Amazon link.');
  }

  // Store extracted offers as a global variable
  let extractedBankOffers = [];
  let browser;

  try {
    // Launch Puppeteer with improved settings
    browser = await puppeteerExtra.launch(getBrowserLaunchOptions());

    const page = await browser.newPage();

    // More advanced user agent rotation
    const userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0"
    ];
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

    // Mimic a real user by setting headers and user agent
    await page.setUserAgent(randomUserAgent);
    await page.setViewport({ width: 1280, height: 800 });
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      "Connection": "keep-alive",
      "Upgrade-Insecure-Requests": "1"
    });

    // Set cookies to appear as a returning user
    await page.setCookie({
      name: 'session-id',
      value: '123-' + Math.random().toString(36).substring(2, 15),
      domain: '.amazon.in',
      path: '/',
      expires: Math.floor(Date.now() / 1000) + 86400, // 1 day from now
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    });

    // Set default navigation timeout
    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(60000);

    // Add localStorage items to appear more like a real user
    await page.evaluateOnNewDocument(() => {
      // Mock browsing history
      localStorage.setItem('recentlyViewed', JSON.stringify(['electronics', 'tv', 'smart-home']));
      // Mock previous visits
      localStorage.setItem('visitCount', '3');
      // Mock preferences
      localStorage.setItem('preferredLanguage', 'en-IN');
      
      // Override navigator properties to appear more human
      const newProto = navigator.__proto__;
      delete newProto.webdriver;
      navigator.__proto__ = newProto;
      
      // Override permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' || 
        parameters.name === 'geolocation' || 
        parameters.name === 'midi' || 
        parameters.name === 'camera' || 
        parameters.name === 'microphone' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );
    });

    // Add randomized wait times to appear more human-like
    const randomWaitTime = Math.floor(Math.random() * 2000) + 1000;
    await waitForTimeout(page, randomWaitTime);

    // Navigate to the provided link
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // Add a random delay to simulate human browsing
    await waitForTimeout(page, Math.floor(Math.random() * 3000) + 2000);

    // Check if we've been detected as a bot
    const isBlocked = await page.evaluate(() => {
      const pageTitle = document.title.toLowerCase();
      const bodyText = document.body.innerText.toLowerCase();
      
      return pageTitle.includes('robot') || 
             pageTitle.includes('captcha') ||
             bodyText.includes('verify you are a human') ||
             bodyText.includes('verify your identity') ||
             bodyText.includes('automated access') ||
             bodyText.includes('unusual activity');
    });

    if (isBlocked) {
      console.log("Bot detection encountered - Amazon has blocked the request");
      await page.screenshot({ path: 'bot-detection.png' });
      await browser.close();
      throw new Error('Bot detection encountered. Amazon has blocked the request. Please try again later.');
    }

    // Wait for the product title to load with increased timeout
    try {
      await page.waitForSelector("#productTitle", { timeout: 45000 });
    } catch (timeoutError) {
      console.log("Timeout waiting for #productTitle - Taking screenshot for debugging");
      await page.screenshot({ path: 'timeout-error.png' });
      
      // Check if we're on a valid Amazon page
      const currentUrl = page.url();
      if (!currentUrl.includes('amazon.in') || currentUrl.includes('captcha')) {
        throw new Error("Not on a valid Amazon product page. Possible redirection or CAPTCHA.");
      }
      
      throw timeoutError;
    }
    
    // Scrape the required data
    const data = await page.evaluate(() => {
      const title = document.querySelector("#productTitle")?.innerText.trim();
      const rating = document.querySelector(".a-icon-alt")?.innerText.trim();
      const numRatings = document
        .querySelector("#acrCustomerReviewText")
        ?.innerText.trim();
      const price = document
        .querySelector(".a-price .a-offscreen")
        ?.innerText.trim();
      const discount = document
        .querySelector(".savingsPercentage")
        ?.innerText.trim();

      // Get bank offers
      let bankOffers = [];
      
      // Try to find bank offers using various selectors
      try {
        const bankOfferDiv = document.getElementById('itembox-InstantBankDiscount');
        if (bankOfferDiv) {
          const truncateElements = bankOfferDiv.querySelectorAll('.a-truncate-full, .a-offscreen, .a-truncate');
          for (const el of truncateElements) {
            const text = el.innerText?.trim();
            if (text && text.includes('discount') && !bankOffers.includes(text)) {
              bankOffers.push(text);
            }
          }
          
          const offersContent = bankOfferDiv.querySelector('.offers-items-content, .a-section.a-spacing-none.offers-items-content');
          if (offersContent) {
            const contentText = offersContent.innerText?.trim();
            if (contentText) {
              let offerText = contentText.replace(/^Bank\s+Offer\s*/i, '').trim();
              if (!bankOffers.includes(offerText)) {
                bankOffers.push(offerText);
              }
            }
          }
        }
      } catch (error) {
        console.log('Error getting bank offers:', error);
      }
      
      if (bankOffers.length === 0) {
        bankOffers = [
          "No bank offer details could be extracted. Please check the product page manually."
        ];
      }

      const aboutItem = Array.from(
        document.querySelectorAll("#feature-bullets ul li span")
      ).map((feature) => feature.innerText.trim());

      const productInfo = Array.from(
        document.querySelectorAll("#productDetails_techSpec_section_1 tr")
      ).reduce((info, row) => {
        const key = row.querySelector("th")?.innerText.trim();
        const value = row.querySelector("td")?.innerText.trim();
        if (key && value) info[key] = value;
        return info;
      }, {});

      const productImages = Array.from(
        document.querySelectorAll("#altImages img")
      ).map((img) => {
        let src = img.src;
        src = src.replace(/_SS40_|_AC_US40_/g, "_AC_SX466_");
        return src;
      });

      const mainImage = document.querySelector("#landingImage")?.src;
      if (mainImage) {
        productImages.unshift(mainImage);
      }

      const manufacturerImages = Array.from(
        document.querySelectorAll("#aplus img")
      ).map((img) => {
        let src = img.src;
        src = src.replace(/_SS40_|_AC_US40_/g, "_AC_SX466_");
        return src;
      });

      return {
        title,
        rating,
        numRatings,
        price,
        discount,
        bankOffers,
        aboutItem,
        productInfo,
        productImages,
        manufacturerImages
      };
    });

    // Close the browser
    await browser.close();
    browser = null;
    
    // Return the scraped data
    return data;
  } catch (error) {
    console.error("Error scraping data:", error);
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error("Error closing browser:", closeError);
      }
    }
    throw new Error(`Failed to scrape data: ${error.message}`);
  }
}

/**
 * Find reviews for a product
 * @param {string} url - Amazon product URL
 * @returns {Promise<Object>} - Reviews and summary
 */
export async function findReviews(url) {
  if (!url || !url.includes('amazon')) {
    throw new Error('Please provide a valid Amazon link.');
  }

  let browser;
  try {
    // Launch browser
    browser = await puppeteerExtra.launch(getBrowserLaunchOptions());

    const page = await browser.newPage();
    
    // Set user agent and other settings
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 });
    
    // Set default navigation timeout
    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(60000);

    // Navigate to the product page
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    
    // Look for reviews section or link to all reviews
    const hasReviewsLink = await page.evaluate(() => {
      return !!document.querySelector('a#customerReviews, a[href*="customer-reviews"], a:contains("customer reviews")');
    });
    
    // If there's a reviews link, click it to go to the reviews page
    if (hasReviewsLink) {
      await page.click('a#customerReviews, a[href*="customer-reviews"], a:contains("customer reviews")');
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
    }
    
    // Extract reviews from the page
    const reviewsData = await page.evaluate(() => {
      // Get product title for context
      const productTitle = document.querySelector("#productTitle")?.innerText.trim();
      
      // Extract reviews
      const reviews = Array.from(
        document.querySelectorAll(".review, .review-container, div[data-hook='review']")
      ).map((review) => {
        const titleElement = review.querySelector(".review-title, a[data-hook='review-title']");
        const textElement = review.querySelector(".review-text, span[data-hook='review-body']");
        const ratingElement = review.querySelector(".review-rating .a-icon-alt, i[data-hook='review-star-rating']");
        const authorElement = review.querySelector(".a-profile-name, span[data-hook='review-author']");
        const dateElement = review.querySelector(".review-date, span[data-hook='review-date']");

        return {
          title: titleElement?.innerText.trim() || "No Title",
          text: textElement?.innerText.trim() || "No Review Text",
          rating: ratingElement?.innerText.trim() || "No Rating",
          author: authorElement?.innerText.trim() || "Anonymous",
          date: dateElement?.innerText.trim() || "Unknown Date",
        };
      });

      return {
        productTitle,
        reviews
      };
    });
    
    // Close the browser
    await browser.close();
    browser = null;
    
    // Generate AI summary for reviews
    const reviewTexts = reviewsData.reviews.map(review => review.text);
    const reviewSummary = await summarizeReviews(reviewTexts, reviewsData.productTitle);
    
    // Return reviews and summary
    return {
      productTitle: reviewsData.productTitle,
      reviewCount: reviewsData.reviews.length,
      reviews: reviewsData.reviews.slice(0, 5), // Send first 5 complete reviews
      summary: reviewSummary // Add the AI-generated summary
    };
  } catch (error) {
    console.error("Error finding reviews:", error);
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error("Error closing browser:", closeError);
      }
    }
    throw new Error(`Failed to find reviews: ${error.message}`);
  }
} 