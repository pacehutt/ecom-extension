document.addEventListener("DOMContentLoaded", async function () {
  const elements = {
    productList: document.getElementById("productList"),
    similarProductsDiv: document.getElementById("similarProducts"),
    backButton: document.getElementById("backButton"),
    messageDiv: document.getElementById("message"),
  };

  const LEVI_DOMAINS = ["levi.in", "levi.com"];
  const SIMILAR_PRODUCTS_API = "https://fakestoreapi.com/products?limit=5";

  console.log("Popup script loaded");

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    console.log("Current tab URL:", tab.url);

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["contentScript.js"],
    });

    if (!LEVI_DOMAINS.some((domain) => tab.url.includes(domain))) {
      showMessage(
        "Please visit Levi's website to extract products. <a href='https://levi.com' target='_blank'>Go to Levi's</a>"
      );
      return;
    }

    showMessage("Gathering products...");

    const response = await chrome.tabs.sendMessage(tab.id, {
      action: "extractProducts",
    });
    console.log("Extracted products:", response);

    if (response?.products?.length > 0) {
      displayProducts(response.products, elements.productList, true);
      clearMessage();
    } else {
      showMessage("No products found on this page.");
    }
  } catch (error) {
    console.error("Error in popup script:", error);
    showMessage("An error occurred. Please try again.");
  }

  function displayProducts(products, container, showSimilarButton = false) {
    container.innerHTML = "";
    const fragment = document.createDocumentFragment();

    products.forEach((product) => {
      const productCard = createProductCard(product, showSimilarButton);
      fragment.appendChild(productCard);
    });

    container.appendChild(fragment);
  }

  function createProductCard(product, showSimilarButton) {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.innerHTML = `
      <div class="image-wrapper">
        <img src="${product.imgSrc || product.image}" alt="${
      product.name || product.title
    }">
      </div>
      <div class="product-info">
        <h4>${product.name || product.title}</h4>
        <p>${
          product.price
            ? `${!showSimilarButton ? "₹" + product.price : product.price} `
            : "No price available"
        }</p>
      </div>
    `;

    if (showSimilarButton) {
      const similarButton = createSimilarButton(product);
      productCard.appendChild(similarButton);
    }

    return productCard;
  }

  function createSimilarButton(product) {
    const similarButton = document.createElement("button");
    similarButton.className = "show-similar";
    similarButton.textContent = "Similar";
    similarButton.addEventListener("click", () =>
      fetchSimilarProducts(product.name || product.title)
    );
    return similarButton;
  }

  async function fetchSimilarProducts(productName) {
    showMessage("Fetching similar products...");

    try {
      const response = await fetch(SIMILAR_PRODUCTS_API);
      const data = await response.json();

      elements.productList.classList.add("hidden");
      elements.similarProductsDiv.classList.remove("hidden");
      elements.backButton.classList.remove("hidden");

      displayProducts(data, elements.similarProductsDiv, false);
      clearMessage();
    } catch (error) {
      console.error("Error fetching similar products:", error);
      showMessage("Error fetching similar products.");
    }
  }

  function showMessage(message) {
    elements.messageDiv.innerHTML = message;
    elements.messageDiv.classList.remove("hidden");
  }

  function clearMessage() {
    elements.messageDiv.innerHTML = "";
    elements.messageDiv.classList.add("hidden");
  }

  elements.backButton.addEventListener("click", () => {
    elements.similarProductsDiv.classList.add("hidden");
    elements.productList.classList.remove("hidden");
    elements.backButton.classList.add("hidden");
  });
});
