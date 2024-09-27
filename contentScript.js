const SELECTORS = {
  PRODUCT_CARD: ".product-card",
  IMAGE: "img",
  TITLE: ".product-card__title",
  PRICE: ".tw-font-secondary",
};

const getTextContent = (element, selector) =>
  element.querySelector(selector)?.textContent?.trim() ?? null;

const getImageSource = (element, selector) => {
  const imgElement = element.querySelector(selector);
  if (!imgElement) return null;

  let imgSrc =
    imgElement.getAttribute("src") ||
    imgElement.getAttribute("data-src") ||
    imgElement.getAttribute("srcset")?.split(" ")[0] ||
    null;

  if (imgSrc && imgSrc.startsWith("//")) {
    imgSrc = window.location.protocol + imgSrc;
  }

  return imgSrc;
};

const extractProductData = (product) => ({
  imgSrc: getImageSource(product, SELECTORS.IMAGE) || "",
  name: getTextContent(product, SELECTORS.TITLE) || "No Name",
  price: getTextContent(product, SELECTORS.PRICE) || "No Price",
});

const extractProducts = () =>
  Array.from(document.querySelectorAll(SELECTORS.PRODUCT_CARD)).map(
    extractProductData
  );

// handle message from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "extractProducts") {
    sendResponse({ products: extractProducts() });
  }
  return true;
});
