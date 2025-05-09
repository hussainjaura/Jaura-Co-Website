console.log("clothes.js loaded");

// define the function first
async function addToCart(event, productId, name, price, imageUrl) {
  // prevent the form from submitting
  event.preventDefault();
  // each form adds 1 item
  const quantity = 1;

  try {
    const response = await fetch("/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId, name, price, quantity, imageUrl }),
    });

    if (response.ok) {
      showPopup(`${name} has been added to your cart!`, "Added to Cart");
      // redirect to cart after adding item
      // window.location.href = '/cart';  // Redirect to the cart page
    } else {
      showPopup(
        "Please Log In or Sign Up before adding items to cart.",
        "Authentication Required!"
      );
    }
  } catch (error) {
    console.error("error adding item:", error);
  }
}

// function to show the custom popup
function showPopup(message, headerText = "Item added to cart") {
  const popup = document.getElementById("popup");
  const popupMessage = popup.querySelector("p");
  const popupHeader = document.getElementById("popup-header");

  popupMessage.textContent = message;
  // update header dynamically
  popupHeader.textContent = headerText;
  // Show the popup
  popup.style.display = "flex";
}

// function to close the popup
function closePopup() {
  const popup = document.getElementById("popup");
  // hide the popup
  popup.style.display = "none";
}

// ensure event listeners are correctly attached
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Content Loaded");

  // Add event listener for cart buttons using event delegation
  document.addEventListener("click", function (event) {
    const button = event.target.closest(".add-to-cart-btn");
    if (button) {
      const productId = button.dataset.productId;
      const name = button.dataset.productName;
      const price = parseFloat(button.dataset.productPrice);
      const imageUrl = button.dataset.productImage;

      addToCart(event, productId, name, price, imageUrl);
    }
  });

  const closeBtn = document.getElementById("popup-close");
  const popupButton = document.getElementById("popup-button");

  if (closeBtn) {
    closeBtn.addEventListener("click", closePopup);
  }

  if (popupButton) {
    popupButton.addEventListener("click", closePopup);
  }
});
