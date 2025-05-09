// wait for DOM to fully load
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // fetch session data to see if user is logged in
    const response = await fetch("/session");
    const data = await response.json();

    const authSection = document.getElementById("authSection");
    const accountSection = document.getElementById("accountSection");
    const welcomeMessage = document.getElementById("welcomeMessage");

    if (data.loggedIn) {
      authSection.style.display = "none";
      accountSection.style.display = "block";
      welcomeMessage.textContent = `Welcome, ${data.username}!`;
    } else {
      authSection.style.display = "block";
      accountSection.style.display = "none";
    }
  } catch (err) {
    console.log("Error checking session:", err);
  }
});
// login and signup toggle
// set timeout delay added because display: none was messing up the gaps of display: flex
document.getElementById("toggleLoginBtn").addEventListener("click", () => {
  document.getElementById("signupForm").style.display = "none";
  setTimeout(() => {
    document.getElementById("loginForm").style.display = "flex";
  }, 1);
  document.getElementById("authTitle").innerText = "Log In";
  document.getElementById("toggleLoginBtn").style.display = "none";
  document.getElementById("toggleSignupBtn").style.display = "block";
});

// set timeout delay added because display: none was messing up the gaps of display: flex
document.getElementById("toggleSignupBtn").addEventListener("click", () => {
  setTimeout(() => {
    document.getElementById("signupForm").style.display = "flex";
  }, 1);
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("authTitle").innerText = "Create Your Account";
  document.getElementById("toggleSignupBtn").style.display = "none";
  document.getElementById("toggleLoginBtn").style.display = "block";
});

// Signup form submission
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("signupUsername").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  try {
    // send signup data to server
    const response = await fetch("/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
      credentials: "include",
    });

    const result = await response.json();

    // get the popup elements
    const popupMessage = document.getElementById("popupMessage");
    const popupText = document.getElementById("popupText");

    // set the popup message text
    popupText.textContent = result.message;
    //show the popup immediately
    popupMessage.style.display = "flex";

    if (response.ok) {
      console.log("Popup displayed:", result.message);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("username", username);

      // Hide the popup after 3 seconds
      setTimeout(() => {
        popupMessage.style.display = "none";
        // navigate to account page
        window.location.href = "/account";
      }, 3000);
    }
  } catch (err) {
    // display popup for error
    const popupMessage = document.getElementById("popupMessage");
    const popupText = document.getElementById("popupText");
    popupText.textContent = "Signup failed. Try again.";
    console.log("Error:", err.message);
    popupMessage.style.display = "flex";
  }
});

// close the popup when the button is clicked
document.getElementById("closePopupButton").addEventListener("click", () => {
  document.getElementById("popupMessage").style.display = "none";
});

// login form submission
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  console.log("Submitting form...");

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    const result = await response.json();

    // get the popup elements
    const popupMessage = document.getElementById("popupMessage");
    const popupText = document.getElementById("popupText");

    // set the popup message text
    popupText.textContent = result.message;
    // show the popup immediately
    popupMessage.style.display = "flex";

    if (response.ok) {
      console.log("Popup displayed:", result.message);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("username", result.username);

      setTimeout(() => {
        // hide the popup after 3 seconds
        popupMessage.style.display = "none";
        // navigate to account page or any other action
        window.location.href = "/account";
      }, 3000);
    }
  } catch (err) {
    // show popup if error
    const popupMessage = document.getElementById("popupMessage");
    const popupText = document.getElementById("popupText");
    popupText.textContent = "Login failed. Try again.";
    console.log("Error:", err.message);
    popupMessage.style.display = "flex";
  }
});

// logout Functionality
document.getElementById("logoutButton").addEventListener("click", async () => {
  try {
    await fetch("/logout", { method: "POST" });
    window.location.reload();
  } catch (err) {
    console.error("Logout failed:", err);
  }
});
