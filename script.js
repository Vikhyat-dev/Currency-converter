// Currency data with personality
const currencyData = {
  USD: { name: "US Dollar", symbol: "$", emoji: "🇺🇸", vibe: "The boss money!" },
  EUR: { name: "Euro", symbol: "€", emoji: "🇪🇺", vibe: "Fancy European vibes" },
  GBP: { name: "British Pound", symbol: "£", emoji: "🇬🇧", vibe: "Proper British, innit?" },
  JPY: { name: "Japanese Yen", symbol: "¥", emoji: "🇯🇵", vibe: "Kawaii money!" },
  AUD: { name: "Australian Dollar", symbol: "A$", emoji: "🇦🇺", vibe: "G'day mate!" },
  CAD: { name: "Canadian Dollar", symbol: "C$", emoji: "🇨🇦", vibe: "Sorry, eh?" },
  CHF: { name: "Swiss Franc", symbol: "CHF", emoji: "🇨🇭", vibe: "Mountain money" },
  CNY: { name: "Chinese Yuan", symbol: "¥", emoji: "🇨🇳", vibe: "Dragon power!" },
  INR: { name: "Indian Rupee", symbol: "₹", emoji: "🇮🇳", vibe: "Spicy currency!" },
  BRL: { name: "Brazilian Real", symbol: "R$", emoji: "🇧🇷", vibe: "Samba money!" },
};

// Moods and Fun Facts
const moods = ["😊", "🤑", "🚀", "✨", "🎉", "💰", "🔥", "⚡", "🌟", "💎"];
const funFacts = [
  "The word 'currency' comes from Latin 'currere' meaning 'to run'! 🏃‍♂️",
  "The first paper money was used in China over 1000 years ago! 🏮",
  "There are 180 currencies in the world today! 🌍",
  "The Euro is used by 19 countries! 🇪🇺",
  "Bitcoin was the first cryptocurrency! ₿",
  "The US Dollar is the most traded currency! 💵",
  "Switzerland has some of the most beautiful banknotes! 🏔️",
  "The British Pound is the oldest currency still in use! 👑",
  "Japan's currency doesn't have cents - only whole yen! 🎌",
  "Australia's money is made of plastic and waterproof! 🏄‍♂️",
];

// Variables
let currentRates = {};
let conversionHistory = [];

// DOM Elements
const amountInput = document.getElementById("amountInput");
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const swapBtn = document.getElementById("swapBtn");
const refreshBtn = document.getElementById("refreshBtn");
const currentMood = document.getElementById("currentMood");
const funFactText = document.getElementById("funFactText");
const resultValue = document.getElementById("resultValue");
const resultSymbol = document.getElementById("resultSymbol");
const conversionText = document.getElementById("conversionText");
const rateBadge = document.getElementById("rateBadge");
const confettiOverlay = document.getElementById("confettiOverlay");
const historySection = document.getElementById("historySection");
const historyList = document.getElementById("historyList");

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  updateCurrencyDisplays();
  fetchRates();
  showRandomFunFact();
});

// Setup event listeners
function setupEventListeners() {
  amountInput.addEventListener("input", debounce(convertCurrency, 300));
  fromCurrency.addEventListener("change", () => {
    updateCurrencyDisplays();
    fetchRates();
  });
  toCurrency.addEventListener("change", () => {
    updateCurrencyDisplays();
    convertCurrency();
  });
  swapBtn.addEventListener("click", swapCurrencies);
  refreshBtn.addEventListener("click", () => {
    fetchRates();
    showRandomFunFact();
  });
}

// Update UI
function updateCurrencyDisplays() {
  const fromCode = fromCurrency.value;
  const toCode = toCurrency.value;

  document.getElementById("fromFlag").textContent = currencyData[fromCode].emoji;
  document.getElementById("fromCode").textContent = fromCode;
  document.getElementById("fromVibe").textContent = currencyData[fromCode].vibe;

  document.getElementById("toFlag").textContent = currencyData[toCode].emoji;
  document.getElementById("toCode").textContent = toCode;
  document.getElementById("toVibe").textContent = currencyData[toCode].vibe;

  resultSymbol.textContent = currencyData[toCode].symbol;
}

// Fetch exchange rates
async function fetchRates() {
  const refreshIcon = document.getElementById("refreshIcon");
  const refreshText = document.getElementById("refreshText");

  refreshIcon?.classList.add("spinning");
  refreshText.textContent = "Getting fresh rates...";
  currentMood.textContent = moods[Math.floor(Math.random() * moods.length)];

  try {
    const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency.value}`);
    const data = await res.json();
    if (data.rates) {
      currentRates = data.rates;
      convertCurrency();
    }
  } catch (err) {
    console.error("Error:", err);
    currentRates = { USD: 1, EUR: 0.9, INR: 74 }; // fallback
    convertCurrency();
  }

  refreshIcon?.classList.remove("spinning");
  refreshText.textContent = "Refresh Rates";
}

// Convert logic
function convertCurrency() {
  const amount = parseFloat(amountInput.value) || 0;
  const from = fromCurrency.value;
  const to = toCurrency.value;

  if (amount <= 0) {
    resultValue.textContent = "0.00";
    conversionText.textContent = "Enter an amount to convert!";
    rateBadge.textContent = "Rate: Waiting for input...";
    return;
  }

  let rate = 1;
  if (from === to) rate = 1;
  else if (from === "USD") rate = currentRates[to] || 1;
  else if (to === "USD") rate = 1 / (currentRates[from] || 1);
  else rate = (1 / (currentRates[from] || 1)) * (currentRates[to] || 1);

  const result = amount * rate;
  resultValue.textContent = result.toFixed(2);
  conversionText.textContent = `${amount} ${currencyData[from].emoji} ${from} = ${result.toFixed(2)} ${currencyData[to].emoji} ${to}`;
  rateBadge.textContent = `Rate: 1 ${from} = ${rate.toFixed(4)} ${to}`;

  addToHistory({ from, to, amount, result, rate, mood: currentMood.textContent, timestamp: new Date() });

  if (amount >= 1000) showConfetti();
}

// Swap function
function swapCurrencies() {
  [fromCurrency.value, toCurrency.value] = [toCurrency.value, fromCurrency.value];
  updateCurrencyDisplays();
  convertCurrency();
  currentMood.textContent = "🔄";
  setTimeout(() => {
    currentMood.textContent = moods[Math.floor(Math.random() * moods.length)];
  }, 1000);
}

// Add history
function addToHistory(item) {
  conversionHistory.unshift(item);
  if (conversionHistory.length > 5) conversionHistory = conversionHistory.slice(0, 5);
  updateHistoryDisplay();
}

function updateHistoryDisplay() {
  if (!conversionHistory.length) {
    historySection.style.display = "none";
    return;
  }
  historySection.style.display = "block";
  historyList.innerHTML = "";
  conversionHistory.forEach((item) => {
    const div = document.createElement("div");
    div.className = "history-item";
    div.innerHTML = `
      <div class="history-info">
        <div class="history-mood">${item.mood}</div>
        <div class="history-details">
          <div class="history-conversion">
            ${item.amount} ${currencyData[item.from].emoji} ${item.from} → ${item.result.toFixed(2)} ${currencyData[item.to].emoji} ${item.to}
          </div>
          <div class="history-time">${item.timestamp.toLocaleTimeString()}</div>
        </div>
      </div>
      <div class="history-rate">Rate: ${item.rate.toFixed(4)}</div>
    `;
    historyList.appendChild(div);
  });
}

function showConfetti() {
  confettiOverlay.classList.add("active");
  setTimeout(() => confettiOverlay.classList.remove("active"), 2000);
}

function showRandomFunFact() {
  funFactText.textContent = funFacts[Math.floor(Math.random() * funFacts.length)];
}

function debounce(fn, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}
