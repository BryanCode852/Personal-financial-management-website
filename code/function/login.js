// Hard-coded credentials
const VALID_USERNAME = 'bryan123';
const VALID_PASSWORD = 'bryan123';

// Check if user is already logged in
window.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
        // User is already logged in, redirect to main page
        window.location.replace('main.html');
        return;
    }

    // Check if user data exists in localStorage (from registration)
    let savedCredentials = null;
    if (localStorage.getItem('userCredentials')) {
        savedCredentials = JSON.parse(localStorage.getItem('userCredentials'));
        // Auto-fill if credentials exist
        if (savedCredentials) {
            document.getElementById('username').value = savedCredentials.username;
            document.getElementById('password').value = savedCredentials.password;
        }
    }
});

// Toggle password visibility
document.getElementById('togglePassword').addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.textContent = type === 'password' ? '👁️' : '🙈';
});

// Function to show error message
function showErrorMessage(message) {
    // Remove existing error message if any
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<span class="error-icon">✗</span> ${message}`;
    
    // Insert after subtitle
    const subtitle = document.querySelector('.subtitle');
    subtitle.insertAdjacentElement('afterend', errorDiv);
}

// Form submission
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    // Check if user data exists in localStorage (from registration)
    let savedCredentials = null;
    if (localStorage.getItem('userCredentials')) {
        savedCredentials = JSON.parse(localStorage.getItem('userCredentials'));
    }
    
    const isValidDefault = (username === VALID_USERNAME && password === VALID_PASSWORD);
    const isValidRegistered = savedCredentials && (username === savedCredentials.username && password === savedCredentials.password);
    
    if (isValidDefault || isValidRegistered) {
        // Remove error message if exists
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Store credentials for auto-fill on next login
        localStorage.setItem('userCredentials', JSON.stringify({
            username: username,
            password: password
        }));
        
        // Set session flag to indicate user is logged in
        sessionStorage.setItem('isLoggedIn', 'true');
        
        // Redirect to main page using replace to prevent back navigation
        window.location.replace('main.html');
    } else {
        showErrorMessage('Username/Email not exist and wrong password');
    }
});