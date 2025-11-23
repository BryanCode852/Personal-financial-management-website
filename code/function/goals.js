/* global Utils, StorageKeys */

document.addEventListener('DOMContentLoaded', function() {
    const elements = {
        addGoalBtn: document.getElementById('addGoalBtn'),
        goalForm: document.getElementById('goalForm'),
        cancelGoalBtn: document.getElementById('cancelGoalBtn'),
        saveGoalBtn: document.getElementById('saveGoalBtn'),
        goalsList: document.getElementById('goalsList'),
        achievedGoalsList: document.getElementById('achievedGoalsList'),
        inputs: {
            name: document.getElementById('goalName'),
            target: document.getElementById('goalTarget'),
            deadline: document.getElementById('goalDeadline'),
            category: document.getElementById('goalCategory')
        }
    };

    let editingGoalId = null;

    init();

    function init() {
        updateCurrentBalance();
        setupFormValidation();
        setupEventListeners();
        displayGoals();
    }

    function setupFormValidation() {
        elements.inputs.name.addEventListener('input', () => validateField(elements.inputs.name, !!elements.inputs.name.value.trim()));
        elements.inputs.target.addEventListener('input', () => {
            const value = parseFloat(elements.inputs.target.value);
            validateField(elements.inputs.target, !isNaN(value) && value > 0);
        });
        elements.inputs.deadline.addEventListener('change', () => validateField(elements.inputs.deadline, !!elements.inputs.deadline.value));
        elements.inputs.category.addEventListener('change', () => validateField(elements.inputs.category, !!elements.inputs.category.value));
    }

    function validateField(element, isValid) {
        if (element.value) {
            element.classList.toggle('valid', isValid);
            element.classList.toggle('invalid', !isValid);
        } else {
            element.classList.remove('valid', 'invalid');
        }
    }

    function setupEventListeners() {
        elements.addGoalBtn.addEventListener('click', showGoalForm);
        elements.cancelGoalBtn.addEventListener('click', hideGoalForm);
        elements.saveGoalBtn.addEventListener('click', saveGoal);
    }

    function showGoalForm() {
        elements.goalForm.style.display = 'block';
        editingGoalId = null;
        clearForm();
    }

    function hideGoalForm() {
        elements.goalForm.style.display = 'none';
        editingGoalId = null;
        clearForm();
    }

    function saveGoal() {
        const goalData = {
            name: elements.inputs.name.value.trim(),
            target: parseFloat(elements.inputs.target.value),
            deadline: elements.inputs.deadline.value,
            category: elements.inputs.category.value
        };

        if (!validateGoalData(goalData)) return;

        const goals = Utils.safeGetFromStorage(StorageKeys.GOALS);
        const existingGoal = editingGoalId ? goals.find(g => g.id === editingGoalId) : null;

        const goal = {
            id: editingGoalId || Date.now(),
            ...goalData,
            createdAt: existingGoal?.createdAt || Date.now(),
            achieved: existingGoal?.achieved || false,
            achievedAt: existingGoal?.achievedAt || null,
            markedInSpending: existingGoal?.markedInSpending || false,
            pinned: existingGoal?.pinned || false
        };

        const updatedGoals = editingGoalId
            ? goals.map(g => g.id === editingGoalId ? goal : g)
            : [...goals, goal];

        Utils.safeSaveToStorage(StorageKeys.GOALS, updatedGoals);
        hideGoalForm();
        displayGoals();
    }

    function validateGoalData(data) {
        let isValid = true;

        if (!data.name) {
            // Force reflow to restart animation
            elements.inputs.name.classList.remove('invalid');
            void elements.inputs.name.offsetWidth; // Trigger reflow
            elements.inputs.name.classList.add('invalid');
            isValid = false;
        }

        if (!data.target || isNaN(data.target) || data.target <= 0) {
            // Force reflow to restart animation
            elements.inputs.target.classList.remove('invalid');
            void elements.inputs.target.offsetWidth; // Trigger reflow
            elements.inputs.target.classList.add('invalid');
            isValid = false;
        }

        if (!data.deadline) {
            // Force reflow to restart animation
            elements.inputs.deadline.classList.remove('invalid');
            void elements.inputs.deadline.offsetWidth; // Trigger reflow
            elements.inputs.deadline.classList.add('invalid');
            isValid = false;
        }

        if (!data.category) {
            // Force reflow to restart animation
            elements.inputs.category.classList.remove('invalid');
            void elements.inputs.category.offsetWidth; // Trigger reflow
            elements.inputs.category.classList.add('invalid');
            isValid = false;
        }

        return isValid;
    }

    function clearForm() {
        Object.values(elements.inputs).forEach(input => {
            input.value = '';
            input.classList.remove('valid', 'invalid');
        });
    }

    // ==================== BALANCE CALCULATION ====================
    function calculateNetBalance() {
        const transactions = Utils.safeGetFromStorage(StorageKeys.TRANSACTIONS);
        return transactions.reduce((balance, t) => {
            return balance + (t.type === 'income' ? t.amount : -t.amount);
        }, 0);
    }

    function updateCurrentBalance() {
        const balance = calculateNetBalance();
        const balanceElement = document.getElementById('currentBalance');
        if (!balanceElement) return;
        
        balanceElement.textContent = Utils.formatCurrency(balance);
        balanceElement.style.color = balance >= 0 ? '#a2ff00ff' : '#ffc0c6ff';
    }

    // ==================== DISPLAY GOALS ====================
    function displayGoals() {
        const goals = Utils.safeGetFromStorage(StorageKeys.GOALS);
        const currentBalance = calculateNetBalance();
        
        const activeGoals = goals.filter(g => !g.achieved);
        const achievedGoals = goals.filter(g => g.achieved);
        
        // Sort goals
        activeGoals.sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            return new Date(a.deadline) - new Date(b.deadline);
        });
        
        achievedGoals.sort((a, b) => new Date(b.achievedAt) - new Date(a.achievedAt));
        
        displayGoalsList(activeGoals, elements.goalsList, currentBalance, false);
        displayGoalsList(achievedGoals, elements.achievedGoalsList, currentBalance, true);
        updateCurrentBalance();
    }

    function displayGoalsList(goals, container, currentBalance, isAchieved) {
        if (goals.length === 0) {
            const message = isAchieved 
                ? 'No achieved goals yet. Complete your goals to see them here!'
                : 'No active goals yet. Click "Add New Goal" to get started!';
            container.innerHTML = `<p class="empty-state">${message}</p>`;
            return;
        }

        container.innerHTML = '';
        goals.forEach(goal => {
            const goalCard = createGoalCard(goal, currentBalance, isAchieved);
            container.appendChild(goalCard);
        });
    }

    function createGoalCard(goal, currentBalance, isAchieved) {
        const { current, percentage, remaining } = calculateGoalProgress(goal, currentBalance, isAchieved);
        const daysInfo = isAchieved 
            ? calculateDaysTaken(goal.createdAt, goal.achievedAt)
            : calculateDaysLeft(goal.deadline);
        
        const goalCard = document.createElement('div');
        goalCard.className = 'goal-card' + (isAchieved ? ' achieved-card' : '');
        
        goalCard.innerHTML = `
            <div class="goal-header">
                <div class="goal-title-section">
                    <div class="goal-category-badge">${getCategoryIcon(goal.category)}</div>
                    <div class="goal-name">${goal.name}</div>
                    <div class="goal-deadline">
                        Target: ${formatDate(goal.deadline)}
                        ${isAchieved ? '<br>Achieved: ' + formatDate(goal.achievedAt) : ''}
                    </div>
                </div>
                <div class="goal-actions">
                    ${createGoalActionButtons(goal, isAchieved)}
                </div>
            </div>
            
            <div class="goal-progress-section">
                <div class="goal-amounts">
                    <div class="current-amount">${Utils.formatCurrency(current)}</div>
                    <div class="target-amount">of ${Utils.formatCurrency(goal.target)}</div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill${isAchieved ? ' achieved-fill' : ''}" style="width: ${percentage}%"></div>
                </div>
                <div class="progress-percentage">${percentage.toFixed(1)}% Complete</div>
            </div>
            
            <div class="goal-stats">
                <div class="goal-stat">
                    <div class="stat-label">${isAchieved ? 'Was Remaining' : 'Remaining'}</div>
                    <div class="stat-value">${Utils.formatCurrency(remaining)}</div>
                </div>
                <div class="goal-stat">
                    <div class="stat-label">${isAchieved ? 'Days Taken' : 'Days Left'}</div>
                    <div class="stat-value">${isAchieved ? Math.max(0, daysInfo) : (daysInfo >= 0 ? daysInfo : 'Overdue')}</div>
                </div>
            </div>
            
            ${isAchieved ? createSpendingButton(goal) : ''}
        `;
        
        return goalCard;
    }

    function createGoalActionButtons(goal, isAchieved) {
        const buttons = [];
        
        if (!isAchieved) {
            buttons.push(`
                <button class="goal-action-btn pin ${goal.pinned ? 'pinned' : ''}" 
                        data-goal-id="${goal.id}" data-action="pin"
                        title="${goal.pinned ? 'Unpin from Dashboard' : 'Pin to Dashboard'}">
                    ${goal.pinned ? '📌' : '📍'}
                </button>
                <button class="goal-action-btn achieve" 
                        data-goal-id="${goal.id}" data-action="achieve"
                        title="Mark as Achieved">
                    ✓
                </button>
            `);
        }
        
        buttons.push(`
            <button class="goal-action-btn edit" 
                    data-goal-id="${goal.id}" data-action="edit"
                    title="Edit Goal">
                ✏️
            </button>
            <button class="goal-action-btn delete" 
                    data-goal-id="${goal.id}" data-action="delete"
                    title="Delete Goal">
                🗑️
            </button>
        `);
        
        return buttons.join('');
    }

    function createSpendingButton(goal) {
        const isMarked = goal.markedInSpending;
        return `
            <div class="goal-spending-action">
                <button class="mark-spending-btn ${isMarked ? 'marked' : ''}" 
                        data-goal-id="${goal.id}" data-action="mark-spending"
                        title="${isMarked ? 'Already marked in spending (click to add again)' : 'Mark this goal as spending'}">
                    ${isMarked ? '✓ Marked in Spending' : '💰 Mark in Spending'}
                </button>
            </div>
        `;
    }

    function calculateGoalProgress(goal, currentBalance, isAchieved) {
        if (isAchieved && goal.frozenProgress !== undefined) {
            return {
                current: goal.frozenCurrent,
                percentage: goal.frozenProgress,
                remaining: goal.frozenRemaining
            };
        }
        
        const current = Math.max(currentBalance, 0);
        const percentage = Math.min((current / goal.target) * 100, 100);
        const remaining = Math.max(goal.target - current, 0);
        
        return { current, percentage, remaining };
    }

    // ==================== GOAL ACTIONS ====================
    document.addEventListener('click', function(e) {
        const button = e.target.closest('button[data-goal-id]');
        if (!button) return;
        
        const goalId = parseInt(button.dataset.goalId);
        const action = button.dataset.action;
        
        const actions = {
            'pin': () => togglePinGoal(goalId),
            'achieve': () => achieveGoal(goalId),
            'edit': () => editGoal(goalId),
            'delete': () => deleteGoal(goalId),
            'mark-spending': () => markGoalInSpending(goalId)
        };
        
        if (actions[action]) {
            actions[action]();
        }
    });

    function togglePinGoal(id) {
        const goals = Utils.safeGetFromStorage(StorageKeys.GOALS);
        const updatedGoals = goals.map(g => 
            g.id === id ? { ...g, pinned: !g.pinned } : g
        );
        Utils.safeSaveToStorage(StorageKeys.GOALS, updatedGoals);
        displayGoals();
    }

    function achieveGoal(id) {
        const currentBalance = calculateNetBalance();
        const goals = Utils.safeGetFromStorage(StorageKeys.GOALS);
        const goal = goals.find(g => g.id === id);
        
        if (!goal) return;
        
        showConfirmModal(
            `Mark "${goal.name}" as achieved?`,
            () => {
                const updatedGoals = goals.map(g => {
                    if (g.id === id) {
                        const current = Math.max(currentBalance, 0);
                        // Use local date instead of UTC date
                        const todayDate = getLocalDateString();
                        return {
                            ...g,
                            achieved: true,
                            achievedAt: todayDate,
                            frozenCurrent: current,
                            frozenProgress: Math.min((current / g.target) * 100, 100),
                            frozenRemaining: Math.max(g.target - current, 0)
                        };
                    }
                    return g;
                });
                Utils.safeSaveToStorage(StorageKeys.GOALS, updatedGoals);
                displayGoals();
            }
        );
    }

    function editGoal(id) {
        const goal = Utils.safeGetFromStorage(StorageKeys.GOALS).find(g => g.id === id);
        if (!goal) return;

        editingGoalId = id;
        elements.inputs.name.value = goal.name;
        elements.inputs.target.value = goal.target;
        elements.inputs.deadline.value = goal.deadline;
        elements.inputs.category.value = goal.category;
        
        elements.goalForm.style.display = 'block';
        elements.goalForm.scrollIntoView({ behavior: 'smooth' });
    }

    function deleteGoal(id) {
        const goal = Utils.safeGetFromStorage(StorageKeys.GOALS).find(g => g.id === id);
        if (!goal) return;

        showConfirmModal(
            `Are you sure you want to delete "${goal.name}"?`,
            () => {
                const goals = Utils.safeGetFromStorage(StorageKeys.GOALS);
                const updatedGoals = goals.filter(g => g.id !== id);
                Utils.safeSaveToStorage(StorageKeys.GOALS, updatedGoals);
                displayGoals();
            }
        );
    }

    function markGoalInSpending(id) {
        const goals = Utils.safeGetFromStorage(StorageKeys.GOALS);
        const goal = goals.find(g => g.id === id);
        if (!goal) return;

        // Create different message based on whether it's already marked
        const message = goal.markedInSpending 
            ? `<strong><em>Caution: You have already added "${goal.name}" to spending.</em></strong><br><br>Choose which date to record this transaction:` 
            : `Mark "${goal.name}" as spending (${Utils.formatCurrency(goal.target)})<br><br>Choose which date to record this transaction:`;

        showDateChoiceModal(
            message,
            goal,
            (selectedDate) => {
                const transactions = Utils.safeGetFromStorage(StorageKeys.TRANSACTIONS);
                
                const newTransaction = {
                    id: Date.now(),
                    type: 'expense',
                    amount: goal.target,
                    category: 'other',
                    date: selectedDate,
                    description: `Goal: ${goal.name}`
                };

                Utils.safeSaveToStorage(StorageKeys.TRANSACTIONS, [newTransaction, ...transactions]);

                const updatedGoals = goals.map(g => 
                    g.id === id ? { ...g, markedInSpending: true } : g
                );
                Utils.safeSaveToStorage(StorageKeys.GOALS, updatedGoals);
                displayGoals();
            }
        );
    }

    // ==================== MODAL ====================
    function showConfirmModal(message, onConfirm) {
        const overlay = document.createElement('div');
        overlay.className = 'custom-modal-overlay';
        
        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.innerHTML = `
            <div class="custom-modal-header">
                <h3>Confirm Action</h3>
            </div>
            <div class="custom-modal-body">
                <p>${message}</p>
            </div>
            <div class="custom-modal-actions">
                <button class="custom-modal-btn cancel-btn-modal">Cancel</button>
                <button class="custom-modal-btn confirm-btn-modal">Confirm</button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        setTimeout(() => overlay.classList.add('show'), 10);
        
        const cancelBtn = modal.querySelector('.cancel-btn-modal');
        const confirmBtn = modal.querySelector('.confirm-btn-modal');
        
        function closeModal() {
            overlay.classList.remove('show');
            setTimeout(() => overlay.remove(), 300);
        }
        
        cancelBtn.addEventListener('click', closeModal);
        confirmBtn.addEventListener('click', () => {
            onConfirm();
            closeModal();
        });
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
    }

    function showDateChoiceModal(message, goal, onDateSelected) {
        const overlay = document.createElement('div');
        overlay.className = 'custom-modal-overlay';
        
        const achievedDate = goal.achievedAt;
        const targetDate = goal.deadline;
        
        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.innerHTML = `
            <div class="custom-modal-header">
                <h3>Mark in Spending</h3>
            </div>
            <div class="custom-modal-body">
                <p>${message}</p>
            </div>
            <div class="custom-modal-actions date-choice-actions">
                <button class="custom-modal-btn cancel-btn-modal">Cancel</button>
                <button class="custom-modal-btn date-choice-btn achieved-date-btn" data-date="${achievedDate}">
                    Achieved Date<br>
                    <span class="date-label">(${formatDate(achievedDate)})</span>
                </button>
                <button class="custom-modal-btn date-choice-btn target-date-btn" data-date="${targetDate}">
                    Target Date<br>
                    <span class="date-label">(${formatDate(targetDate)})</span>
                </button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        setTimeout(() => overlay.classList.add('show'), 10);
        
        const cancelBtn = modal.querySelector('.cancel-btn-modal');
        const achievedBtn = modal.querySelector('.achieved-date-btn');
        const targetBtn = modal.querySelector('.target-date-btn');
        
        function closeModal() {
            overlay.classList.remove('show');
            setTimeout(() => overlay.remove(), 300);
        }
        
        cancelBtn.addEventListener('click', closeModal);
        
        achievedBtn.addEventListener('click', () => {
            onDateSelected(achievedDate);
            closeModal();
        });
        
        targetBtn.addEventListener('click', () => {
            onDateSelected(targetDate);
            closeModal();
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
    }

    // ==================== HELPERS ====================
    function getLocalDateString() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function getCategoryIcon(category) {
        const icons = {
            'savings': '💰',
            'investment': '📈',
            'purchase': '🛍️',
            'debt': '💳',
            'emergency': '🚨',
            'other': '📦'
        };
        return icons[category] || '📦';
    }

    function formatDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    function calculateDaysLeft(deadline) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const targetDate = new Date(deadline + 'T00:00:00');
        const diffTime = targetDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    function calculateDaysTaken(startTimestamp, endDateString) {
        const startDate = new Date(startTimestamp);
        const endDate = new Date(endDateString + 'T00:00:00');
        const diffTime = endDate - startDate;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
});