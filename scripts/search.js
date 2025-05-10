// function to add item to the cart
async function addToCart(event, productId, name, price, imageUrl) {
  event.preventDefault();
  // quantity when clicked once to add item to cart
  const quantity = 1;

  try {
    // send a post request to server with product details
    const response = await fetch("/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId, name, price, quantity, imageUrl }),
    });
    // show success or ask for login if not logged in
    if (response.ok) {
      showPopup(`${name} has been added to your cart!`, "Added to Cart");
    } else {
      showPopup(
        "Please Log In or Sign Up before adding items to cart.",
        "Authentication Required"
      );
    }
  } catch (error) {
    console.error("error adding item to cart:", error);
  }
}

// function to show a popup notification
function showPopup(message, headerText = "Item added to cart") {
  // getting DOM elements
  const popup = document.getElementById("popup");
  const popupMessage = popup.querySelector("p");
  const popupHeader = document.getElementById("popup-header");
  // set popup text and make it visible
  popupMessage.textContent = message;
  popupHeader.textContent = headerText;
  popup.style.display = "flex";
}

// close popup function
function closePopup() {
  document.getElementById("popup").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  // add event listener for cart buttons using event delegation
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

  if (closeBtn) closeBtn.addEventListener("click", closePopup);
  if (popupButton) popupButton.addEventListener("click", closePopup);
});
