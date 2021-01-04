const puppeteer = require('puppeteer');

const searchUrlPrefix = "https://www.domain.com.au/sale/?suburb=largs-bay-sa-5016,semaphore-sa-5019&bedrooms=3-any&bathrooms=1-any&price=0-600000&excludeunderoffer=1&carspaces=1-any&page=";
const MAX_PAGE_NUMBER = 100;

(async () => {
    const browser = await puppeteer.launch({ 
        headless: false
    });
    const page = await browser.newPage();

    let currentPageNumber = 1;

    do {
        await page.goto(searchUrlPrefix + currentPageNumber, {waitUntil: 'domcontentloaded', timeout: 0});

        let isLastPage = await page.evaluate(hasNoResults);
        if (isLastPage) break;
        
        // const extractionResults = await page.evaluate(extractDataFromPage);
        const extractionResults = await page.evaluate(extractDataFromPage);

        console.log('page ' + currentPageNumber)
        console.log('extractionResults:', extractionResults);

        currentPageNumber++;
    } while (currentPageNumber < MAX_PAGE_NUMBER);
    
    await browser.close();

})();

/**
 * Checks to see if the page contains no results.
 */
function hasNoResults() {
    return document.querySelectorAll('[alt="No search results"]').length !== 0
}

function extractDataFromPage() {
    let results = Array.from(document.querySelector('[data-testid="results"]').childNodes);

    data = results.map(function (result) {

        let linkNode = result.querySelector('[itemprop="url"]');
        if (linkNode !== null) {
            url = linkNode.href;
        } else {
            url = null;
        }

        let priceNode = result.querySelector('[data-testid="listing-card-price"]');
        if (priceNode !== null) {
            price = priceNode.innerText;
        } else {
            price = null;
        }

        let addressLine1Node = result.querySelector('[data-testid="address-line1"]');
        if (addressLine1Node !== null) {
            addressLine1 = addressLine1Node.innerText;
        } else {
            addressLine1 = null;
        }

        let addressLine2Node = result.querySelector('[data-testid="address-line2"]');
        if (addressLine2Node !== null) {
            addressLine2 = addressLine2Node.innerText;
        } else {
            addressLine2 = null;
        }

        return {
            url: url,
            price: price,
            address1: addressLine1,
            address2: addressLine2
        };
    });

    data = data.filter(entry => entry.url !== null);

    return data;
}

function noOp() {
    return {}
}

/**
 * Selector for URL to individual property pages
 * document.querySelector('[data-testid="results"]').querySelectorAll('[itemprop="url"]')
 * Array.from(document.querySelector('[data-testid="results"]').querySelectorAll('[itemprop="url"]')).map(url => url.href)
 * 
 * Selector for Price to properties
 * document.querySelector('[data-testid="results"]').querySelectorAll('[data-testid="listing-card-price"]')
 * 
 * 
 * Selector for parent elements containing property features (bed, bath & carpark)
 * document.querySelector('[data-testid="results"]').querySelectorAll('[data-testid="property-features-wrapper"]')
 * 
 * Selector for Address (Street Name)
 * document.querySelector('[data-testid="results"]').querySelectorAll('[data-testid="address-line1"]')
 * 
 * Selector for Address (Suburb)
 * document.querySelector('[data-testid="results"]').querySelectorAll('[data-testid="address-line2"]')
 * 
 * Selector for when there are no result in the paginated page
 * document.querySelectorAll('[alt="No search results"]')
 */