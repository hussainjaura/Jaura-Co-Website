// for dynamic cart item removal
async function removeItem(productId) {
  try {
    const response = await fetch("/cart/remove", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId }),
    });

    if (response.ok) {
      // remove the item from the DOM
      const cartItem = document.getElementById(`cart-item-${productId}`);
      if (cartItem) {
        // Get the item's price and quantity before removing it
        const itemQuantity = parseInt(cartItem.dataset.quantity);
        const itemPrice = parseFloat(cartItem.dataset.price);
        const itemTotal = itemPrice * itemQuantity;

        // Get current totals
        const totalItemsElem = document.getElementById("total-items");
        const totalPriceElem = document.getElementById("total-price");
        
        // Remove the £ symbol and convert to number
        const currentTotalPrice = parseFloat(totalPriceElem.textContent.replace('£', ''));
        const currentTotalItems = parseInt(totalItemsElem.textContent);

        // Calculate new totals
        const newTotalItems = currentTotalItems - itemQuantity;
        const newTotalPrice = currentTotalPrice - itemTotal;

        // Update the DOM
        totalItemsElem.textContent = newTotalItems;
        totalPriceElem.textContent = `£${newTotalPrice.toFixed(2)}`;

        // Remove the item from DOM
        cartItem.remove();

        // check if the cart is now empty
        if (newTotalItems === 0) {
          updateCartToEmptyState();
        }
      }
    } else {
      console.error("failed to remove the item from the cart.");
    }
  } catch (error) {
    console.error("error removing item:", error);
  }
}

function updateItem(productId, quantity) {
  // ensuring the entered quantity is valid
  if (quantity < 1) {
    alert("Quantity must be at least 1.");
    return;
  }

  fetch("/cart/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      productId: productId,
      quantity: parseInt(quantity, 10),
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        location.reload();
      } else if (data.error) {
        console.error(data.error);
      }
    })
    .catch((err) => {
      console.error("error updating item:", err);
    });
}

//   to update cart display when its empty
function updateCartToEmptyState() {
  const cartContainer = document.querySelector(".cart-items");
  const cartSummary = document.querySelector(".cart-summary");
  const cartContent = document.querySelector(".cart-content");
  
  // Replace the entire cart content with the empty cart structure
  if (cartContent) {
    cartContent.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart"></i>
        <h3>Your cart is empty</h3>
        <p>Looks like you haven't added any items to your cart yet.</p>
        <a href="/clothes" class="btn primary-btn">
          Start Shopping <i class="fas fa-arrow-right"></i>
        </a>
      </div>
    `;
  }
}

//   wait for the page to fully load
document.addEventListener("DOMContentLoaded", () => {
  // Handle remove buttons
  document.addEventListener('click', function(event) {
    const removeBtn = event.target.closest('.remove-btn');
    if (removeBtn) {
      const productId = removeBtn.dataset.productId;
      removeItem(productId);
    }
  });

  // Handle quantity buttons
  document.addEventListener('click', function(event) {
    const quantityBtn = event.target.closest('.quantity-btn');
    if (quantityBtn) {
      const productId = quantityBtn.dataset.productId;
      const action = quantityBtn.dataset.action;
      const input = document.getElementById(`quantity-${productId}`);
      let newQuantity = parseInt(input.value);

      if (action === 'increase') {
        newQuantity++;
      } else if (action === 'decrease') {
        newQuantity = Math.max(1, newQuantity - 1);
      }

      input.value = newQuantity;
      updateItem(productId, newQuantity);
    }
  });

  // Handle quantity input changes
  document.addEventListener('change', function(event) {
    if (event.target.classList.contains('quantity-input')) {
      const productId = event.target.dataset.productId;
      const quantity = event.target.value;
      updateItem(productId, quantity);
    }
  });

  // Handle checkout button
  const checkoutButton = document.getElementById("checkout-button");
  if (checkoutButton) {
    checkoutButton.addEventListener("click", async (e) => {
      e.preventDefault();

      const cartItems = [];
      document.querySelectorAll(".cart-item").forEach((item) => {
        cartItems.push({
          product_id: item.id.replace("cart-item-", ""),
          name: item.querySelector("h3").textContent,
          price: parseFloat(item.dataset.price) * 100,
          quantity: parseInt(item.dataset.quantity, 10),
        });
      });

      if (cartItems.length === 0) {
        alert("Your cart is empty!");
        return;
      }

      try {
        const response = await fetch("/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartItems }),
        });

        const session = await response.json();
        if (session.url) {
          window.location.href = session.url;
        } else {
          console.error("failed to retrieve session URL");
        }
      } catch (err) {
        console.error("checkout error:", err);
      }
    });
  }
});
