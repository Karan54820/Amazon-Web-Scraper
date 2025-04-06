/**
 * Helper functions for handling scraped data and debugging
 */

/**
 * Checks the structure of the scraped data and logs any missing or malformed fields
 * @param {Object} scrapedData - The data returned from the scraper
 * @returns {Object} An object with validation results
 */
export const validateScrapedData = (scrapedData) => {
  const results = {
    isValid: true,
    missingFields: [],
    emptyArrays: [],
    malformedFields: []
  };

  if (!scrapedData) {
    results.isValid = false;
    results.missingFields.push('entire data object');
    return results;
  }

  // Check for required fields
  const requiredFields = [
    'title', 'rating', 'numRatings', 'price', 'discount', 
    'bankOffers', 'aboutItem', 'productInfo', 
    'productImages', 'manufacturerImages', 'reviews'
  ];

  requiredFields.forEach(field => {
    if (scrapedData[field] === undefined) {
      results.isValid = false;
      results.missingFields.push(field);
    }
  });

  // Check for empty arrays
  const arrayFields = ['bankOffers', 'aboutItem', 'productImages', 'manufacturerImages'];
  arrayFields.forEach(field => {
    if (Array.isArray(scrapedData[field]) && scrapedData[field].length === 0) {
      results.emptyArrays.push(field);
    }
  });

  // Check for malformed fields
  if (scrapedData.bankOffers && !Array.isArray(scrapedData.bankOffers)) {
    results.isValid = false;
    results.malformedFields.push('bankOffers should be an array');
  }

  if (scrapedData.aboutItem && !Array.isArray(scrapedData.aboutItem)) {
    results.isValid = false;
    results.malformedFields.push('aboutItem should be an array');
  }

  if (scrapedData.productInfo && typeof scrapedData.productInfo !== 'object') {
    results.isValid = false;
    results.malformedFields.push('productInfo should be an object');
  }

  if (scrapedData.productImages && !Array.isArray(scrapedData.productImages)) {
    results.isValid = false;
    results.malformedFields.push('productImages should be an array');
  }

  if (scrapedData.manufacturerImages && !Array.isArray(scrapedData.manufacturerImages)) {
    results.isValid = false;
    results.malformedFields.push('manufacturerImages should be an array');
  }

  return results;
};

/**
 * Generates sample bank offers for testing
 * @returns {Array} An array of sample bank offers
 */
export const generateSampleBankOffers = () => {
  return [
    "10% instant discount up to ₹1,500 on SBI Credit Card EMI transactions. Min purchase value ₹5,000",
    "5% Back on Amazon Pay ICICI Bank Credit Card. 3% back for non-Prime members",
    "Get GST invoice and save up to 28% on business purchases",
    "No cost EMI available on select cards. Please check 'EMI options' above for more details",
    "Bank Offer: Flat INR 1250 Instant Discount on HDFC Bank Credit Card EMI"
  ];
};

/**
 * Helps format the backend request for debugging
 * @param {string} url - The URL to scrape
 * @returns {Object} A properly formatted request object
 */
export const formatScrapingRequest = (url) => {
  return {
    link: url.trim(),
    options: {
      includeBankOffers: true,
      timeout: 30000
    }
  };
}; 