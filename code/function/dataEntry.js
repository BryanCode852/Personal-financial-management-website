document.addEventListener('DOMContentLoaded', function() {
    // ==================== STATE ====================
    const state = {
        currentDate: new Date(),
        selectedDate: null,
        currentView: 'calendar',
        currentType: 'expense',
        editMode: false,
        editingTransactionId: null,
        validationState: {
            amount: false,
            category: false,
            date: false
        }
    };

    // ==================== ELEMENTS ====================
    const elements = {
        // Views
        calendarView: document.getElementById('calendarView'),
        yearView: document.getElementById('yearView'),
        monthView: document.getElementById('monthView'),
        dataEntryView: document.getElementById('dataEntryView'),
        
        // Calendar
        yearBtn: document.getElementById('yearBtn'),
        monthBtn: document.getElementById('monthBtn'),
        prevMonth: document.getElementById('prevMonth'),
        nextMonth: document.getElementById('nextMonth'),
        calendarGrid: document.getElementById('calendarGrid'),
        
        // Modals
        dayRecordsModal: document.getElementById('dayRecordsModal'),
        closeModal: document.getElementById('closeModal'),
        dayRecordsList: document.getElementById('dayRecordsList'),
        addNewTransactionBtn: document.getElementById('addNewTransactionBtn'),
        
        // Form
        backToCalendar: document.getElementById('backToCalendar'),
        typeButtons: document.querySelectorAll('.type-btn'),
        amountInput: document.getElementById('amount'),
        categorySelect: document.getElementById('category'),
        dateInput: document.getElementById('date'),
        descriptionInput: document.getElementById('description'),
        addTransactionBtn: document.getElementById('addTransactionBtn'),
        transactionsList: document.getElementById('transactionsList')
    };

    // ==================== INITIALIZATION ====================
    init();

    function init() {
        renderCalendar();
        setupEventListeners();
        generateYearGrid();
        generateMonthGrid();
        setupCsvImport();
        displayTransactions();
    }

    // ==================== EVENT LISTENERS ====================
    function setupEventListeners() {
        // Navigation
        elements.yearBtn.addEventListener('click', () => showView('year'));
        elements.monthBtn.addEventListener('click', () => showView('month'));
        elements.prevMonth.addEventListener('click', () => navigateMonth(-1));
        elements.nextMonth.addEventListener('click', () => navigateMonth(1));
        document.getElementById('monthViewYearBtn').addEventListener('click', () => showView('year'));
        
        // Modal
        elements.closeModal.addEventListener('click', () => hideModal(elements.dayRecordsModal));
        elements.dayRecordsModal.addEventListener('click', (e) => {
            if (e.target === elements.dayRecordsModal) hideModal(elements.dayRecordsModal);
        });
        elements.addNewTransactionBtn.addEventListener('click', () => {
            hideModal(elements.dayRecordsModal);
            // Auto-fill date with selected calendar day
            if (state.selectedDate) {
                const { year, month, day } = state.selectedDate;
                const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                elements.dateInput.value = formattedDate;
            }
            showView('dataEntry');
        });
        
        // Data Entry
        elements.backToCalendar.addEventListener('click', () => {
            showView('calendar');
            resetForm();
        });
        
        // Type toggle
        elements.typeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                state.currentType = this.dataset.type;
                elements.typeButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                toggleCategoryOptions();
            });
        });
        
        // Form validation
        elements.amountInput.addEventListener('input', () => validateAmount());
        elements.categorySelect.addEventListener('change', () => validateCategory());
        elements.dateInput.addEventListener('change', () => validateDate());
        
        // Form submission
        elements.addTransactionBtn.addEventListener('click', addTransaction);
    }

    // ==================== VIEW MANAGEMENT ====================
    function showView(viewName) {
        const views = {
            'calendar': elements.calendarView,
            'year': elements.yearView,
            'month': elements.monthView,
            'dataEntry': elements.dataEntryView
        };
        
        Object.values(views).forEach(view => view?.classList.remove('active'));
        views[viewName]?.classList.add('active');
        state.currentView = viewName;
    }

    // ==================== CALENDAR ====================
    function renderCalendar() {
        const year = state.currentDate.getFullYear();
        const month = state.currentDate.getMonth();
        
        elements.yearBtn.textContent = year;
        elements.monthBtn.textContent = getMonthName(month);
        
        elements.calendarGrid.innerHTML = '';
        
        // Day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.className = 'calendar-day-header';
            header.textContent = day;
            elements.calendarGrid.appendChild(header);
        });
        
        // Calculate calendar grid
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        
        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const prevMonth = month === 0 ? 11 : month - 1;
            const prevYear = month === 0 ? year - 1 : year;
            createDayCell(day, prevMonth, prevYear, true);
        }
        
        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            createDayCell(day, month, year, false);
        }
        
        // Next month days (fill to 42 cells)
        const currentCellCount = elements.calendarGrid.children.length - 7;
        const remainingCells = 42 - currentCellCount;
        
        if (remainingCells > 0) {
            for (let day = 1; day <= remainingCells; day++) {
                const nextMonth = month === 11 ? 0 : month + 1;
                const nextYear = month === 11 ? year + 1 : year;
                createDayCell(day, nextMonth, nextYear, true);
            }
        }
    }

    function createDayCell(day, month, year, isOtherMonth) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day';
        if (isOtherMonth) cell.classList.add('other-month');
        
        // Highlight today
        const today = new Date();
        if (day === today.getDate() && 
            month === today.getMonth() && 
            year === today.getFullYear() && 
            !isOtherMonth) {
            cell.classList.add('today');
        }
        
        // Top bar with day type
        const topBar = document.createElement('div');
        topBar.className = 'calendar-day-top';
        
        if (!isOtherMonth) {
            const dayOfWeek = new Date(year, month, day).getDay();
            topBar.classList.add(dayOfWeek === 0 ? 'sunday' : dayOfWeek === 6 ? 'saturday' : 'weekday');
        } else {
            topBar.classList.add('other-month');
        }
        
        // Day number
        const dayNumber = document.createElement('div');
        dayNumber.className = 'calendar-day-number';
        dayNumber.textContent = day;
        
        cell.appendChild(topBar);
        cell.appendChild(dayNumber);
        
        // Add transaction summary - NOW ALSO FOR OTHER MONTH DAYS
        const transactions = getTransactionsForDate(year, month, day);
        if (transactions.length > 0) {
            const summary = calculateDaySummary(transactions);
            const summaryDiv = document.createElement('div');
            summaryDiv.style.padding = '5px';
            summaryDiv.style.fontSize = '11px';
            
            if (summary.expense > 0) {
                const expenseDiv = document.createElement('div');
                expenseDiv.textContent = `- $${summary.expense.toFixed(2)}`;
                expenseDiv.style.color = '#dc3545';
                expenseDiv.style.fontWeight = '600';
                summaryDiv.appendChild(expenseDiv);
            }
            
            if (summary.income > 0) {
                const incomeDiv = document.createElement('div');
                incomeDiv.textContent = `+ $${summary.income.toFixed(2)}`;
                incomeDiv.style.color = '#28a745';
                incomeDiv.style.fontWeight = '600';
                summaryDiv.appendChild(incomeDiv);
            }
            
            cell.appendChild(summaryDiv);
        }
        
        // Click handler - NOW WORKS FOR ALL DAYS INCLUDING OTHER MONTH
        cell.addEventListener('click', () => {
            showDayRecords(day, month, year);
        });
        
        elements.calendarGrid.appendChild(cell);
    }

    function getTransactionsForDate(year, month, day) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const transactions = Utils.safeGetFromStorage(StorageKeys.TRANSACTIONS);
        return transactions.filter(t => t.date === dateStr);
    }

    function calculateDaySummary(transactions) {
        return transactions.reduce((acc, t) => {
            if (t.type === 'expense') {
                acc.expense += t.amount;
            } else {
                acc.income += t.amount;
            }
            return acc;
        }, { expense: 0, income: 0 });
    }

    function showDayRecords(day, month, year) {
        state.selectedDate = { day, month, year };
        const dateStr = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
        document.getElementById('modalDate').textContent = dateStr;
        
        const transactions = getTransactionsForDate(year, month, day);
        
        if (transactions.length === 0) {
            elements.dayRecordsList.innerHTML = '<p class="empty-records">No transactions for this day</p>';
        } else {
            elements.dayRecordsList.innerHTML = '';
            transactions.forEach(transaction => {
                const recordItem = createDayRecordItem(transaction);
                elements.dayRecordsList.appendChild(recordItem);
            });
        }
        
        showModal(elements.dayRecordsModal);
    }

    function createDayRecordItem(transaction) {
        const item = document.createElement('div');
        item.className = 'day-record-item';
        
        const recordInfo = document.createElement('div');
        recordInfo.className = 'record-info';
        
        const category = document.createElement('div');
        category.className = 'record-category';
        category.textContent = Utils.getCategoryText(transaction.category);
        
        const amount = document.createElement('div');
        amount.className = `record-amount ${transaction.type}`;
        amount.textContent = `${transaction.type === 'expense' ? '-' : '+'} ${Utils.formatCurrency(transaction.amount)}`;
        
        recordInfo.appendChild(category);
        recordInfo.appendChild(amount);
        
        if (transaction.description) {
            const description = document.createElement('div');
            description.className = 'record-description';
            description.textContent = transaction.description;
            recordInfo.appendChild(description);
        }
        
        const actions = document.createElement('div');
        actions.className = 'record-actions';
        
        const modifyBtn = document.createElement('button');
        modifyBtn.className = 'record-modify';
        modifyBtn.textContent = 'Edit';
        modifyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            editTransaction(transaction);
        });
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'record-delete';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTransaction(transaction.id);
        });
        
        actions.appendChild(modifyBtn);
        actions.appendChild(deleteBtn);
        
        item.appendChild(recordInfo);
        item.appendChild(actions);
        
        return item;
    }

    function navigateMonth(direction) {
        state.currentDate.setMonth(state.currentDate.getMonth() + direction);
        renderCalendar();
    }

    function getMonthName(month) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return months[month];
    }

    // ==================== YEAR/MONTH SELECTION ====================
    function generateYearGrid() {
        const yearGrid = document.getElementById('yearGrid');
        const currentYear = new Date().getFullYear();
        yearGrid.innerHTML = '';
        
        for (let year = currentYear - 5; year <= currentYear + 6; year++) {
            const yearItem = document.createElement('div');
            yearItem.className = 'year-item';
            yearItem.textContent = year;
            yearItem.addEventListener('click', () => {
                state.currentDate.setFullYear(year);
                document.getElementById('monthViewYearBtn').textContent = year;
                showView('month');
            });
            yearGrid.appendChild(yearItem);
        }
    }

    function generateMonthGrid() {
        const monthGrid = document.getElementById('monthGrid');
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
        monthGrid.innerHTML = '';
        
        months.forEach((monthName, index) => {
            const monthItem = document.createElement('div');
            monthItem.className = 'month-item';
            monthItem.textContent = monthName;
            monthItem.addEventListener('click', () => {
                state.currentDate.setMonth(index);
                renderCalendar();
                showView('calendar');
            });
            monthGrid.appendChild(monthItem);
        });
    }

    // ==================== TRANSACTION MANAGEMENT ====================
    function displayTransactions() {
        const transactions = Utils.safeGetFromStorage(StorageKeys.TRANSACTIONS);
        
        if (transactions.length === 0) {
            elements.transactionsList.innerHTML = '<p class="empty-state">No transactions yet. Add your first transaction above!</p>';
            return;
        }
        
        const sortedTransactions = [...transactions].sort((a, b) => {
            const dateCompare = new Date(b.date) - new Date(a.date);
            if (dateCompare !== 0) return dateCompare;
            return b.id - a.id;
        });
        
        elements.transactionsList.innerHTML = '';
        sortedTransactions.slice(0, 10).forEach(transaction => {
            const item = createTransactionItem(transaction);
            elements.transactionsList.appendChild(item);
        });
    }

    function createTransactionItem(transaction) {
        const item = document.createElement('div');
        item.className = 'transaction-item';
        
        const info = document.createElement('div');
        info.className = 'transaction-info';
        
        const header = document.createElement('div');
        header.className = 'transaction-header';
        
        const category = document.createElement('span');
        category.className = 'transaction-category';
        category.textContent = Utils.getCategoryText(transaction.category);
        
        const date = document.createElement('span');
        date.className = 'transaction-date';
        date.textContent = formatTransactionDate(transaction.date);
        
        header.appendChild(category);
        header.appendChild(date);
        
        const amount = document.createElement('div');
        amount.className = `transaction-amount ${transaction.type}`;
        amount.textContent = `${transaction.type === 'expense' ? '-' : '+'} ${Utils.formatCurrency(transaction.amount)}`;
        
        info.appendChild(header);
        
        if (transaction.description) {
            const description = document.createElement('div');
            description.className = 'transaction-description';
            description.textContent = transaction.description;
            info.appendChild(description);
        }
        
        info.appendChild(amount);
        
        const actions = document.createElement('div');
        actions.className = 'transaction-actions';
        
        const modifyBtn = document.createElement('button');
        modifyBtn.className = 'transaction-modify';
        modifyBtn.textContent = 'Edit';
        modifyBtn.addEventListener('click', () => editTransaction(transaction));
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'transaction-delete';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteTransaction(transaction.id));
        
        actions.appendChild(modifyBtn);
        actions.appendChild(deleteBtn);
        
        item.appendChild(info);
        item.appendChild(actions);
        
        return item;
    }

    function editTransaction(transaction) {
        state.editMode = true;
        state.editingTransactionId = transaction.id;
        
        // Set form values
        state.currentType = transaction.type;
        elements.typeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === transaction.type);
        });
        
        toggleCategoryOptions();
        
        elements.amountInput.value = transaction.amount;
        elements.categorySelect.value = transaction.category;
        elements.dateInput.value = transaction.date;
        elements.descriptionInput.value = transaction.description || '';
        
        // Update button text
        elements.addTransactionBtn.textContent = 'Update Transaction';
        
        // Show data entry view
        hideModal(elements.dayRecordsModal);
        showView('dataEntry');
        
        // Scroll to form
        elements.dataEntryView.scrollTop = 0;
    }

    function deleteTransaction(id) {
        showConfirmDialog('Are you sure you want to delete this transaction?', () => {
            const transactions = Utils.safeGetFromStorage(StorageKeys.TRANSACTIONS);
            const updatedTransactions = transactions.filter(t => t.id !== id);
            Utils.safeSaveToStorage(StorageKeys.TRANSACTIONS, updatedTransactions);
            
            displayTransactions();
            renderCalendar();
            hideModal(elements.dayRecordsModal);
        });
    }

    // ==================== VALIDATION ====================
    function validateAmount() {
        const value = parseFloat(elements.amountInput.value);
        const isValid = !isNaN(value) && value > 0;
        
        state.validationState.amount = isValid;
        
        if (elements.amountInput.value) {
            elements.amountInput.classList.toggle('valid', isValid);
            elements.amountInput.classList.toggle('invalid', !isValid);
        } else {
            elements.amountInput.classList.remove('valid', 'invalid');
        }
        
        return isValid;
    }

    function validateCategory() {
        const isValid = !!elements.categorySelect.value;
        state.validationState.category = isValid;
        
        if (elements.categorySelect.value) {
            elements.categorySelect.classList.toggle('valid', isValid);
            elements.categorySelect.classList.toggle('invalid', !isValid);
        } else {
            elements.categorySelect.classList.remove('valid', 'invalid');
        }
        
        return isValid;
    }

    function validateDate() {
        const isValid = !!elements.dateInput.value;
        state.validationState.date = isValid;
        
        if (elements.dateInput.value) {
            elements.dateInput.classList.toggle('valid', isValid);
            elements.dateInput.classList.toggle('invalid', !isValid);
        } else {
            elements.dateInput.classList.remove('valid', 'invalid');
        }
        
        return isValid;
    }

    function addTransaction() {
        const amountValid = validateAmount();
        const categoryValid = validateCategory();
        const dateValid = validateDate();
        
        // If validation fails, trigger shake animation
        if (!amountValid || !categoryValid || !dateValid) {
            if (!amountValid) {
                elements.amountInput.classList.remove('invalid');
                void elements.amountInput.offsetWidth;
                elements.amountInput.classList.add('invalid');
            }
            
            if (!categoryValid) {
                elements.categorySelect.classList.remove('invalid');
                void elements.categorySelect.offsetWidth;
                elements.categorySelect.classList.add('invalid');
            }

            if (!dateValid) {
                elements.dateInput.classList.remove('invalid');
                void elements.dateInput.offsetWidth;
                elements.dateInput.classList.add('invalid');
            }
            return;
        }
        
        // Create transaction object
        const transaction = {
            id: state.editMode ? state.editingTransactionId : Date.now(),
            type: state.currentType,
            amount: parseFloat(elements.amountInput.value),
            category: elements.categorySelect.value,
            date: elements.dateInput.value,
            description: elements.descriptionInput.value.trim()
        };
        
        const transactions = Utils.safeGetFromStorage(StorageKeys.TRANSACTIONS);
        
        let updatedTransactions;
        if (state.editMode) {
            updatedTransactions = transactions.map(t => t.id === transaction.id ? transaction : t);
            state.editMode = false;
            state.editingTransactionId = null;
            elements.addTransactionBtn.textContent = 'Add Transaction';
        } else {
            updatedTransactions = [transaction, ...transactions];
        }
        
        Utils.safeSaveToStorage(StorageKeys.TRANSACTIONS, updatedTransactions);
        
        resetForm();
        displayTransactions();
        renderCalendar();
        
        // Auto-navigate back to calendar view
        showView('calendar');
    }

    function resetForm() {
        elements.amountInput.value = '';
        elements.categorySelect.value = '';
        elements.dateInput.value = '';
        elements.descriptionInput.value = '';
        
        state.editMode = false;
        state.editingTransactionId = null;
        elements.addTransactionBtn.textContent = 'Add Transaction';
        
        elements.amountInput.classList.remove('valid', 'invalid');
        elements.categorySelect.classList.remove('valid', 'invalid');
        elements.dateInput.classList.remove('valid', 'invalid');
    }

    function toggleCategoryOptions() {
        const expenseGroup = document.getElementById('expenseCategories');
        const incomeGroup = document.getElementById('incomeCategories');
        
        if (state.currentType === 'expense') {
            expenseGroup.style.display = '';
            incomeGroup.style.display = 'none';
        } else {
            expenseGroup.style.display = 'none';
            incomeGroup.style.display = '';
        }
        
        elements.categorySelect.value = '';
    }

    // ==================== CSV IMPORT ====================
    function setupCsvImport() {
        const csvImportBtn = document.querySelector('.csv-import-btn');
        const csvModal = document.getElementById('csvImportModal');
        const closeCsvModal = document.getElementById('closeCsvModal');
        const selectCsvBtn = document.getElementById('selectCsvBtn');
        const csvFileInput = document.getElementById('csvFileInput');
        
        csvImportBtn?.addEventListener('click', () => showModal(csvModal));
        closeCsvModal?.addEventListener('click', () => hideModal(csvModal));
        csvModal?.addEventListener('click', (e) => {
            if (e.target === csvModal) hideModal(csvModal);
        });
        
        selectCsvBtn?.addEventListener('click', () => csvFileInput.click());
        
        csvFileInput?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (!file.name.endsWith('.csv')) {
                    showCsvResult('❌ Error', 'Please select a valid CSV file.');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (event) => processCsvContent(event.target.result);
                reader.readAsText(file);
            }
            csvFileInput.value = '';
        });
        
        setupCsvResultModal();
    }

    function setupCsvResultModal() {
        const csvResultModal = document.getElementById('csvResultModal');
        const closeCsvResultModal = document.getElementById('closeCsvResultModal');
        const csvResultOkBtn = document.getElementById('csvResultOkBtn');
        
        closeCsvResultModal?.addEventListener('click', () => hideModal(csvResultModal));
        csvResultOkBtn?.addEventListener('click', () => hideModal(csvResultModal));
        csvResultModal?.addEventListener('click', (e) => {
            if (e.target === csvResultModal) hideModal(csvResultModal);
        });
    }

    function processCsvContent(csvContent) {
        const validCategories = {
            'expense': ['food', 'transport', 'shopping', 'bills', 'entertainment', 'health', 'other'],
            'income': ['salary', 'freelance', 'investment', 'gift', 'other-income']
        };
        
        const lines = csvContent.trim().split('\n');
        const transactions = [];
        const errors = [];
        let categoryCorrected = 0;
        
        lines.forEach((line, index) => {
            if (!line.trim()) return;
            
            const parts = line.split(';');
            if (parts.length < 4) {
                errors.push(`Line ${index + 1}: Invalid format`);
                return;
            }
            
            const [type, amountStr, category, dateStr, description = ''] = parts.map(p => p.trim());
            
            // Validate type
            if (!['expense', 'income'].includes(type.toLowerCase())) {
                errors.push(`Line ${index + 1}: Invalid type "${type}"`);
                return;
            }
            
            // Validate amount
            const amount = parseFloat(amountStr);
            if (isNaN(amount) || amount <= 0) {
                errors.push(`Line ${index + 1}: Invalid amount "${amountStr}"`);
                return;
            }
            
            // Validate and correct category
            let validCategory = category.toLowerCase();
            const typeCategories = validCategories[type.toLowerCase()];
            
            if (!typeCategories.includes(validCategory)) {
                validCategory = type.toLowerCase() === 'expense' ? 'other' : 'other-income';
                categoryCorrected++;
            }
            
            // Validate date
            const dateMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
            if (!dateMatch) {
                errors.push(`Line ${index + 1}: Invalid date format "${dateStr}"`);
                return;
            }
            
            const [, day, month, year] = dateMatch;
            const formattedDate = `${year}-${month}-${day}`;
            
            transactions.push({
                id: Date.now() + index,
                type: type.toLowerCase(),
                amount,
                category: validCategory,
                date: formattedDate,
                description
            });
        });
        
        hideModal(document.getElementById('csvImportModal'));
        
        if (transactions.length > 0) {
            const existing = Utils.safeGetFromStorage(StorageKeys.TRANSACTIONS);
            Utils.safeSaveToStorage(StorageKeys.TRANSACTIONS, [...transactions, ...existing]);
            displayTransactions();
            renderCalendar();
        }
        
        // Show result
        const message = errors.length > 0
            ? `${transactions.length} imported. ${errors.length} errors${categoryCorrected > 0 ? `. ${categoryCorrected} categories corrected.` : ''}`
            : `✅ ${transactions.length} transactions imported successfully!${categoryCorrected > 0 ? ` ${categoryCorrected} categories corrected.` : ''}`;
        
        showCsvResult(errors.length > 0 ? '⚠️ Import Completed' : '✅ Success', message);
    }

    function showCsvResult(title, message) {
        const modal = document.getElementById('csvResultModal');
        document.getElementById('csvResultTitle').textContent = title;
        document.getElementById('csvResultContent').innerHTML = message;
        showModal(modal);
    }

    // ==================== MODAL HELPERS ====================
    function showModal(modal) {
        modal?.classList.add('active');
    }

    function hideModal(modal) {
        modal?.classList.remove('active');
    }

    function showConfirmDialog(message, onConfirm) {
        const modal = document.getElementById('customConfirmModal');
        modal.querySelector('.modal-body p').textContent = message;
        
        const confirmBtn = document.getElementById('confirmDeleteBtn');
        const cancelBtn = document.getElementById('confirmCancelBtn');
        
        const handleConfirm = () => {
            onConfirm();
            hideModal(modal);
            cleanup();
        };
        
        const handleCancel = () => {
            hideModal(modal);
            cleanup();
        };
        
        const cleanup = () => {
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
        };
        
        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', handleCancel);
        
        showModal(modal);
    }

    // ==================== HELPERS ====================
    function formatTransactionDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    }
});