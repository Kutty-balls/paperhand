(function () {
  const heliusApiKey = 'f5704630-83c9-4627-bffa-d7da240bf76c';
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
      const currentCoinDiv = document.getElementById("current-coin"); // Get the #current-coin div

      // Function to fetch the contract address
      const fetchContractAddress = () => {
        if (currentSite === "neo.bullx.io" || currentSite === "neo-backup.bullx.io") {
          const urlParts = window.location.search.split("=");
          const contractAddress = urlParts[urlParts.length - 1]; // Get the last part after "="
          if (contractAddress) {
            tokenInput.value = contractAddress;
            fetchTokenInfo(contractAddress); // Fetch token info after getting the contract address
          } else {
            console.error("Contract address not found in the URL.");
          }
        } else if (currentSite === "photon-sol.tinyastro.io") {
          const tokenLink = document.querySelector(".p-show__bar__link");
          if (tokenLink) {
            const contractAddress = tokenLink.href.split("/").pop(); // Extract the last part of the URL
            tokenInput.value = contractAddress;
            fetchTokenInfo(contractAddress); // Fetch token info after getting the contract address
          } else {
            console.error("Contract address not found on Photon.");
          }
        }
      };

      // Fetch the contract address when the overlay is loaded
      fetchContractAddress();

      async function fetchTokenInfo(address) {
        try {
          const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "jsonrpc": "2.0", "id": "text", "method": "getAsset", "params": { id: address } }),
          });
      
          const data = await response.json();
      
          if (data.error) {
            console.error("Helius API Error:", data.error);
            currentCoinDiv.innerHTML = `<div class="error">Failed to fetch token info</div>`;
            return;
          }
      
          if (data && data.result && data.result.content && data.result.content.metadata && data.result.token_info) {
            const { description, name, symbol } = data.result.content.metadata;
            const { supply, decimals } = data.result.token_info;
            const { image } = data.result.content.links;
            const totalSupply = Math.round((supply / Math.pow(10, decimals)));
      
            // Fetch the market cap using the token address and total supply
            const updateMarketCap = async () => {
              const marketCap = await fetchMarketCap(address, totalSupply);
              const marketCapElement = document.getElementById("market-cap");
      
              if (marketCapElement) {
                marketCapElement.textContent = marketCap;
              }
            };
      
            // Update the #current-coin div with token information and market cap
            currentCoinDiv.innerHTML = `
              <div class="current-coin">
                <img src="${image}" alt="${name}" style="width: 50px; height: 50px; border-radius: 15%;">
                <h3>${name} ($${symbol})</h3>
                <p><strong>Market Cap:</strong> <span id="market-cap">Loading...</span></p>
              </div>
            `;
            // Fetch the market cap immediately
            updateMarketCap();

            setInterval(updateMarketCap, 2000);
          } else {
            currentCoinDiv.innerHTML = `<div class="error">Token information not found</div>`;
          }
        } catch (error) {
          console.error("Error fetching token info:", error);
          currentCoinDiv.innerHTML = `<div class="error">Failed to fetch token info</div>`;
        }
      }
      
      async function fetchMarketCap(address, totalSupply) {
        const apiUrl = `https://api.jup.ag/swap/v1/quote?inputMint=${address}&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=100000000&slippageBps=50&restrictIntermediateTokens=true`;
        try {
          const response = await fetch(apiUrl);
          const data = await response.json();
      
          if (data && data.outAmount) {
            const priceInUsdc = parseFloat(data.outAmount) / 100000000;
            const marketCap = priceInUsdc * totalSupply;
            let formattedMarketCap;
      
            if (marketCap >= 1000000) {
              formattedMarketCap = (marketCap / 1000000).toFixed(2) + "M";
            } else if (marketCap >= 1000) {
              formattedMarketCap = (marketCap / 1000).toFixed(2) + "K";
            } else {
              formattedMarketCap = marketCap.toFixed(2);
            }
      
            return `$${formattedMarketCap}`;
          } else {
            return "Market cap not found";
          }
        } catch (error) {
          console.error("Error fetching market cap:", error);
          return "Error fetching market cap";
        }
      }

      const changeLogo = () => {
        if (currentSite === "neo-backup.bullx.io" || currentSite === "neo.bullx.io") {
          const logoLink = document.querySelector("a.w-full.flex.flex-row.px-3.hover\\:bg-none");
          const logoSpan = document.querySelector(".min-w-\\[24px\\].md\\:min-w-\\[32px\\].max-md\\:mr-1");

          if (logoLink && logoSpan) {
            logoLink.href = "https://memeshare-ynr0.onrender.com/index.html";
            logoLink.target = "_blank";
            logoLink.rel = "noopener noreferrer";

            logoSpan.innerHTML = `<img src="${chrome.runtime.getURL("icons/icon128.png")}" alt="PaperHand Logo" style="width: 32px; height: 32px;">`;
          } else {
            console.error("Logo element or link not found on neo-backup.bullx.io");
          }
        }
      };

      changeLogo();

      const observeBalanceSpan = () => {
        const observer = new MutationObserver(() => {
          const balanceSpan = document.querySelector(".text-xs.font-medium.text-grey-200.ml-1");
          if (balanceSpan) {
            const balance = localStorage.getItem(`sol-${username}`) || "100.00";
            const pBalance = parseFloat(balance).toFixed(2);
            balanceSpan.textContent = `${pBalance}`;
            observer.disconnect(); // Stop observing once the element is found and updated
          }
        });
      
        observer.observe(document.body, { childList: true, subtree: true });
      };
      
      // Call the observer function
      observeBalanceSpan();

      
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