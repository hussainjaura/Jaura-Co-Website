document
        .getElementById("contactForm")
        .addEventListener("submit", function (e) {
          e.preventDefault();

          // show popup
          const popupMessage = document.getElementById("popupMessage");
          const popupText = document.getElementById("popupText");
          popupText.textContent =
            "Thank you for your message! We will get back to you soon.";
          popupMessage.style.display = "flex";

          // hide popup after 3 seconds
          setTimeout(() => {
            popupMessage.style.display = "none";
          }, 5000);

          // reset the form
          this.reset();
        });

      // close popup when clicking the close button
      document
        .getElementById("closePopupButton")
        .addEventListener("click", () => {
          document.getElementById("popupMessage").style.display = "none";
        });