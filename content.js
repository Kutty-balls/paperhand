// content.js
(function () {
    const currentSite = window.location.hostname;
    const supportedSites = {
      "neo.bullx.io": "BullX Neo",
      "photon-sol.tinyastro.io": "Photon"
    };
  
    if (!supportedSites[currentSite]) return;
  
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "20px";
    overlay.style.right = "20px";
    overlay.style.padding = "10px";
    overlay.style.backgroundColor = "#111";
    overlay.style.color = "#fff";
    overlay.style.fontFamily = "Arial, sans-serif";
    overlay.style.zIndex = 9999;
    overlay.style.border = "1px solid #0ff";
    overlay.style.borderRadius = "8px";
    overlay.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
  
    const username = localStorage.getItem("paperhand-username");
  
    if (!username) {
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Enter unique username";
      input.style.padding = "4px";
      input.style.marginBottom = "5px";
      input.style.width = "100%";
  
      const loginBtn = document.createElement("button");
      loginBtn.innerText = "Login";
      loginBtn.style.marginTop = "5px";
      loginBtn.style.padding = "4px 10px";
      loginBtn.style.width = "100%";
  
      loginBtn.onclick = () => {
        const inputName = input.value.trim();
        if (!inputName) return alert("Please enter a username");
  
        const allUsers = JSON.parse(localStorage.getItem("paperhand-users") || "[]");
        if (allUsers.includes(inputName)) {
          return alert("Username already taken");
        }
  
        allUsers.push(inputName);
        localStorage.setItem("paperhand-users", JSON.stringify(allUsers));
        localStorage.setItem("paperhand-username", inputName);
        localStorage.setItem(`sol-${inputName}`, "100.00");
        location.reload();
      };
  
      overlay.appendChild(input);
      overlay.appendChild(loginBtn);
      document.body.appendChild(overlay);
      return;
    }
  
    const balanceDisplay = document.createElement("div");
    const tradeUI = document.createElement("div");
    tradeUI.id = "trade-ui";
    tradeUI.style.marginTop = "10px";
  
    const tokenInput = document.createElement("input");
    tokenInput.type = "text";
    tokenInput.placeholder = "Token (e.g., WIF)";
    tokenInput.id = "tokenInput";
    tokenInput.style.marginTop = "5px";
    tokenInput.style.width = "100%";
  
    const amountInput = document.createElement("input");
    amountInput.type = "number";
    amountInput.placeholder = "Amount in SOL";
    amountInput.id = "amountInput";
    amountInput.style.marginTop = "5px";
    amountInput.style.width = "100%";
  
    const buyBtn = document.createElement("button");
    buyBtn.innerText = "Buy";
    buyBtn.disabled = true;
    buyBtn.style.marginTop = "5px";
    buyBtn.style.width = "49%";
    buyBtn.style.marginRight = "1%";
  
    const sellBtn = document.createElement("button");
    sellBtn.innerText = "Sell";
    sellBtn.disabled = true;
    sellBtn.style.marginTop = "5px";
    sellBtn.style.width = "49%";
  
    tradeUI.appendChild(tokenInput);
    tradeUI.appendChild(amountInput);
    tradeUI.appendChild(buyBtn);
    tradeUI.appendChild(sellBtn);
  
    const updateBalanceDisplay = () => {
      const bal = localStorage.getItem(`sol-${username}`) || "100.00";
      balanceDisplay.innerHTML = `
        Logged in as <b>@${username}</b><br/>
        <span style="color: #0f0;">SOL Balance:</span> ${parseFloat(bal).toFixed(2)} SOL<br/>
        <button id="logout-button" style="margin-top:10px;padding:4px 10px;width:100%;">Log out</button>
      `;
  
      document.getElementById("logout-button").onclick = () => {
        localStorage.removeItem("paperhand-username");
        location.reload();
      };
    };
  
    buyBtn.disabled = false;
    sellBtn.disabled = false;
  
    buyBtn.onclick = () => {
      const token = tokenInput.value.trim();
      const amount = parseFloat(amountInput.value);
  
      if (!token || isNaN(amount) || amount <= 0) {
        alert("Enter a valid token and amount.");
        return;
      }
  
      const current = parseFloat(localStorage.getItem(`sol-${username}`) || "0");
      if (amount > current) {
        alert("Not enough fake SOL!");
        return;
      }
  
      localStorage.setItem(`sol-${username}`, (current - amount).toFixed(2));
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
  
      const current = parseFloat(localStorage.getItem(`sol-${username}`) || "0");
      localStorage.setItem(`sol-${username}`, (current + amount).toFixed(2));
      alert(`🔴 Sold ${amount} SOL worth of ${token}`);
      updateBalanceDisplay();
    };
  
    overlay.appendChild(balanceDisplay);
    overlay.appendChild(tradeUI);
    document.body.appendChild(overlay);
  
    updateBalanceDisplay();
  })();