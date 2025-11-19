// Hard-coded verification code
const VERIFICATION_CODE = '1234';

// Validation state
let validationState = {
    email: false,
    verificationCode: false,
    newPassword: false,
    confirmPassword: false
};

let isVerified = false;
let verifiedEmail = '';

// Toggle password visibility
document.getElementById('toggleNewPassword').addEventListener('click', function() {
    const passwordInput = document.getElementById('newPassword');
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

function updateVerifyButton() {
    const verifyBtn = document.getElementById('verifyBtn');
    const canVerify = validationState.email && validationState.verificationCode;
    verifyBtn.disabled = !canVerify;
}

function updateConfirmButton() {
    const confirmBtn = document.getElementById('confirmBtn');
    const allValid = validationState.newPassword && validationState.confirmPassword;
    confirmBtn.disabled = !allValid;
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

function showErrorMessage(message) {
    // Remove existing messages
    const existingMessage = document.querySelector('.error-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('small');
    messageDiv.className = 'error-message';
    messageDiv.textContent = message;
    
    const emailLabel = document.getElementById('emailLabel');
    emailLabel.appendChild(messageDiv);
}

function removeErrorMessage() {
    const existingMessage = document.querySelector('.error-message');
    if (existingMessage) {
        existingMessage.remove();
    }
}

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
    
    updateVerifyButton();
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
    removeErrorMessage();
    
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
    
    updateVerifyButton();
});

// Verify button handler
document.getElementById('verifyBtn').addEventListener('click', function() {
    const email = document.getElementById('email').value.trim();
    const code = document.getElementById('verificationCode').value.trim();
    
    // Check if credentials exist in localStorage
    let savedCredentials = null;
    if (localStorage.getItem('userCredentials')) {
        savedCredentials = JSON.parse(localStorage.getItem('userCredentials'));
    }
    
    // Verify email exists (either matches saved credentials or any valid format)
    // For this dummy implementation, we'll accept any valid email format
    if (validateEmail(email) && code === VERIFICATION_CODE) {
        isVerified = true;
        verifiedEmail = email;
        
        // Add verified class to form for layout shift
        document.getElementById('pwresetForm').classList.add('verified');
        
        // Show password section
        document.getElementById('passwordSection').style.display = 'block';
        
        // Disable email and code fields
        document.getElementById('email').disabled = true;
        document.getElementById('verificationCode').disabled = true;
        document.getElementById('getCodeBtn').disabled = true;
        document.getElementById('verifyBtn').disabled = true;
        
        removeErrorMessage();
    } else {
        showErrorMessage('Verification failed. Please check your email and code.');
    }
});

// New password validation
document.getElementById('newPassword').addEventListener('input', function() {
    const value = this.value;
    const isValid = validatePassword(value);
    
    if (value.length === 0) {
        this.classList.remove('valid', 'invalid');
        validationState.newPassword = false;
    } else if (isValid) {
        this.classList.add('valid');
        this.classList.remove('invalid');
        validationState.newPassword = true;
    } else {
        this.classList.add('invalid');
        this.classList.remove('valid');
        validationState.newPassword = false;
    }
    
    // Re-validate confirm password if it has content
    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (confirmPasswordInput.value.length > 0) {
        confirmPasswordInput.dispatchEvent(new Event('input'));
    }
    
    updateConfirmButton();
});

// Confirm password validation
document.getElementById('confirmPassword').addEventListener('input', function() {
    const password = document.getElementById('newPassword').value;
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
    
    updateConfirmButton();
});

// Form submission
document.getElementById('pwresetForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!isVerified) {
        return;
    }
    
    const allValid = validationState.newPassword && validationState.confirmPassword;
    
    if (allValid) {
        const newPassword = document.getElementById('newPassword').value;
        
        // Get username from saved credentials or use email
        let username = verifiedEmail;
        if (localStorage.getItem('userCredentials')) {
            const savedCredentials = JSON.parse(localStorage.getItem('userCredentials'));
            username = savedCredentials.username;
        }
        
        // Update credentials in localStorage
        localStorage.setItem('userCredentials', JSON.stringify({
            username: username,
            password: newPassword
        }));
        
        // Redirect to login page
        window.location.href = 'login.html';
    }
});