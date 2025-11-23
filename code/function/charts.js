// Import utilities from main.js (assumes main.js is loaded first)
/* global Utils, StorageKeys, CategoryIcons, CategoryLabels, Chart */

document.addEventListener('DOMContentLoaded', function() {
    let expenseChartInstance = null;
    let expense30ChartInstance = null;
    let trendChartInstance = null;
    let currentTotals = null;

    loadAnalytics();

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            // Wait a moment for the theme class to be toggled
            setTimeout(() => {
                if (currentTotals) {
                    updateSummaryCards(currentTotals);
                }
            }, 50);
        });
    }

    function loadAnalytics() {
        const transactions = Utils.safeGetFromStorage(StorageKeys.TRANSACTIONS);
        
        if (transactions.length === 0) return;

        const totals = calculateTotals(transactions);
        currentTotals = totals;
        
        // Get last 30 days transactions
        const last30DaysTransactions = getLast30DaysTransactions(transactions);
        const totals30 = calculateTotals(last30DaysTransactions);
        
        updateSummaryCards(totals);
        updateMonthlySummaryCards(totals30);
        createExpenseChart(transactions);
        createExpense30Chart(last30DaysTransactions);
        createTrendChart(transactions);
        displayCategoryBreakdown(transactions);
        displayCategory30Breakdown(last30DaysTransactions);
    }

    function getLast30DaysTransactions(transactions) {
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 29); // Today + past 29 days = 30 days total
        
        return transactions.filter(t => {
            const transactionDate = parseDate(t.date);
            return transactionDate >= thirtyDaysAgo && transactionDate <= today;
        });
    }

    function parseDate(dateString) {
        // Assuming date format is YYYY-MM-DD
        const parts = dateString.split('-');
        return new Date(parts[0], parts[1] - 1, parts[2]);
    }

    function calculateTotals(transactions) {
        return transactions.reduce((acc, t) => {
            if (t.type === 'income') {
                acc.income += t.amount;
            } else {
                acc.expense += t.amount;
            }
            return acc;
        }, { income: 0, expense: 0, balance: 0 });
    }

    function updateSummaryCards(totals) {
        totals.balance = totals.income - totals.expense;

        document.getElementById('totalIncome').textContent = Utils.formatCurrency(totals.income);
        document.getElementById('totalExpense').textContent = Utils.formatCurrency(totals.expense);
        document.getElementById('netBalance').textContent = Utils.formatCurrency(totals.balance);
        
        const balanceCard = document.querySelector('.balance-card .card-value');
        if (balanceCard) {
            const isDarkMode = document.documentElement.classList.contains('dark-mode');
            
            if (isDarkMode) {
                // Dark mode colors
                balanceCard.style.color = totals.balance >= 0 ? '#d5b5f0e2' : '#e39ea5ff';
            } else {
                // Light mode colors
                balanceCard.style.color = totals.balance >= 0 ? '#8c00ffe2' : '#dc3545';
            }
        }
    }

    function updateMonthlySummaryCards(totals30) {
        document.getElementById('monthly30Income').textContent = Utils.formatCurrency(totals30.income);
        document.getElementById('monthly30Expense').textContent = Utils.formatCurrency(totals30.expense);
    }

    function createExpenseChart(transactions) {
        const expenses = transactions.filter(t => t.type === 'expense');
        const categoryTotals = {};

        expenses.forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });

        const categories = Object.keys(categoryTotals);
        const amounts = Object.values(categoryTotals);
        const categoryNames = categories.map(cat => Utils.getCategoryText(cat));

        const ctx = document.getElementById('expenseChart')?.getContext('2d');
        if (!ctx) return;

        if (expenseChartInstance) {
            expenseChartInstance.destroy();
        }

        expenseChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categoryNames,
                datasets: [{
                    data: amounts,
                    backgroundColor: [
                        '#06ce7eff',
                        '#512889',
                        '#E75481',
                        '#9C51B7',
                        '#006A4E',
                        '#783EA9',
                        '#009257'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: context => `${context.label}: ${Utils.formatCurrency(context.parsed)}`
                        }
                    }
                }
            }
        });
    }

    function createExpense30Chart(transactions) {
        const expenses = transactions.filter(t => t.type === 'expense');
        const categoryTotals = {};

        expenses.forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });

        const categories = Object.keys(categoryTotals);
        const amounts = Object.values(categoryTotals);
        const categoryNames = categories.map(cat => Utils.getCategoryText(cat));

        const ctx = document.getElementById('expense30Chart')?.getContext('2d');
        if (!ctx) return;

        if (expense30ChartInstance) {
            expense30ChartInstance.destroy();
        }

        expense30ChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categoryNames,
                datasets: [{
                    data: amounts,
                    backgroundColor: [
                        '#06ce7eff',
                        '#512889',
                        '#E75481',
                        '#9C51B7',
                        '#006A4E',
                        '#783EA9',
                        '#009257'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: context => `${context.label}: ${Utils.formatCurrency(context.parsed)}`
                        }
                    }
                }
            }
        });
    }

    function createTrendChart(transactions) {
        const dateTotals = {};
        
        transactions.forEach(t => {
            if (!dateTotals[t.date]) {
                dateTotals[t.date] = { income: 0, expense: 0 };
            }
            if (t.type === 'income') {
                dateTotals[t.date].income += t.amount;
            } else {
                dateTotals[t.date].expense += t.amount;
            }
        });

        const sortedDates = Object.keys(dateTotals).sort();
        const incomeData = sortedDates.map(date => dateTotals[date].income);
        const expenseData = sortedDates.map(date => dateTotals[date].expense);
        const labels = sortedDates.map(date => Utils.formatDate(date));

        const ctx = document.getElementById('trendChart')?.getContext('2d');
        if (!ctx) return;

        if (trendChartInstance) {
            trendChartInstance.destroy();
        }

        trendChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Income',
                        data: incomeData,
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Expenses',
                        data: expenseData,
                        borderColor: '#dc3545',
                        backgroundColor: 'rgba(220, 53, 69, 0.1)',
                        tension: 0.4,
                        fill: true
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
                            font: { size: 12 }
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
                            callback: value => Utils.formatCurrency(value)
                        }
                    }
                }
            }
        });
    }

    function displayCategoryBreakdown(transactions) {
        const expenses = transactions.filter(t => t.type === 'expense');
        const categoryTotals = {};

        expenses.forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });

        const totalExpense = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
        const categoryList = document.getElementById('categoryList');
        
        if (!categoryList) return;

        if (Object.keys(categoryTotals).length === 0) {
            categoryList.innerHTML = '<p class="empty-state">No data available. Add some transactions to see analytics!</p>';
            return;
        }

        categoryList.innerHTML = '';

        // Sort by amount (highest first)
        const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

        sortedCategories.forEach(([category, amount]) => {
            const percentage = (amount / totalExpense * 100).toFixed(1);
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category-item';
            
            categoryDiv.innerHTML = `
                <div class="category-info">
                    <div class="category-name">${Utils.getCategoryText(category)}</div>
                </div>
                <div class="category-bar">
                    <div class="category-bar-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="category-amount">${Utils.formatCurrency(amount)}</div>
            `;
            
            categoryList.appendChild(categoryDiv);
        });
    }

    function displayCategory30Breakdown(transactions) {
        const expenses = transactions.filter(t => t.type === 'expense');
        const categoryTotals = {};

        expenses.forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });

        const totalExpense = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
        const categoryList = document.getElementById('category30List');
        
        if (!categoryList) return;

        if (Object.keys(categoryTotals).length === 0) {
            categoryList.innerHTML = '<p class="empty-state">No data available. Add some transactions to see analytics!</p>';
            return;
        }

        categoryList.innerHTML = '';

        // Sort by amount (highest first)
        const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

        sortedCategories.forEach(([category, amount]) => {
            const percentage = totalExpense > 0 ? (amount / totalExpense * 100).toFixed(1) : 0;
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category-item';
            
            categoryDiv.innerHTML = `
                <div class="category-info">
                    <div class="category-name">${Utils.getCategoryText(category)}</div>
                </div>
                <div class="category-bar">
                    <div class="category-bar-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="category-amount">${Utils.formatCurrency(amount)}</div>
            `;
            
            categoryList.appendChild(categoryDiv);
        });
    }
});