(function () {
  const currentSite = window.location.hostname;
  const supportedSites = {
    "neo-backup.bullx.io": "BullX Neo Backup",
    "neo.bullx.io": "BullX Neo",
    "photon-sol.tinyastro.io": "Photon",
  };

  if (!supportedSites[currentSite]) return;

  // Fetch the overlay HTML and inject it into the page
  fetch(chrome.runtime.getURL("overlay.html"))
    .then((response) => response.text())
    .then((html) => {
      const overlayContainer = document.createElement("div");
      overlayContainer.innerHTML = html;
      document.body.appendChild(overlayContainer);

      const username = localStorage.getItem("paperhand-username");
      const contentDiv = document.getElementById("content");
      const overlayDiv = document.getElementById("paperhand-overlay");
      const balanceDisplay = document.getElementById("balance-display");
      const tokenInput = document.getElementById("tokenInput");
      const amountInput = document.getElementById("amountInput");
      const buyBtn = document.getElementById("buyBtn");
      const sellBtn = document.getElementById("sellBtn");

      // Function to fetch the contract address
      const fetchContractAddress = () => {
        if (currentSite === "neo.bullx.io" || currentSite === "neo-backup.bullx.io") {
          // For BullX and Neo BullX, extract the contract address from the URL
          const urlParts = window.location.search.split("=");
          const contractAddress = urlParts[urlParts.length - 1]; // Get the last part after "="
          if (contractAddress) {
            tokenInput.value = contractAddress;
          } else {
            console.error("Contract address not found in the URL.");
          }
        } else if (currentSite === "photon-sol.tinyastro.io") {
          // For Photon, extract the contract address from the DOM
          const tokenLink = document.querySelector(".p-show__bar__link");
          if (tokenLink) {
            const contractAddress = tokenLink.href.split("/").pop(); // Extract the last part of the URL
            tokenInput.value = contractAddress;
          } else {
            console.error("Contract address not found on Photon.");
          }
        }
      };

      // Fetch the contract address when the overlay is loaded
      fetchContractAddress();


      const changeLogo = () => {
        if (currentSite === "neo-backup.bullx.io") {
          // Use the correct selector for the logo element
          const logoLink = document.querySelector("a.w-full.flex.flex-row.px-3.hover\\:bg-none"); // Selector for the <a> tag
          const logoSpan = document.querySelector(".min-w-\\[24px\\].md\\:min-w-\\[32px\\].max-md\\:mr-1"); // Selector for the <span> tag
      
          if (logoLink && logoSpan) {
            // Change the hyperlink of the <a> tag
            logoLink.href = "https://memeshare-ynr0.onrender.com/index.html";
            logoLink.target = "_blank"; // Open the link in a new tab
            logoLink.rel = "noopener noreferrer"; // Security best practice for external links
      
            // Replace the logo with your custom PNG
            logoSpan.innerHTML = `<img src="${chrome.runtime.getURL("icons/icon128.png")}" alt="PaperHand Logo" style="width: 32px; height: 32px;">`;
      
            // Ensure the default behavior of the <a> tag is not overridden
            logoLink.addEventListener("click", (event) => {
              event.stopPropagation(); // Prevent interference from other event listeners
            });
          } else {
            console.error("Logo element or link not found on neo-backup.bullx.io");
          }
        }
      };

      changeLogo();


      const updateBalanceDisplay = () => {
        const balance = localStorage.getItem(`sol-${username}`) || "100.00";
        balanceDisplay.innerHTML = `
          <div class="ph-header">Logged in as <b>@${username}</b></div>
          <button id="logout-button" class="logout-button">Log out</button>
          <hr>
          <div class="ph-body">
            <span class="balance-label">SOL Balance:</span> ${parseFloat(balance).toFixed(2)} SOL
          </div>
          
        `;

        document.getElementById("logout-button").onclick = () => {
          localStorage.removeItem("paperhand-username");
          location.reload();
        };
      };

      if (!username) {
        // Show login UI
        contentDiv.style.display = "block";
        overlayDiv.style.display = "none";

        document.getElementById("loginBtn").onclick = () => {
          const inputName = document.getElementById("usernameInput").value.trim();
          if (!inputName) return alert("Please enter a username");

          localStorage.setItem("paperhand-username", inputName);
          if (!localStorage.getItem(`sol-${inputName}`)) {
            localStorage.setItem(`sol-${inputName}`, "100.00");
          }
          location.reload();
        };
        return;
      }

      // Show buy/sell overlay
      contentDiv.style.display = "none";
      overlayDiv.style.display = "block";

      buyBtn.onclick = () => {
        const token = tokenInput.value.trim();
        const amount = parseFloat(amountInput.value);

        if (!token || isNaN(amount) || amount <= 0) {
          alert("Enter a valid token and amount.");
          return;
        }

        const currentBalance = parseFloat(localStorage.getItem(`sol-${username}`) || "0");
        if (amount > currentBalance) {
          alert("Not enough fake SOL!");
          return;
        }

        localStorage.setItem(`sol-${username}`, (currentBalance - amount).toFixed(2));
        alert(`🟢 Bought ${amount} SOL worth of ${token}`);
        updateBalanceDisplay();
      };

      sellBtn.onclick = () => {
        const token = tokenInput.value.trim();
        const amount = parseFloat(amountInput.value);

        if (!token || isNaN(amount) || amount <= 0) {
          alert("Enter a valid token and amount.");
          return;
        }

        const currentBalance = parseFloat(localStorage.getItem(`sol-${username}`) || "0");
        localStorage.setItem(`sol-${username}`, (currentBalance + amount).toFixed(2));
        alert(`🔴 Sold ${amount} SOL worth of ${token}`);
        updateBalanceDisplay();
      };

      updateBalanceDisplay();
    });
})();