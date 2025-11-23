// ==================== UTILITIES ====================
const StorageKeys = {
    TRANSACTIONS: 'transactions',
    GOALS: 'goals',
    IS_LOGGED_IN: 'isLoggedIn',
    THEME: 'theme',
    USERNAME: 'username',
    LANGUAGE: 'language'
};

const CategoryIcons = {
    food: '🍔',
    transport: '🚗',
    shopping: '🛍️',
    bills: '📄',
    entertainment: '🎬',
    health: '🏥',
    other: '📦',
    salary: '💼',
    freelance: '💻',
    investment: '📈',
    gift: '🎁',
    'other-income': '💵'
};

const CategoryLabels = {
    food: 'Food',
    transport: 'Transport',
    shopping: 'Shopping',
    bills: 'Bills',
    entertainment: 'Entertainment',
    health: 'Health',
    other: 'Other',
    salary: 'Salary',
    freelance: 'Freelance',
    investment: 'Investment',
    gift: 'Gift',
    'other-income': 'Other'
};

const Utils = {
    getCategoryText(category) {
        const icon = CategoryIcons[category] || '📦';
        const label = CategoryLabels[category] || 'Other';
        return `${icon} ${label}`;
    },

    formatDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}`;
    },
    
    formatFullDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    },

    formatCurrency(amount) {
        return `$${amount.toFixed(2)}`;
    },

    safeGetFromStorage(key, defaultValue = []) {
        try {
            return JSON.parse(localStorage.getItem(key)) || defaultValue;
        } catch (error) {
            console.error(`Error reading ${key} from storage:`, error);
            return defaultValue;
        }
    },

    safeSaveToStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error saving ${key} to storage:`, error);
            return false;
        }
    }
};

// ==================== THEME MANAGEMENT ====================
function initializeTheme() {
    const savedTheme = localStorage.getItem(StorageKeys.THEME);
    const themeToggleBtn = document.getElementById('themeToggle');
    
    // Apply saved theme or default to light
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark-mode');
    } else {
        document.documentElement.classList.remove('dark-mode');
    }
    
    // Setup theme toggle button
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    const isDarkMode = document.documentElement.classList.toggle('dark-mode');
    
    // Save preference to localStorage
    localStorage.setItem(StorageKeys.THEME, isDarkMode ? 'dark' : 'light');
    
    // Optional: Add a subtle animation effect
    document.documentElement.style.transition = 'all 0.3s ease';
}

// ==================== SETTINGS MODAL ====================
function initializeSettingsModal() {
    const settingsBtn = document.getElementById('settingsBtn');
    if (!settingsBtn) return;
    
    // Create settings modal HTML
    const settingsModal = document.createElement('div');
    settingsModal.id = 'settingsModal';
    settingsModal.className = 'overlay-modal';
    settingsModal.innerHTML = `
        <div class="modal-box">
            <div class="modal-box-header">
                <h2 class="modal-box-title">⚙️ Settings</h2>
                <button class="modal-box-close" id="closeSettings">✖</button>
            </div>
            <div class="modal-box-content">
                <div class="settings-section">
                    <label class="settings-label">Language</label>
                    <select class="language-dropdown" id="languageSelect">
                        <option value="en">🇬🇧 English</option>
                        <option value="zh" disabled>🇨🇳 中文 (Chinese)</option>
                    </select>
                    <p class="disabled-notice">* Additional languages are coming soon</p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(settingsModal);
    
    // Setup event listeners
    settingsBtn.addEventListener('click', openSettingsModal);
    document.getElementById('closeSettings').addEventListener('click', closeSettingsModal);
    settingsModal.addEventListener('click', function(e) {
        if (e.target === settingsModal) {
            closeSettingsModal();
        }
    });
    
    // Handle language selection
    const languageSelect = document.getElementById('languageSelect');
    const savedLanguage = localStorage.getItem(StorageKeys.LANGUAGE) || 'en';
    languageSelect.value = savedLanguage;
    
    languageSelect.addEventListener('change', function(e) {
        if (e.target.value === 'zh') {
            // Prevent selection and show alert
            alert('This language has not yet been deployed.');
            e.target.value = savedLanguage;
        } else {
            localStorage.setItem(StorageKeys.LANGUAGE, e.target.value);
        }
    });
    
    // Show tooltip on hover for disabled option
    languageSelect.addEventListener('mouseover', function(e) {
        const selectedOption = languageSelect.options[languageSelect.selectedIndex];
        if (selectedOption && selectedOption.disabled) {
            showTooltip('This language has not yet been deployed.');
        }
    });
}

function openSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// ==================== PROFILE MODAL ====================
function initializeProfileModal() {
    const profileBtn = document.getElementById('profileBtn');
    if (!profileBtn) return;
    
    // Get username from localStorage or use default
    let username = 'User';
    const userCredentials = localStorage.getItem('userCredentials');
    if (userCredentials) {
        try {
            const credentials = JSON.parse(userCredentials);
            username = credentials.username;
        } catch (error) {
            console.error('Error parsing user credentials:', error);
        }
    }
    
    // Create profile modal HTML
    const profileModal = document.createElement('div');
    profileModal.id = 'profileModal';
    profileModal.className = 'overlay-modal';
    profileModal.innerHTML = `
        <div class="modal-box">
            <div class="modal-box-header">
                <h2 class="modal-box-title">👤 Profile</h2>
                <button class="modal-box-close" id="closeProfile">✖</button>
            </div>
            <div class="modal-box-content">
                <div class="profile-avatar">👤</div>
                <div class="profile-info">
                    <div class="profile-field">
                        <span class="profile-field-label">Username</span>
                        <div class="profile-field-value" id="profileUsername">${username}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(profileModal);
    
    // Setup event listeners
    profileBtn.addEventListener('click', openProfileModal);
    document.getElementById('closeProfile').addEventListener('click', closeProfileModal);
    profileModal.addEventListener('click', function(e) {
        if (e.target === profileModal) {
            closeProfileModal();
        }
    });
}

function openProfileModal() {
    const modal = document.getElementById('profileModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeProfileModal() {
    const modal = document.getElementById('profileModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// ==================== MAIN APP ====================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme first
    initializeTheme();
    
    // Initialize settings and profile modals
    initializeSettingsModal();
    initializeProfileModal();
    
    // Check authentication
    if (!checkAuth()) return;
    
    // Setup universal logout
    setupLogout();
    
    // Initialize dashboard if on dashboard page
    if (isDashboardPage()) {
        initializeDashboard();
    }
});

function checkAuth() {
    const isLoggedIn = sessionStorage.getItem(StorageKeys.IS_LOGGED_IN);
    if (isLoggedIn !== 'true') {
        window.location.replace('login.html');
        return false;
    }
    return true;
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            sessionStorage.removeItem(StorageKeys.IS_LOGGED_IN);
            window.location.replace('login.html');
        });
    }
}

function isDashboardPage() {
    return document.getElementById('weeklyTrendChart') !== null;
}

function initializeDashboard() {
    updateFinancialSummary();
    updateLatestSpending();
    updateWeeklyTrendChart();
    updateGoalsOverview();
    setupCurrencyExchange();
    
    // Add theme toggle listener for balance color updates
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            setTimeout(() => {
                if (window.currentBalanceValue !== undefined) {
                    updateBalanceColor('dashNetBalance', window.currentBalanceValue);
                }
            }, 50);
        });
    }
    
    // Refresh dashboard every minute
    setInterval(updateFinancialSummary, 60000);
}

// ==================== FINANCIAL SUMMARY ====================
function updateFinancialSummary() {
    const transactions = Utils.safeGetFromStorage(StorageKeys.TRANSACTIONS);
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const { current, last } = calculateMonthlyTotals(transactions, currentMonth, currentYear);
    
    // Calculate total balance across all transactions
    const totalBalance = calculateNetBalance(transactions);
    
    // Calculate total balance as of last month (for comparison)
    const lastMonthEnd = new Date(currentYear, currentMonth, 0); // Last day of previous month
    const transactionsUntilLastMonth = transactions.filter(t => {
        const transactionDate = new Date(t.date + 'T00:00:00');
        return transactionDate <= lastMonthEnd;
    });
    const lastMonthTotalBalance = calculateNetBalance(transactionsUntilLastMonth);
    
    // Store total balance for theme toggle updates
    window.currentBalanceValue = totalBalance;
    
    // Update UI
    document.getElementById('dashNetBalance').textContent = Utils.formatCurrency(totalBalance);
    updateBalanceColor('dashNetBalance', totalBalance);
    
    updateSummaryCard('dashMonthlyIncome', current.income);
    updateSummaryCard('dashMonthlySpending', current.expense);
    
    // Update comparisons
    updateComparison('balanceComparison', totalBalance, lastMonthTotalBalance);
    updateComparison('incomeComparison', current.income, last.income);
    updateComparison('spendingComparison', current.expense, last.expense);
}

function calculateMonthlyTotals(transactions, currentMonth, currentYear) {
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const current = { income: 0, expense: 0, balance: 0 };
    const last = { income: 0, expense: 0, balance: 0 };
    
    transactions.forEach(t => {
        const date = new Date(t.date + 'T00:00:00');
        const month = date.getMonth();
        const year = date.getFullYear();
        const amount = t.amount;
        
        if (month === currentMonth && year === currentYear) {
            if (t.type === 'income') {
                current.income += amount;
            } else {
                current.expense += amount;
            }
        } else if (month === lastMonth && year === lastMonthYear) {
            if (t.type === 'income') {
                last.income += amount;
            } else {
                last.expense += amount;
            }
        }
    });
    
    current.balance = current.income - current.expense;
    last.balance = last.income - last.expense;
    
    return { current, last };
}

function updateSummaryCard(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = Utils.formatCurrency(value);
    }
}

function updateBalanceColor(elementId, balance) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Remove existing color classes
    element.style.color = '';
    
    // Determine color based on balance (positive = green, negative = red)
    const isDarkMode = document.documentElement.classList.contains('dark-mode');
    
    if (balance > 0) {
        element.style.color = isDarkMode ? '#4ade80' : '#28a745'; // success-color
    } else if (balance < 0) {
        element.style.color = isDarkMode ? '#f87171' : '#dc3545'; // error-color
    } else {
        element.style.color = ''; // Use default text color
    }
}

function updateComparison(elementId, current, previous) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    if (previous === 0) {
        element.textContent = current > 0 ? 'New this month' : 'No previous data';
        return;
    }
    
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? '+' : '';
    element.textContent = `${sign}${change.toFixed(1)}% compare to last month`;
}

// ==================== LATEST SPENDING ====================
function updateLatestSpending() {
    const transactions = Utils.safeGetFromStorage(StorageKeys.TRANSACTIONS);
    const listContainer = document.getElementById('latestSpendingList');
    const totalElement = document.getElementById('spendingTotal');
    
    if (!listContainer || !totalElement) return;
    
    const expenses = transactions
        .filter(t => t.type === 'expense')
        .sort((a, b) => new Date(b.date + 'T00:00:00') - new Date(a.date + 'T00:00:00'))
        .slice(0, 5);
    
    if (expenses.length === 0) {
        listContainer.innerHTML = '<p class="empty-state">No recent spending</p>';
        totalElement.textContent = '$0.00';
        return;
    }
    
    listContainer.innerHTML = '';
    let total = 0;
    
    expenses.forEach(expense => {
        total += expense.amount;
        const item = document.createElement('div');
        item.className = 'spending-item';
        item.innerHTML = `
            <div class="spending-item-left">
                <span class="spending-item-category">${Utils.getCategoryText(expense.category)}</span>
                <span class="spending-item-date">${Utils.formatDate(expense.date)}</span>
            </div>
            <span class="spending-item-amount">${Utils.formatCurrency(expense.amount)}</span>
        `;
        listContainer.appendChild(item);
    });
    
    totalElement.textContent = Utils.formatCurrency(total);
}

// ==================== WEEKLY TREND CHART ====================
function updateWeeklyTrendChart() {
    const transactions = Utils.safeGetFromStorage(StorageKeys.TRANSACTIONS);
    const canvas = document.getElementById('weeklyTrendChart');
    
    if (!canvas) return;
    
    const { labels, incomeData, expenseData } = prepareWeeklyData(transactions);
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.weeklyChart) {
        window.weeklyChart.destroy();
    }
    
    // Get color based on theme
    const isDarkMode = document.documentElement.classList.contains('dark-mode');
    const textColor = isDarkMode ? '#e0e0e0' : '#333';
    const gridColor = isDarkMode ? '#3a3a4a' : '#E0E0E0';
    
    window.weeklyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    borderColor: isDarkMode ? '#4ade80' : '#28a745',
                    backgroundColor: isDarkMode ? 'rgba(74, 222, 128, 0.1)' : 'rgba(40, 167, 69, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Expense',
                    data: expenseData,
                    borderColor: isDarkMode ? '#f87171' : '#dc3545',
                    backgroundColor: isDarkMode ? 'rgba(248, 113, 113, 0.1)' : 'rgba(220, 53, 69, 0.1)',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { 
                        padding: 15, 
                        font: { size: 12 },
                        color: textColor
                    }
                },
                tooltip: {
                    callbacks: {
                        label: context => `${context.dataset.label}: ${Utils.formatCurrency(context.parsed.y)}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => Utils.formatCurrency(value),
                        color: textColor
                    },
                    grid: {
                        color: gridColor
                    }
                },
                x: {
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: gridColor
                    }
                }
            }
        }
    });
}

function prepareWeeklyData(transactions) {
    const today = new Date();
    const labels = [];
    const incomeData = [];
    const expenseData = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        
        labels.push(Utils.formatDate(dateStr));
        
        const dayTransactions = transactions.filter(t => t.date === dateStr);
        const dayIncome = dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const dayExpense = dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        
        incomeData.push(dayIncome);
        expenseData.push(dayExpense);
    }
    
    return { labels, incomeData, expenseData };
}

// ==================== GOALS OVERVIEW ====================
function updateGoalsOverview() {
    const goals = Utils.safeGetFromStorage(StorageKeys.GOALS);
    const transactions = Utils.safeGetFromStorage(StorageKeys.TRANSACTIONS);
    const goalsContainer = document.getElementById('goalsOverview');
    
    if (!goalsContainer) return;
    
    const currentBalance = calculateNetBalance(transactions);
    const activeGoals = goals.filter(g => !g.achieved && g.pinned);
    
    if (activeGoals.length === 0) {
        goalsContainer.innerHTML = '<p class="empty-state">No active goals</p>';
        return;
    }
    
    const topGoals = activeGoals.slice(0, 3);
    goalsContainer.innerHTML = '';
    
    topGoals.forEach(goal => {
        const percentage = Math.min((currentBalance / goal.target) * 100, 100);
        const goalItem = document.createElement('div');
        goalItem.className = 'goal-item';
        
        // Format the date if it exists - using 'deadline' field from goal object
        const dateText = goal.deadline ? `Target: ${Utils.formatFullDate(goal.deadline)}` : '';
        
        goalItem.innerHTML = `
            <div class="goal-item-header">
                <div class="goal-item-title-wrapper">
                    <span class="goal-item-name">${goal.name}</span>
                    ${dateText ? `<span class="goal-item-date">${dateText}</span>` : ''}
                </div>
                <span class="goal-item-percentage">${percentage.toFixed(1)}%</span>
            </div>
            <div class="goal-progress-bar">
                <div class="goal-progress-fill" style="width: ${percentage > 0 ? percentage : 0}%"></div>
            </div>
        `;
        goalsContainer.appendChild(goalItem);
    });
}

function calculateNetBalance(transactions) {
    return transactions.reduce((balance, t) => {
        return balance + (t.type === 'income' ? t.amount : -t.amount);
    }, 0);
}

// ==================== CURRENCY EXCHANGE ====================
let exchangeRates = {};
let lastUpdateTime = null;

async function fetchExchangeRates(baseCurrency = 'HKD') {
    const statusElement = document.getElementById('exchangeStatus');
    if (!statusElement) return false;
    
    try {
        statusElement.textContent = 'Updating rates...';
        statusElement.className = 'exchange-status loading';
        
        const response = await fetch(`https://api.frankfurter.dev/v1/latest?base=${baseCurrency}`);
        if (!response.ok) throw new Error('Failed to fetch rates');
        
        const data = await response.json();
        exchangeRates = data.rates;
        exchangeRates[baseCurrency] = 1;
        lastUpdateTime = new Date();
        
        statusElement.textContent = `Updated: ${lastUpdateTime.toLocaleTimeString()}`;
        statusElement.className = 'exchange-status';
        return true;
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        statusElement.textContent = 'Failed to update rates';
        statusElement.className = 'exchange-status error';
        
        // Fallback rates
        if (Object.keys(exchangeRates).length === 0) {
            exchangeRates = {
                'HKD': 1,
                'USD': 0.128,
                'JPY': 19.5,
                'GBP': 0.10,
                'EUR': 0.12
            };
        }
        return false;
    }
}

function convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;
    
    if (exchangeRates[toCurrency] && exchangeRates[fromCurrency]) {
        const inHKD = amount / exchangeRates[fromCurrency];
        return inHKD * exchangeRates[toCurrency];
    }
    
    return amount;
}

function setupCurrencyExchange() {
    const topAmountInput = document.getElementById('amountTop');
    const bottomAmountInput = document.getElementById('amountBottom');
    const topCurrencySelect = document.getElementById('currencyTop');
    const bottomCurrencySelect = document.getElementById('currencyBottom');
    const swapButton = document.getElementById('swapCurrencies');
    const rateDisplay = document.getElementById('exchangeRate');
    
    if (!topAmountInput || !bottomAmountInput) return;
    
    fetchExchangeRates('HKD').then(updateExchangeRate);
    
    function updateExchangeRate() {
        const rate = convertCurrency(1, topCurrencySelect.value, bottomCurrencySelect.value);
        rateDisplay.textContent = `1 ${topCurrencySelect.value} = ${rate.toFixed(4)} ${bottomCurrencySelect.value}`;
    }
    
    topAmountInput.addEventListener('input', function() {
        const amount = parseFloat(this.value) || 0;
        const converted = convertCurrency(amount, topCurrencySelect.value, bottomCurrencySelect.value);
        bottomAmountInput.value = converted.toFixed(2);
    });
    
    bottomAmountInput.addEventListener('input', function() {
        const amount = parseFloat(this.value) || 0;
        const converted = convertCurrency(amount, bottomCurrencySelect.value, topCurrencySelect.value);
        topAmountInput.value = converted.toFixed(2);
    });
    
    topCurrencySelect.addEventListener('change', function() {
        fetchExchangeRates(this.value).then(() => {
            updateExchangeRate();
            const amount = parseFloat(topAmountInput.value) || 0;
            const converted = convertCurrency(amount, this.value, bottomCurrencySelect.value);
            bottomAmountInput.value = converted.toFixed(2);
        });
    });
    
    bottomCurrencySelect.addEventListener('change', function() {
        updateExchangeRate();
        const amount = parseFloat(topAmountInput.value) || 0;
        const converted = convertCurrency(amount, topCurrencySelect.value, this.value);
        bottomAmountInput.value = converted.toFixed(2);
    });
    
    swapButton.addEventListener('click', function() {
        // Swap currencies
        const tempCurrency = topCurrencySelect.value;
        topCurrencySelect.value = bottomCurrencySelect.value;
        bottomCurrencySelect.value = tempCurrency;
        
        // Swap amounts
        const tempAmount = topAmountInput.value;
        topAmountInput.value = bottomAmountInput.value;
        bottomAmountInput.value = tempAmount;
        
        fetchExchangeRates(topCurrencySelect.value).then(updateExchangeRate);
    });
    
    // Refresh rates every 10 minutes
    setInterval(() => {
        fetchExchangeRates(topCurrencySelect.value).then(() => {
            const amount = parseFloat(topAmountInput.value) || 0;
            const converted = convertCurrency(amount, topCurrencySelect.value, bottomCurrencySelect.value);
            bottomAmountInput.value = converted.toFixed(2);
            updateExchangeRate();
        });
    }, 600000);
}
