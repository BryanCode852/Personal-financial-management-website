// Hard-coded verification code
const VERIFICATION_CODE = '1234';

// Validation state
let validationState = {
    username: false,
    email: false,
    verificationCode: false,
    password: false,
    confirmPassword: false
};

// Toggle password visibility
document.getElementById('togglePassword').addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.textContent = type === 'password' ? '👁️' : '🙈';
});

document.getElementById('toggleConfirmPassword').addEventListener('click', function() {
    const passwordInput = document.getElementById('confirmPassword');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.textContent = type === 'password' ? '👁️' : '🙈';
});

// Validation functions
function validateUsername(username) {
    const letterCount = (username.match(/[a-zA-Z]/g) || []).length;
    const numberCount = (username.match(/[0-9]/g) || []).length;
    return letterCount >= 3 && numberCount >= 3;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    const letterCount = (password.match(/[a-zA-Z]/g) || []).length;
    const numberCount = (password.match(/[0-9]/g) || []).length;
    return letterCount >= 4 && numberCount >= 3;
}

function validateConfirmPassword(password, confirmPassword) {
    return password === confirmPassword && password.length > 0;
}

function updateSubmitButton() {
    const submitBtn = document.getElementById('submitBtn');
    const allValid = Object.values(validationState).every(val => val === true);
    submitBtn.disabled = !allValid;
}

function showCodeSentMessage() {
    const existingMessage = document.querySelector('.code-sent-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('small');
    messageDiv.className = 'code-sent-message';
    messageDiv.textContent = `Verification code sent! The code is: ${VERIFICATION_CODE}`;
    
    const verificationGroup = document.querySelector('#verificationCode').closest('.input-group');
    verificationGroup.appendChild(messageDiv);
}

// Function to show success modal
function showSuccessModal(username, password) {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    modalContent.innerHTML = `
        <div class="success-icon">✓</div>
        <h2 class="modal-title">Registration Successful!</h2>
        <p class="modal-message">Your account has been created successfully.</p>
        <button class="modal-btn" id="goToLoginBtn">Go to Login</button>
    `;
    
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    // Trigger animation
    setTimeout(() => {
        modalOverlay.classList.add('active');
    }, 10);
    
    // Handle button click
    document.getElementById('goToLoginBtn').addEventListener('click', function() {
        // Store credentials in localStorage for auto-fill
        localStorage.setItem('userCredentials', JSON.stringify({
            username: username,
            password: password
        }));
        
        // Redirect to login page
        window.location.href = 'login.html';
    });
}

// Username validation
document.getElementById('username').addEventListener('input', function() {
    const value = this.value.trim();
    const isValid = validateUsername(value);
    
    if (value.length === 0) {
        this.classList.remove('valid', 'invalid');
        validationState.username = false;
    } else if (isValid) {
        this.classList.add('valid');
        this.classList.remove('invalid');
        validationState.username = true;
    } else {
        this.classList.add('invalid');
        this.classList.remove('valid');
        validationState.username = false;
    }
    
    updateSubmitButton();
});

// Email validation
document.getElementById('email').addEventListener('input', function() {
    const value = this.value.trim();
    const isValid = validateEmail(value);
    
    if (value.length === 0) {
        this.classList.remove('valid', 'invalid');
        validationState.email = false;
        document.getElementById('getCodeBtn').disabled = true;
    } else if (isValid) {
        this.classList.add('valid');
        this.classList.remove('invalid');
        validationState.email = true;
        document.getElementById('getCodeBtn').disabled = false;
    } else {
        this.classList.add('invalid');
        this.classList.remove('valid');
        validationState.email = false;
        document.getElementById('getCodeBtn').disabled = true;
    }
    
    updateSubmitButton();
});

// Get verification code button
let countdownInterval = null;
document.getElementById('getCodeBtn').addEventListener('click', function() {
    const btn = this;
    let countdown = 30;
    
    btn.disabled = true;
    btn.classList.add('countdown');
    btn.textContent = `${countdown}s`;
    
    showCodeSentMessage();
    
    countdownInterval = setInterval(() => {
        countdown--;
        btn.textContent = `${countdown}s`;
        
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            btn.disabled = false;
            btn.classList.remove('countdown');
            btn.textContent = 'Get Code';
        }
    }, 1000);
});

// Verification code validation
document.getElementById('verificationCode').addEventListener('input', function() {
    const value = this.value.trim();
    
    if (value.length === 0) {
        this.classList.remove('valid', 'invalid');
        validationState.verificationCode = false;
    } else if (value === VERIFICATION_CODE) {
        this.classList.add('valid');
        this.classList.remove('invalid');
        validationState.verificationCode = true;
    } else {
        this.classList.add('invalid');
        this.classList.remove('valid');
        validationState.verificationCode = false;
    }
    
    updateSubmitButton();
});

// Password validation
document.getElementById('password').addEventListener('input', function() {
    const value = this.value;
    const isValid = validatePassword(value);
    
    if (value.length === 0) {
        this.classList.remove('valid', 'invalid');
        validationState.password = false;
    } else if (isValid) {
        this.classList.add('valid');
        this.classList.remove('invalid');
        validationState.password = true;
    } else {
        this.classList.add('invalid');
        this.classList.remove('valid');
        validationState.password = false;
    }
    
    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (confirmPasswordInput.value.length > 0) {
        confirmPasswordInput.dispatchEvent(new Event('input'));
    }
    
    updateSubmitButton();
});

// Confirm password validation
document.getElementById('confirmPassword').addEventListener('input', function() {
    const password = document.getElementById('password').value;
    const value = this.value;
    const isValid = validateConfirmPassword(password, value);
    
    if (value.length === 0) {
        this.classList.remove('valid', 'invalid');
        validationState.confirmPassword = false;
    } else if (isValid) {
        this.classList.add('valid');
        this.classList.remove('invalid');
        validationState.confirmPassword = true;
    } else {
        this.classList.add('invalid');
        this.classList.remove('valid');
        validationState.confirmPassword = false;
    }
    
    updateSubmitButton();
});

// Form submission
document.getElementById('registForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const allValid = Object.values(validationState).every(val => val === true);
    
    if (allValid) {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        // Show success modal
        showSuccessModal(username, password);
    }
});