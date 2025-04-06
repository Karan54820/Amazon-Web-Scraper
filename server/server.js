import express from "express";
import puppeteer from "puppeteer";
import puppeteerExtra from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import cors from "cors";
import { summarizeReviews } from "./utils/openAi.utils.js"; // Import summarizeReviews
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from 'fs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fetchAmazonData, findReviews } from './scraper.js';

// Load environment variables
dotenv.config();

// Get dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Add the stealth plugin to puppeteer
puppeteerExtra.use(StealthPlugin());

const app = express();

// CORS configuration based on environment
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Security middleware with custom CSP to allow Google Fonts
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", "http://localhost:*", "https://*.onrender.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "https://*.amazonaws.com", "https://*.amazon.in"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        frameSrc: ["'self'"]
      }
    }
  })
);

// Apply rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: "Too many requests from this IP, please try again later"
});

// API routes with rate limiting
app.use('/api', apiLimiter);

// Store extracted offers as a global variable
let extractedBankOffers = [];

// Utility function for waiting since page.waitForTimeout might not be available in some Puppeteer versions
const waitForTimeout = async (page, ms) => {
  return page.evaluate((timeout) => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  }, ms);
};

// API Routes
app.post("/scrape", async (req, res) => {
  const { link } = req.body;

  if (!link || !link.includes("amazon")) {
    return res
      .status(400)
      .json({ error: "Please provide a valid Amazon link." });
  }

  try {
    // Launch Puppeteer with improved stealth settings
    const browser = await puppeteerExtra.launch({
      headless: true,
      args: [
        "--no-sandbox", 
        "--disable-setuid-sandbox",
        "--disable-web-security",
        "--disable-features=IsolateOrigins,site-per-process",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--window-size=1920,1080"
      ],
    });

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
    await page.goto(link, { waitUntil: "networkidle2", timeout: 60000 });

    // Add a random delay to simulate human browsing
    await waitForTimeout(page, Math.floor(Math.random() * 3000) + 2000);

    // Check if we've been detected as a bot (CAPTCHA or robot check)
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
      return res.status(403).json({ 
        error: "Bot detection encountered. Amazon has blocked the request.",
        message: "Please try again later or with a different link."
      });
    }

    // We don't need the complex request interception for offer headers
    // Just disable it to improve performance
    await page.setRequestInterception(false);

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
    
    // Look specifically for the "x offers >" link under Bank Offer section
    try {
      console.log("Looking for bank offers using exact HTML structure...");
      
      // TARGETED APPROACH: Use the exact structure from the provided HTML
      // Look specifically for the div with id="itembox-InstantBankDiscount"
      let bankOfferClicked = false;
      
      try {
        bankOfferClicked = await page.evaluate(async () => {
          // Find the main bank offer container
          const bankOfferDiv = document.querySelector('div[id="itembox-InstantBankDiscount"]');
          if (!bankOfferDiv) {
            console.log("Could not find div with id='itembox-InstantBankDiscount'");
            return false;
          }
          
          console.log("Found Bank Offer section with exact ID match");
          
          // Extract the initial bank offer text (displayed on the main page)
          const offerTextElement = bankOfferDiv.querySelector('.a-truncate-full, .a-truncate');
          if (offerTextElement) {
            console.log("Initial bank offer text:", offerTextElement.innerText.trim());
          }
          
          // Find the "X offers" link - using the exact class structure from the HTML
          const offersLink = bankOfferDiv.querySelector('a.a-size-base.a-link-emphasis.vsx-offers-count');
          
          if (offersLink) {
            const linkText = offersLink.innerText.trim();
            console.log(`Found the exact offers link: "${linkText}"`);
            
            // Click on the link to open the offers popup
            offersLink.click();
            console.log("Clicked on the offers link");
            
            // Give time for the popup to appear
            await waitForTimeout(page, 1500);
            return true;
          } else {
            // Try a more general approach if the specific link isn't found
            const anyLink = bankOfferDiv.querySelector('a');
            if (anyLink && anyLink.innerText.includes('offer')) {
              console.log(`Found general offers link: "${anyLink.innerText.trim()}"`);
              anyLink.click();
              await waitForTimeout(page, 1500);
              return true;
            }
          }
          
          return false;
        });
      } catch (evalError) {
        console.log("Error evaluating bank offer section:", evalError.message);
      }
      
      if (bankOfferClicked) {
        try {
          // Wait for popup to appear - Add a try/catch here
          try {
            await page.waitForSelector(".a-popover-content, .a-popover-wrapper, .a-modal-content", { timeout: 5000 });
          } catch (modalError) {
            console.log("Modal may not have appeared:", modalError.message);
            // Continue anyway - the modal might not appear
          }
          
          // Add mouse movements to appear more human
          await page.mouse.move(
            100 + Math.random() * 100, 
            100 + Math.random() * 100, 
            { steps: 10 }
          );
          
          // Random scrolling to simulate human behavior
          await page.evaluate(() => {
            window.scrollBy({
              top: 100 + Math.random() * 600,
              behavior: 'smooth'
            });
          });
          
          await waitForTimeout(page, 1000);
          
          // Take a screenshot after scrolling
          await page.screenshot({ path: 'amazon-scrolled.png' });
          
          // Extract all offer content directly from the modal using a specific approach
          try {
            const modalOffers = await page.evaluate(() => {
              const modal = document.querySelector(".a-popover-content, .a-popover-wrapper, .a-modal-content");
              if (!modal) return [];
              
              console.log("Modal found, extracting content...");
              
              // Try several approaches to find offers
              let extractedOffers = [];
              
              // APPROACH 1: Look specifically for the numbered offers with a pattern like "Offer 1", "Offer 2"
              console.log("Looking for offers with standard numbering pattern...");
              
              // First, check if we can find a list of offers
              const offersList = modal.querySelector('ul');
              if (offersList) {
                console.log("Found offers list element");
                
                // Get all list items
                const offerItems = Array.from(offersList.querySelectorAll('li'));
                if (offerItems.length > 0) {
                  console.log(`Found ${offerItems.length} list items in the offers modal`);
                  
                  // Get text from each list item
                  extractedOffers = offerItems
                    .map(item => item.innerText?.trim())
                    .filter(text => text && text.length > 10); // Reasonable offer text length
                }
              }
              
              // APPROACH 2: Find divs with offer numbers
              if (extractedOffers.length === 0) {
                console.log("Looking for divs with offer numbers...");
                
                // Get all divs in the modal
                const allDivs = Array.from(modal.querySelectorAll('div'));
                
                // Find divs that contain "Offer N"
                for (let i = 1; i <= 15; i++) { // Check for up to 15 offers
                  const offerLabel = `Offer ${i}`;
                  
                  // Find elements with exactly this label
                  const labelEl = allDivs.find(div => 
                    div.innerText?.trim() === offerLabel);
                  
                  if (labelEl) {
                    console.log(`Found "${offerLabel}" element`);
                    
                    // Try to find the associated offer text - it might be in a parent div or adjacent div
                    let offerText = "";
                    
                    // Check the next sibling
                    if (labelEl.nextElementSibling) {
                      offerText = labelEl.nextElementSibling.innerText?.trim();
                    }
                    
                    // If still no offer text, check the parent's text
                    if (!offerText && labelEl.parentElement) {
                      const parentText = labelEl.parentElement.innerText?.trim();
                      
                      // Remove the label part
                      if (parentText.length > offerLabel.length + 5) {
                        offerText = parentText.replace(offerLabel, '').trim();
                      }
                    }
                    
                    if (offerText && offerText.length > 5) {
                      extractedOffers.push(`${offerLabel}: ${offerText}`);
                    }
                  }
                }
              }
              
              // APPROACH 3: Look for any divs that contain offer-like text
              if (extractedOffers.length === 0) {
                console.log("Looking for any elements with offer-like text...");
                
                const potentialOfferElements = Array.from(modal.querySelectorAll('*'))
                  .filter(el => {
                    const text = el.innerText?.trim();
                    return text && (
                      text.includes("Flat INR") ||
                      text.includes("Instant Discount") ||
                      text.includes("EMI") ||
                      text.includes("Bank") && text.includes("Card")
                    ) && text.length > 15 && text.length < 300;
                  });
                
                if (potentialOfferElements.length > 0) {
                  extractedOffers = potentialOfferElements.map(el => el.innerText?.trim());
                }
              }
              
              // APPROACH 4: Get the entire modal text and try to split it into offers
              if (extractedOffers.length === 0) {
                console.log("Using direct modal text extraction...");
                
                const fullModalText = modal.innerText;
                
                // Try to split by "Offer N" pattern
                const offerSections = fullModalText.split(/Offer \d+\s*/).filter(s => s.trim().length > 0);
                
                if (offerSections.length > 1) {
                  console.log(`Split modal text into ${offerSections.length} sections`);
                  
                  // Reconstruct the offers with their headers
                  for (let i = 0; i < offerSections.length; i++) {
                    extractedOffers.push(`Offer ${i+1}: ${offerSections[i].trim()}`);
                  }
                } else {
                  // Just split by newlines and look for offer-like lines
                  const lines = fullModalText.split('\n');
                  
                  extractedOffers = lines.filter(line => 
                    line.trim().length > 15 && 
                    (line.includes("discount") || 
                     line.includes("Flat INR") || 
                     line.includes("Credit Card"))
                  );
                }
              }
              
              return [...new Set(extractedOffers)]; // Remove any duplicates
            });
            
            if (modalOffers && modalOffers.length > 0) {
              console.log(`Successfully extracted ${modalOffers.length} offers directly from modal`);
              
              // Store in our global variable for later use
              extractedBankOffers = modalOffers;
              
              // Log the actual extracted offers
              console.log("Extracted offers:", modalOffers);
            }
          } catch (evalError) {
            console.log("Error evaluating modal content:", evalError.message);
          }
        } catch (waitError) {
          console.log("Error waiting for modal:", waitError.message);
        }
      } else {
        console.log("Could not click on bank offers link with exact structure, trying fallback methods...");
        
        // Try fallback approaches if the exact structure wasn't found
      }
    } catch (offerError) {
      console.log("Error looking for offer links:", offerError.message);
    }
    
    // Take a screenshot of the page including any modal that might be open
    await page.screenshot({ path: 'amazon-with-modal.png' });

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

      // Specifically target the bank offer modal/popup content as shown in the image
      let bankOffers = [];
      
      // First, check if we already extracted offers from the modal earlier
      if (window.extractedModalOffers && window.extractedModalOffers.length > 0) {
        console.log("Using pre-extracted offers from modal:", window.extractedModalOffers.length);
        bankOffers = window.extractedModalOffers;
      }
      
      // If we haven't already extracted offers, try to find the modal/popup
      if (bankOffers.length === 0) {
        const offerModal = document.querySelector(".a-popover-content, .a-modal-content, #a-popover-content-1");
        
        if (offerModal) {
          console.log("Found bank offer modal/popup");
          
          // Add a debugging log to output the full modal text
          console.log("Modal text contents:", offerModal.innerText.substring(0, 200) + "...");
          
          // APPROACH 1: Look for specific Amazon bank offer structure
          // Amazon often displays bank offers with specific structure like "Offer 1:", "Offer 2:", etc.
          const bankOfferResults = Array.from(offerModal.querySelectorAll('*'))
            .filter(el => {
              const text = el.innerText?.trim();
              // Look for elements that have bank offer information
              return text && (
                text.includes("Flat INR") || 
                text.includes("discount on select") ||
                text.includes("Bank") && text.includes("Credit Card") ||
                text.includes("Instant Discount")
              );
            })
            .map(el => el.innerText.trim())
            .filter(text => text.length > 15 && text.length < 300); // Filter out very short or very long texts
          
          if (bankOfferResults.length > 0) {
            console.log(`Found ${bankOfferResults.length} bank offers with specific offer text`);
            
            // Filter out duplicate offers
            bankOffers = [...new Set(bankOfferResults)];
          }
          
          // APPROACH 2: Target structured offer list with offer numbers
          if (bankOffers.length === 0) {
            console.log("Looking for numbered offers (Offer 1, Offer 2, etc.)");
            
            // Try to find elements with "Offer 1", "Offer 2", etc.
            const offerHeaders = Array.from(offerModal.querySelectorAll('*'))
              .filter(el => {
                const text = el.innerText?.trim();
                return text && text.match(/^Offer \d+$/);
              });
            
            if (offerHeaders.length > 0) {
              console.log(`Found ${offerHeaders.length} offer headers (Offer 1, Offer 2, etc.)`);
              
              // Process each offer
              offerHeaders.forEach(header => {
                const headerText = header.innerText.trim();
                
                // Find the actual offer text by examining siblings or parent content
                let offerDescription = "";
                
                // Try to find the description in the next sibling
                let nextElement = header.nextElementSibling;
                if (nextElement) {
                  offerDescription = nextElement.innerText?.trim();
                }
                
                // If we couldn't find in siblings, try parent's text excluding the header
                if (!offerDescription && header.parentElement) {
                  const parentText = header.parentElement.innerText?.trim();
                  if (parentText.length > headerText.length) {
                    // Remove the header text and clean up
                    offerDescription = parentText.replace(headerText, '').trim();
                    
                    // Remove any "See details" text
                    if (offerDescription.includes('See details')) {
                      offerDescription = offerDescription.split('See details')[0].trim();
                    }
                  }
                }
                
                if (offerDescription) {
                  bankOffers.push(`${headerText}: ${offerDescription}`);
                } else {
                  bankOffers.push(headerText);
                }
              });
            }
          }
          
          // APPROACH 3: Direct text scanning with regex
          if (bankOffers.length === 0) {
            console.log("Using direct text scanning approach");
            
            const modalText = offerModal.innerText;
            
            // Use regex to find patterns like:
            // - Lines with "Flat INR X,XXX" or "X% off"
            // - Lines mentioning "Credit Card" or "Debit Card" with discount amounts
            // - Any clear bank offer patterns
            
            // Look for complete offer text lines
            const offerPatterns = [
              /Flat INR [0-9,]+ (instant )?discount[^.]*/gi,
              /Up to INR [0-9,]+ (instant )?discount[^.]*/gi,
              /[0-9]+% (instant )?discount[^.]*/gi,
              /(Credit|Debit) Card[s]?[^.]*discount[^.]*/gi,
              /Bank Card[s]?[^.]*discount[^.]*/gi,
              /EMI interest savings[^.]*/gi
            ];
            
            // Find all text matches from the patterns
            let allMatches = [];
            offerPatterns.forEach(pattern => {
              const matches = modalText.match(pattern);
              if (matches) {
                allMatches = [...allMatches, ...matches];
              }
            });
            
            // Filter and clean up the matches
            if (allMatches.length > 0) {
              bankOffers = [...new Set(allMatches.map(m => m.trim()))];
            }
          }
        }
      }
      
      // If no offers found in modal, fall back to the main page
      if (bankOffers.length === 0) {
        console.log("No bank offers found in modal, checking main page...");
        
        // DIRECT EXTRACTION FROM USER-PROVIDED HTML STRUCTURE
        // This targets the exact HTML structure provided
        try {
          const bankOfferDiv = document.getElementById('itembox-InstantBankDiscount');
          if (bankOfferDiv) {
            console.log("Found bank offer section with ID 'itembox-InstantBankDiscount'");
            
            // 1. First check for the truncated text shown in the span.a-truncate-full or span.a-truncate elements
            const truncateElements = bankOfferDiv.querySelectorAll('.a-truncate-full, .a-offscreen, .a-truncate');
            for (const el of truncateElements) {
              const text = el.innerText?.trim();
              if (text && text.includes('discount') && !bankOffers.includes(text)) {
                console.log("Found offer text from truncate element:", text);
                bankOffers.push(text);
              }
            }
            
            // 2. Also check for non-truncated text in the offers-items-content section
            const offersContent = bankOfferDiv.querySelector('.offers-items-content, .a-section.a-spacing-none.offers-items-content');
            if (offersContent) {
              const contentText = offersContent.innerText?.trim();
              if (contentText) {
                // Remove "Bank Offer" label to get just the offer text
                let offerText = contentText.replace(/^Bank\s+Offer\s*/i, '').trim();
                console.log("Found offer content from section:", offerText);
                if (!bankOffers.includes(offerText)) {
                  bankOffers.push(offerText);
                }
              }
            }
            
            // 3. If we found the anchor tag with 14 offers, get its parent content
            const offersLink = bankOfferDiv.querySelector('a.a-size-base.a-link-emphasis.vsx-offers-count');
            if (offersLink) {
              const linkText = offersLink.innerText?.trim();
              const parentSpan = offersLink.parentElement;
              if (parentSpan && parentSpan.tagName === 'SPAN') {
                const spanText = parentSpan.innerText?.trim();
                if (spanText && spanText.length > linkText.length) {
                  // Get text before the link (the offer text)
                  const beforeLinkText = spanText.substring(0, spanText.indexOf(linkText)).trim();
                  if (beforeLinkText && !bankOffers.includes(beforeLinkText)) {
                    console.log("Found offer text before link:", beforeLinkText);
                    bankOffers.push(beforeLinkText);
                  }
                }
              }
            }
          }
        } catch (directError) {
          console.log("Error in direct extraction:", directError.message);
        }
        
        // Try to find any spans with "a-truncate" classes that might contain offers
        if (bankOffers.length === 0) {
          const truncateSpans = document.querySelectorAll('span.a-truncate');
          truncateSpans.forEach(span => {
            const parentText = span.parentElement?.innerText?.trim() || '';
            
            // Check if this appears to be a bank offer section
            if (parentText.includes('Bank Offer')) {
              const offerText = span.innerText?.trim();
              if (offerText && offerText.includes('discount')) {
                console.log("Found offer in truncate span:", offerText);
                bankOffers.push(offerText);
              }
            }
          });
        }
        
        // Try more general approaches if we still have no offers
        if (bankOffers.length === 0) {
          // Try to find offers in the main page content
          const mainPageOfferSelectors = [
            ".a-box-inner", 
            "div.a-box", 
            "div[data-a-card-type='basic']",
            "span.a-truncate"
          ];
          
          for (const selector of mainPageOfferSelectors) {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
              const text = el.innerText?.trim();
              if (text && (
                  text.includes("Bank Offer") || 
                  text.includes("Cashback") || 
                  text.includes("No Cost EMI") || 
                  text.includes("Partner Offers")
              )) {
                // Extract just the first line or sentence which is usually the offer headline
                const firstLine = text.split('\n')[0];
                if (firstLine && firstLine.length > 5 && firstLine.length < 150) {
                  bankOffers.push(firstLine);
                }
              }
            });
          }
        }
      }
      
      // Add a fallback if no offers were found
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
        // Replace thumbnail parameters with high-resolution parameters
        src = src.replace(/_SS40_|_AC_US40_/g, "_AC_SX466_"); // Replace with higher resolution
        return src;
      });

      // Scrape the main product image (high resolution)
      const mainImage = document.querySelector("#landingImage")?.src;

      // Add the main image to the productImages array if it exists
      if (mainImage) {
        productImages.unshift(mainImage); // Add the main image at the beginning
      }

      // Scrape manufacturer images
      const manufacturerImages = Array.from(
        document.querySelectorAll("#aplus img")
      ).map((img) => {
        let src = img.src;
        // Replace thumbnail parameters with high-resolution parameters
        src = src.replace(/_SS40_|_AC_US40_/g, "_AC_SX466_"); // Replace with higher resolution
        return src;
      });

      // Scrape reviews
      const reviews = Array.from(
        document.querySelectorAll(".review")
      ).map((review) => {
        const reviewTitle = review.querySelector(".review-title")?.innerText.trim();
        const reviewText = review.querySelector(".review-text")?.innerText.trim();
        const reviewRating = review
          .querySelector(".review-rating .a-icon-alt")
          ?.innerText.trim();
        const reviewAuthor = review
          .querySelector(".a-profile-name")
          ?.innerText.trim();
        const reviewDate = review
          .querySelector(".review-date")
          ?.innerText.trim();

        return {
          title: reviewTitle,
          text: reviewText,
          rating: reviewRating,
          author: reviewAuthor,
          date: reviewDate,
        };
      });

      // Return the scraped data
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
        manufacturerImages,
        reviews,
      };
    });

    // If we have any bank offers in our global variable, use those
    if (extractedBankOffers.length > 0) {
      console.log("Using bank offers extracted from modal popup:", extractedBankOffers.length);
      data.bankOffers = extractedBankOffers;
    }
    
    // If we still don't have any bank offers, try a direct screenshot-based approach
    if (!data.bankOffers || data.bankOffers.length === 0) {
      console.log("No bank offers found, trying direct screenshot approach");
      
      try {
        // Take a targeted screenshot of just the bank offer section
        const bankOfferElement = await page.$('div[id="itembox-InstantBankDiscount"]');
        if (bankOfferElement) {
          await bankOfferElement.screenshot({ path: 'bank-offer-section.png' });
          console.log("Captured a screenshot of the bank offer section");
          
          // Add a fallback offer message
          data.bankOffers = ["Bank offers are available but couldn't be extracted. Please refer to the screenshot."];
        }
      } catch (screenshotError) {
        console.log("Error taking screenshot of bank offer section:", screenshotError.message);
      }
    }

    // Log the bank offers found (for debugging)
    console.log("Bank offers found:", data.bankOffers);

    // Generate AI summary for reviews
    const reviewTexts = data.reviews.map((review) => review.text);
    const reviewSummary = await summarizeReviews(reviewTexts, data.title);

    // Close the browser
    await browser.close();

    // Send the scraped data with the summarized review
    res.json({
      ...data,
      reviews: reviewSummary, // Replace reviews with the summary
    });
  } catch (error) {
    console.error("Error scraping data:", error);
    res.status(500).json({ error: "Failed to scrape data. Please try again." });
  }
});

app.get('/api/scrape', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    console.log(`Scraping URL: ${url}`);
    const data = await fetchAmazonData(url);
    res.json(data);
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ error: error.message || 'An error occurred during scraping' });
  }
});

app.get('/api/reviews', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    console.log(`Finding reviews for URL: ${url}`);
    const reviews = await findReviews(url);
    res.json(reviews);
  } catch (error) {
    console.error('Review fetching error:', error);
    res.status(500).json({ error: error.message || 'An error occurred while fetching reviews' });
  }
});

// Check if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';

// Use fallback directory if client/build doesn't exist
let staticPath = path.resolve(__dirname, '../client/dist');
if (!fs.existsSync(staticPath)) {
  console.log('Client build directory not found, using fallback directory');
  staticPath = path.resolve(__dirname, 'public');
}

// Log the static path being used
console.log(`Serving static files from: ${staticPath}`);

// Serve static files
app.use(express.static(staticPath));

// For any other route, serve the index.html file from the static directory
app.get('*', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Special handling for path-to-regexp errors
  if (err.message && err.message.includes('Missing parameter name')) {
    console.error('Path-to-regexp error detected. This typically happens when a URL is mistakenly used as a route pattern.');
    return res.status(500).json({ 
      error: 'Invalid route configuration',
      message: 'The server encountered an error with route configuration.'
    });
  }
  
  res.status(500).json({ 
    error: 'Server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// Get port from environment variable or default to 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`API available at: http://localhost:${PORT}/api/scrape and http://localhost:${PORT}/api/reviews`);
  console.log(`Frontend available at: http://localhost:${PORT}`);
});