// Authentication JavaScript for ReWear
class AuthManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupPasswordToggles();
        this.setupPasswordStrength();
        this.setupFormValidation();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }

        // Google OAuth buttons
        const googleLoginBtn = document.getElementById('googleLogin');
        const googleRegisterBtn = document.getElementById('googleRegister');
        
        if (googleLoginBtn) {
            googleLoginBtn.addEventListener('click', () => {
                this.handleGoogleAuth();
            });
        }
        
        if (googleRegisterBtn) {
            googleRegisterBtn.addEventListener('click', () => {
                this.handleGoogleAuth();
            });
        }
    }

    setupPasswordToggles() {
        const passwordToggles = document.querySelectorAll('.password-toggle');
        passwordToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const input = toggle.previousElementSibling;
                const icon = toggle.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.className = 'fas fa-eye-slash';
                } else {
                    input.type = 'password';
                    icon.className = 'fas fa-eye';
                }
            });
        });
    }

    setupPasswordStrength() {
        const passwordInput = document.getElementById('password');
        if (!passwordInput) return;

        passwordInput.addEventListener('input', () => {
            this.updatePasswordStrength(passwordInput.value);
        });
    }

    updatePasswordStrength(password) {
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');
        
        if (!strengthFill || !strengthText) return;

        const strength = this.calculatePasswordStrength(password);
        
        // Update strength bar
        strengthFill.style.width = `${strength.score}%`;
        strengthFill.style.backgroundColor = strength.color;
        
        // Update strength text
        strengthText.textContent = strength.text;
        strengthText.style.color = strength.color;
    }

    calculatePasswordStrength(password) {
        let score = 0;
        let feedback = [];

        // Length check
        if (password.length >= 8) {
            score += 25;
        } else {
            feedback.push('At least 8 characters');
        }

        // Uppercase check
        if (/[A-Z]/.test(password)) {
            score += 25;
        } else {
            feedback.push('Include uppercase letter');
        }

        // Lowercase check
        if (/[a-z]/.test(password)) {
            score += 25;
        } else {
            feedback.push('Include lowercase letter');
        }

        // Number check
        if (/\d/.test(password)) {
            score += 25;
        } else {
            feedback.push('Include number');
        }

        // Determine strength level
        let text, color;
        if (score >= 100) {
            text = 'Very Strong';
            color = '#10b981';
        } else if (score >= 75) {
            text = 'Strong';
            color = '#059669';
        } else if (score >= 50) {
            text = 'Medium';
            color = '#f59e0b';
        } else if (score >= 25) {
            text = 'Weak';
            color = '#ef4444';
        } else {
            text = 'Very Weak';
            color = '#dc2626';
        }

        return { score, text, color, feedback };
    }

    setupFormValidation() {
        // Real-time validation for register form
        const registerForm = document.getElementById('registerForm');
        if (!registerForm) return;

        const inputs = registerForm.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }

    validateField(field) {
        const errorElement = document.getElementById(field.id + 'Error');
        if (!errorElement) return true; // Return true if no error element exists

        let isValid = true;
        let errorMessage = '';

        switch (field.type) {
            case 'email':
                isValid = this.isValidEmail(field.value);
                errorMessage = 'Please enter a valid email address';
                break;
            case 'password':
                if (field.id === 'confirmPassword') {
                    const password = document.getElementById('password');
                    isValid = field.value === password.value;
                    errorMessage = 'Passwords do not match';
                } else {
                    isValid = field.value.length >= 6;
                    errorMessage = 'Password must be at least 6 characters';
                }
                break;
            case 'text':
                if (field.id === 'name') {
                    isValid = field.value.length >= 2;
                    errorMessage = 'Name must be at least 2 characters';
                }
                break;
            case 'checkbox':
                isValid = field.checked;
                errorMessage = 'This field is required';
                break;
        }

        if (!isValid && field.value.trim()) {
            this.showFieldError(field, errorMessage);
        } else {
            this.clearFieldError(field);
        }

        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showFieldError(field, message) {
        const errorElement = document.getElementById(field.id + 'Error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
            field.style.borderColor = '#ef4444';
        }
    }

    clearFieldError(field) {
        const errorElement = document.getElementById(field.id + 'Error');
        if (errorElement) {
            errorElement.classList.remove('show');
            field.style.borderColor = '';
        }
    }

    async handleLogin() {
        const form = document.getElementById('loginForm');
        const formData = new FormData(form);
        
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        try {
            this.setLoadingState(form, true);
            
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                this.showNotification('Login successful!', 'success');
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 1000);
            } else {
                this.showNotification(data.error || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Network error. Please try again.', 'error');
        } finally {
            this.setLoadingState(form, false);
        }
    }

    async handleRegister() {
        const form = document.getElementById('registerForm');
        const formData = new FormData(form);
        
        console.log('Registration form submitted');
        
        // Validate all required fields
        const requiredInputs = form.querySelectorAll('input[required]');
        let isValid = true;
        let firstInvalidField = null;
        
        console.log('Validating', requiredInputs.length, 'required fields');
        
        requiredInputs.forEach(input => {
            console.log('Validating field:', input.id, input.type, input.value);
            if (!this.validateField(input)) {
                isValid = false;
                console.log('Field validation failed:', input.id);
                if (!firstInvalidField) {
                    firstInvalidField = input;
                }
            }
        });

        if (!isValid) {
            console.log('Form validation failed');
            this.showNotification('Please fix the errors in the form', 'error');
            if (firstInvalidField) {
                firstInvalidField.focus();
            }
            return;
        }

        const registerData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password')
        };

        console.log('Sending registration data:', registerData);

        try {
            this.setLoadingState(form, true);
            
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registerData)
            });

            const data = await response.json();
            console.log('Registration response:', data);

            if (response.ok) {
                this.showNotification('Registration successful! Please log in.', 'success');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 1500);
            } else {
                this.showNotification(data.error || 'Registration failed', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification('Network error. Please try again.', 'error');
        } finally {
            this.setLoadingState(form, false);
        }
    }

    handleGoogleAuth() {
        // Redirect to Google OAuth
        window.location.href = '/api/auth/google';
    }

    setLoadingState(form, isLoading) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<div class="spinner"></div> Loading...';
            form.classList.add('loading');
        } else {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            form.classList.remove('loading');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    // Utility methods
    getCurrentUser() {
        return fetch('/api/auth/me', {
            credentials: 'include'
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            return null;
        })
        .catch(error => {
            console.error('Error getting current user:', error);
            return null;
        });
    }

    logout() {
        return fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        })
        .then(() => {
            window.location.href = '/';
        })
        .catch(error => {
            console.error('Logout error:', error);
        });
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});

// Add CSS for auth-specific styles
const authStyles = `
    .auth-form.loading {
        opacity: 0.6;
        pointer-events: none;
    }
    
    .auth-form .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid transparent;
        border-top: 2px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-right: 0.5rem;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: var(--radius-md);
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        box-shadow: var(--shadow-lg);
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-info {
        background-color: var(--primary-color);
    }
    
    .notification-success {
        background-color: #10b981;
    }
    
    .notification-error {
        background-color: #ef4444;
    }
`;

// Inject auth styles
const styleSheet = document.createElement('style');
styleSheet.textContent = authStyles;
document.head.appendChild(styleSheet); 