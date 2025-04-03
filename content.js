(function () {
  const currentSite = window.location.hostname;
  const supportedSites = {
      "neo-backup.bullx.io": "BullX Neo Backup",
      "neo.bullx.io": "BullX Neo",
      "photon-sol.tinyastro.io": "Photon"
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

          const updateBalanceDisplay = () => {
              const balance = localStorage.getItem(`sol-${username}`) || "100.00";
              balanceDisplay.innerHTML = `
                  <div class="ph-header">Logged in as <b>@${username}</b></div>
                  <button id="logout-button">Logout</button>
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
        
                // Allow reusing the same username
                localStorage.setItem("paperhand-username", inputName);
        
                // Initialize balance if it doesn't exist
                if (!localStorage.getItem(`sol-${inputName}`)) {
                    localStorage.setItem(`sol-${inputName}`, "10.00");
                }
        
                location.reload();
            };
            return;
        }

          // Show buy/sell overlay
          contentDiv.style.display = "none";
          overlayDiv.style.display = "block";

          buyBtn.disabled = false;
          sellBtn.disabled = false;

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