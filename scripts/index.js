// --- API Base URL ---
const API_BASE_URL = 'http://localhost:3000/api';

// --- API Service Functions ---
const apiService = {
    // User APIs
    async userSignUp(userData) {
        const response = await fetch(`${API_BASE_URL}/users/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        return await response.json();
    },

    async userSignIn(credentials) {
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });
        return await response.json();
    },

    // Staff APIs
    async staffSignUp(staffData) {
        const response = await fetch(`${API_BASE_URL}/staff/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(staffData)
        });
        return await response.json();
    },

    async staffSignIn(credentials) {
        const response = await fetch(`${API_BASE_URL}/staff/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });
        return await response.json();
    },

    // Admin APIs
    async adminSignIn(credentials) {
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });
        return await response.json();
    },

    // OTP APIs
    async sendOTP(identifier, role, purpose = 'signup') {
        console.log(`Sending OTP request: identifier=${identifier}, role=${role}, purpose=${purpose}`);
        const response = await fetch(`${API_BASE_URL}/otp/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                identifier, 
                userType: role,
                purpose: purpose,
                type: identifier.includes('@') ? 'email' : 'phone'
            })
        });
        const result = await response.json();
        console.log('OTP Response:', result);
        return result;
    },

    async verifyOTP(identifier, otp, role, purpose = 'signup') {
        console.log(`Verifying OTP: identifier=${identifier}, role=${role}, purpose=${purpose}`);
        const response = await fetch(`${API_BASE_URL}/otp/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                identifier, 
                otp,
                purpose: purpose
            })
        });
        const result = await response.json();
        console.log('Verify OTP Response:', result);
        return result;
    },

    async resendOTP(identifier, role, purpose = 'signup') {
        console.log(`Resending OTP: identifier=${identifier}, role=${role}, purpose=${purpose}`);
        const response = await fetch(`${API_BASE_URL}/otp/resend`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                identifier,
                purpose: purpose
            })
        });
        const result = await response.json();
        console.log('Resend OTP Response:', result);
        return result;
    },

    // OTP Login APIs
    async userLoginWithOTP(identifier, otp) {
        const response = await fetch(`${API_BASE_URL}/otp/login/user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ identifier, otp })
        });
        return await response.json();
    },

    async staffLoginWithOTP(identifier, otp) {
        const response = await fetch(`${API_BASE_URL}/otp/login/staff`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ identifier, otp })
        });
        return await response.json();
    },

    async adminLoginWithOTP(identifier, otp) {
        const response = await fetch(`${API_BASE_URL}/otp/login/admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ identifier, otp })
        });
        return await response.json();
    },

    // OTP Signup API
    async userSignUpWithOTP(registrationData) {
        const response = await fetch(`${API_BASE_URL}/otp/signup/user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registrationData)
        });
        return await response.json();
    },
    
    // Health check
    async healthCheck() {
        const response = await fetch(`${API_BASE_URL}/health`);
        return await response.json();
    }
};

// --- DOM Elements ---
const authModal = document.getElementById('authModal');
const closeAuthModal = document.getElementById('closeAuthModal');
const navButtons = [
  document.getElementById('navLoginBtn'), 
  document.getElementById('navRegisterBtn'), 
  document.getElementById('mobileLoginBtn'), 
  document.getElementById('mobileRegisterBtn'),
  document.getElementById('heroGetStartedBtn')
];
const roleButtons = document.querySelectorAll('.user-type-btn');
const formSections = document.querySelectorAll('.form-section');
const staffTabs = [document.getElementById('staffSignUpTab'), document.getElementById('staffSignInTab')];
const userTabs = [document.getElementById('userSignUpTab'), document.getElementById('userSignInTab')];
const loginMethodButtons = document.querySelectorAll('.login-method-btn');
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const navbar = document.getElementById('navbar');

// --- Helper Functions ---

const toggleModal = (show = true, initialRole = 'user', initialTab = 'signup') => {
  if (show) {
    authModal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    
    switchRole(initialRole);
    
    const roleElement = document.getElementById(`${initialRole}Section`);
    if (roleElement) {
        const tabId = initialTab === 'signup' ? `${initialRole}SignUpTab` : `${initialRole}SignInTab`;
        const tabElement = document.getElementById(tabId);
        if (tabElement) {
            handleTabSwitch(tabElement);
        }
    }
  } else {
    authModal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }
};

const switchRole = (role) => {
  formSections.forEach(section => {
    section.classList.add('hidden');
  });
  document.getElementById(`${role}Section`).classList.remove('hidden');
  
  roleButtons.forEach(btn => {
    if (btn.dataset.role === role) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  updateSubmitButtonText(role);
};

const handleTabSwitch = (tabElement) => {
  const formId = tabElement.dataset.form;
  const formElement = document.getElementById(formId);
  const role = formId.startsWith('user') ? 'user' : formId.startsWith('staff') ? 'staff' : 'admin';
  
  const tabContainer = tabElement.parentNode;
  tabContainer.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  
  tabElement.classList.add('active');

  const formSection = tabElement.closest('.form-section');
  formSection.querySelectorAll('form').forEach(f => f.classList.add('hidden'));

  formElement.classList.remove('hidden');

  // Reset OTP sections
  document.getElementById(`${role}SignupOtpSection`)?.classList.add('hidden');
  document.getElementById(`${role}LoginOtpSection`)?.classList.add('hidden');
  
  const isSignIn = formId.includes('SignIn');
  
  let currentLoginMethod = 'password';
  if (isSignIn) {
      const selectedBtn = document.querySelector(`#${role}Section .login-method-btn.selected`);
      currentLoginMethod = selectedBtn ? selectedBtn.dataset.method : 'password';
  }

  const passwordFields = document.getElementById(`${role}PasswordFields`);
  const otpFields = document.getElementById(`${role}OtpFields`);

  if (isSignIn) {
      if (currentLoginMethod === 'password') {
          passwordFields?.classList.remove('hidden');
          otpFields?.classList.add('hidden');
      } else {
          passwordFields?.classList.add('hidden');
          otpFields?.classList.remove('hidden');
          document.getElementById(`${role}LoginOtpSection`)?.classList.add('hidden');
      }
  }

  updateSubmitButtonText(role, isSignIn, currentLoginMethod);
};

const handleLoginMethodSwitch = (button) => {
    const method = button.dataset.method;
    const role = button.dataset.form;

    const container = button.parentNode;
    container.querySelectorAll('.login-method-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    button.classList.add('selected');

    const passwordFields = document.getElementById(`${role}PasswordFields`);
    const otpFields = document.getElementById(`${role}OtpFields`);
    const sendOtpBtn = document.getElementById(`${role}SendOtpBtn`);

    if (method === 'password') {
        passwordFields?.classList.remove('hidden');
        otpFields?.classList.add('hidden');
        document.getElementById(`${role}LoginOtpSection`)?.classList.add('hidden');
        if (sendOtpBtn) {
            sendOtpBtn.classList.remove('hidden');
        }
    } else {
        passwordFields?.classList.add('hidden');
        otpFields?.classList.remove('hidden');
        document.getElementById(`${role}LoginOtpSection`)?.classList.add('hidden');
    }
    
    updateSubmitButtonText(role, true, method);
};

const updateSubmitButtonText = (role, isSignIn = false, loginMethod = 'password') => {
    const submitBtn = document.getElementById(`${role}SubmitBtn`);
    if (!submitBtn) return;

    let text;
    let currentMethod = loginMethod;

    if (isSignIn) {
        if (loginMethod === 'otp') {
            const otpSection = document.getElementById(`${role}LoginOtpSection`);
            if (otpSection && !otpSection.classList.contains('hidden')) {
                 text = 'VERIFY OTP & SIGN IN';
                 currentMethod = 'otp';
            } else {
                 text = 'SIGN IN'; 
                 currentMethod = 'otp';
            }
        } else {
            text = 'SIGN IN';
            currentMethod = 'password';
        }
    } else {
        const otpSection = document.getElementById(`${role}SignupOtpSection`);
        if (otpSection && !otpSection.classList.contains('hidden')) {
            text = 'VERIFY OTP & COMPLETE SIGNUP';
        } else {
            text = role === 'user' ? 'SIGN UP' : 'REGISTER AS STAFF';
        }
        currentMethod = 'password';
    }
    
    submitBtn.textContent = text;
    submitBtn.dataset.form = isSignIn ? `${role}SignInForm` : `${role}SignUpForm`;
    submitBtn.dataset.role = role;
    submitBtn.dataset.method = currentMethod;
};

const setupOtpInputs = (containerId, submitBtnId) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const inputs = container.querySelectorAll('.otp-input');
    
    inputs.forEach((input, index) => {
        input.value = ''; 
        
        input.addEventListener('input', (e) => {
            const value = e.target.value.replace(/[^0-9]/g, '');
            e.target.value = value;
            
            if (value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            } else if (value.length === 1 && index === inputs.length - 1) {
                 if (getOtpValue(containerId).length === 6) {
                     const submitBtn = document.getElementById(submitBtnId);
                     if (submitBtn && submitBtn.textContent.includes('VERIFY')) {
                         submitBtn.click();
                     }
                 }
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
                inputs[index - 1].focus();
            }
        });
    });
    if(inputs.length > 0) inputs[0].focus();
};

const getOtpValue = (containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return "";
    return Array.from(container.querySelectorAll('.otp-input')).map(input => input.value).join('');
};

/**
 * FIXED: Role-based redirect logic
 */
const handleAuthSuccess = (response, role) => {
    const successMessage = `${role.toUpperCase()} Authentication successful!`;
    
    if (response.data?.accessToken) {
        localStorage.setItem('authToken', response.data.accessToken);
    }
    
    toggleModal(false);
    showTemporaryMessage(successMessage);
    
    try {
        localStorage.setItem('userRole', role);
    } catch (e) {
        console.error('Storage error:', e);
    }
    
    // FIXED: Role-based redirect
    setTimeout(() => {
        let redirectUrl = 'home.html'; // default
        
        if (role === 'admin') {
            redirectUrl = 'admin.html';
        } else if (role === 'staff') {
            redirectUrl = 'staff.html';
        } else if (role === 'user') {
            redirectUrl = 'home.html';
        }
        
        console.log(`Redirecting ${role} to ${redirectUrl}`);
        window.location.replace(redirectUrl);
    }, 150);
};

/**
 * FIXED: Extract form data properly for sign-in
 */
const getSignInCredentials = (form, role) => {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    let identifier, password;
    
    if (role === 'user') {
        identifier = data.loginIdentifier;
        password = data.password;
    } else if (role === 'staff') {
        identifier = data.staffIdOrEmail;
        password = data.password;
    } else if (role === 'admin') {
        identifier = data.adminId;
        password = data.password;
    }
    
    return { identifier, password };
};

const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitBtn = e.currentTarget;
    const formId = submitBtn.dataset.form;
    const role = submitBtn.dataset.role;
    const method = submitBtn.dataset.method;
    const form = document.getElementById(formId);

    console.log('[AUTH] handleSubmit called', { formId, role, method });

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const isSignup = formId.includes('SignUp');
    const otpSection = document.getElementById(isSignup ? `${role}SignupOtpSection` : `${role}LoginOtpSection`);
    const isVerifying = submitBtn.textContent.includes('VERIFY OTP'); 

    try {
        if (isSignup) {
            // SIGNUP LOGIC (unchanged)
            const identifier = data.email || data.phone;
            if (!identifier) {
                showTemporaryMessage("Email or Phone is required to register.");
                return;
            }

            const hasPassword = !!data.password || !!data.confirmPassword;
            if (!isVerifying && hasPassword) {
                if (data.password !== data.confirmPassword) {
                    showTemporaryMessage("Passwords do not match!");
                    return;
                }

                const registrationData = {
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    password: data.password,
                    ...(role === 'user' && {
                        street: data.street,
                        city: data.city,
                        state: data.state,
                        pincode: data.pincode
                    }),
                    ...(role === 'staff' && {
                        staffId: data.staffId
                    })
                };

                let signupResponse;
                try {
                    if (role === 'user') {
                        signupResponse = await apiService.userSignUp(registrationData);
                    } else {
                        signupResponse = await apiService.staffSignUp(registrationData);
                    }
                } catch (err) {
                    console.error('Signup error:', err);
                    showTemporaryMessage('Signup failed. Please try again.');
                    return;
                }

                if (signupResponse?.success) {
                    handleAuthSuccess(signupResponse, role);
                    form.reset();
                } else {
                    showTemporaryMessage(signupResponse?.message || 'Registration failed');
                }

                return;
            }

            // OTP Signup flow
            if (!isVerifying) {
                console.log(`[${role.toUpperCase()} SIGNUP] Sending OTP to ${identifier}...`);
                const otpResponse = await apiService.sendOTP(identifier, role, 'signup');

                if (otpResponse.success) {
                    otpSection.classList.remove('hidden');
                    updateSubmitButtonText(role, false);
                    setupOtpInputs(`${role}SignupOtpInputs`, `${role}SubmitBtn`);
                    showTemporaryMessage("OTP sent! Check your email/phone.");
                } else {
                    showTemporaryMessage(otpResponse.message || "Failed to send OTP. Check server logs.");
                }

            } else if (isVerifying) {
                const otp = getOtpValue(`${role}SignupOtpInputs`);
                if (otp.length !== 6) {
                    showTemporaryMessage("Please enter the full 6-digit OTP.");
                    return;
                }

                console.log(`[${role.toUpperCase()} SIGNUP] Verifying OTP: ${otp}`);
                const verifyResponse = await apiService.verifyOTP(identifier, otp, role, 'signup');

                if (verifyResponse.success) {
                    const registrationData = {
                        name: data.name,
                        email: data.email,
                        phone: data.phone,
                        otp: otp,
                        ...(role === 'user' && {
                            street: data.street,
                            city: data.city,
                            state: data.state,
                            pincode: data.pincode
                        }),
                        ...(role === 'staff' && {
                            staffId: data.staffId
                        })
                    };

                    let finalRegistrationResponse;
                    if (role === 'user') {
                        finalRegistrationResponse = await apiService.userSignUpWithOTP(registrationData);
                    } else {
                        finalRegistrationResponse = await apiService.staffSignUp(registrationData);
                    }

                    if (finalRegistrationResponse.success) {
                        handleAuthSuccess(finalRegistrationResponse, role);
                        form.reset();
                        otpSection.classList.add('hidden');
                    } else {
                        showTemporaryMessage(finalRegistrationResponse.message || "Registration failed");
                    }
                } else {
                    showTemporaryMessage(verifyResponse.message || "Invalid OTP");
                }
            }

        } else {
            // SIGN IN LOGIC - FIXED
            
            if (method === 'password') {
                // FIXED: Get credentials properly
                const credentials = getSignInCredentials(form, role);
                
                if (!credentials.identifier || !credentials.password) {
                     showTemporaryMessage("Please enter both identifier and password.");
                     return;
                }

                console.log('[AUTH] Password sign-in attempt', { role, identifier: credentials.identifier });

                let loginResponse;
                try {
                    if (role === 'user') {
                        loginResponse = await apiService.userSignIn(credentials);
                    } else if (role === 'staff') {
                        loginResponse = await apiService.staffSignIn(credentials);
                    } else if (role === 'admin') {
                        loginResponse = await apiService.adminSignIn(credentials);
                    }
                } catch (err) {
                    console.error('Password sign-in error:', err);
                    showTemporaryMessage('Network error during sign-in.');
                    return;
                }

                console.log('[AUTH] Login response:', loginResponse);

                if (loginResponse?.success) {
                    handleAuthSuccess(loginResponse, role);
                    form.reset();
                } else {
                    showTemporaryMessage(loginResponse?.message || "Login failed. Check your credentials.");
                }

            } else if (method === 'otp') {
                // OTP SIGN IN
                const identifier = document.getElementById(`${role}OtpIdentifier`).value;

                if (submitBtn.textContent.includes('SEND OTP')) {
                    showTemporaryMessage("Please use the 'Send OTP' button next to the input.");
                    return;

                } else if (submitBtn.textContent.includes('VERIFY OTP')) {
                    const otp = getOtpValue(`${role}LoginOtpInputs`);
                    if (otp.length !== 6) {
                        showTemporaryMessage("Please enter the full 6-digit OTP.");
                        return;
                    }
                    
                    let loginResponse;
                    if (role === 'user') {
                        loginResponse = await apiService.userLoginWithOTP(identifier, otp);
                    } else if (role === 'staff') {
                        loginResponse = await apiService.staffLoginWithOTP(identifier, otp);
                    } else {
                        loginResponse = await apiService.adminLoginWithOTP(identifier, otp);
                    }
                    
                    if (loginResponse.success) {
                        handleAuthSuccess(loginResponse, role);
                        form.reset();
                    } else {
                        showTemporaryMessage(loginResponse.message || "Invalid OTP");
                    }
                }
                
                if (!isVerifying && !document.getElementById(`${role}LoginOtpSection`).classList.contains('hidden')) {
                     console.warn("OTP submit attempted without verification step.");
                     return;
                }
            }
        }
    } catch (error) {
        console.error('API Error:', error);
        showTemporaryMessage("Network error. Please try again.");
    }
};

const showTemporaryMessage = (message) => {
  const msgDiv = document.createElement('div');
  msgDiv.className = 'fixed top-4 right-4 bg-resolve-teal text-white p-4 rounded-xl shadow-2xl z-[100] transition-transform duration-500 transform translate-x-full';
  msgDiv.textContent = message;
  document.body.appendChild(msgDiv);

  setTimeout(() => {
      msgDiv.classList.remove('translate-x-full');
      msgDiv.style.transform = 'translateX(0)';
  }, 10);

  setTimeout(() => {
      msgDiv.style.transform = 'translateX(120%)';
      msgDiv.addEventListener('transitionend', () => msgDiv.remove());
  }, 4000);
};

// --- Event Listeners ---

document.addEventListener('DOMContentLoaded', async () => {
    console.log("Frontend initialized");
    
    try {
        const health = await apiService.healthCheck();
        console.log("Backend connection:", health);
    } catch (error) {
        console.error("Backend connection failed:", error);
        showTemporaryMessage("Backend connection failed. Please make sure the server is running.");
    }
});

mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled-nav');
        navbar.classList.remove('bg-white', 'shadow-md');
    } else {
        navbar.classList.remove('scrolled-nav');
        navbar.classList.add('bg-white', 'shadow-md');
    }
});

closeAuthModal.addEventListener('click', () => toggleModal(false));
authModal.addEventListener('click', (e) => {
  if (e.target.id === 'authModal') {
    toggleModal(false);
  }
});

navButtons.forEach(btn => {
  if (!btn) return;
  btn.addEventListener('click', () => {
      const isRegister = btn.id.includes('Register') || btn.id.includes('hero');
      toggleModal(true, 'user', isRegister ? 'signup' : 'signin');
  });
});

const ctaSignUpBtn = document.getElementById('ctaSignUpBtn');
if (ctaSignUpBtn) {
        ctaSignUpBtn.addEventListener('click', () => toggleModal(true, 'user', 'signup'));
}

[
    { id: 'userSendOtpBtn', role: 'user' },
    { id: 'staffSendOtpBtn', role: 'staff' },
    { id: 'adminSendOtpBtn', role: 'admin' }
].forEach(({ id, role }) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', async () => {
        const identifierInput = document.getElementById(`${role}OtpIdentifier`);
        const identifier = identifierInput?.value?.trim();
        if (!identifier) {
            showTemporaryMessage('Please enter your email or phone number');
            return;
        }

        try {
            const resp = await apiService.sendOTP(identifier, role, 'login');
            if (resp.success) {
                const otpSection = document.getElementById(`${role}LoginOtpSection`);
                if (otpSection) otpSection.classList.remove('hidden');

                updateSubmitButtonText(role, true, 'otp');
                setupOtpInputs(`${role}LoginOtpInputs`, `${role}SubmitBtn`);
                btn.classList.add('hidden'); 
                showTemporaryMessage('OTP sent! Check your email/phone.');
            } else {
                showTemporaryMessage(resp.message || 'Failed to send OTP');
            }
        } catch (err) {
            console.error('Send OTP error:', err);
            showTemporaryMessage('Network error. Could not send OTP.');
        }
    });
});

roleButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    switchRole(btn.dataset.role);
  });
});

[...userTabs, ...staffTabs].forEach(tab => {
    if (tab) tab.addEventListener('click', (e) => handleTabSwitch(e.currentTarget));
});

loginMethodButtons.forEach(btn => {
    btn.addEventListener('click', (e) => handleLoginMethodSwitch(e.currentTarget));
});

document.querySelectorAll('[id$="SubmitBtn"]').forEach(btn => {
    btn.addEventListener('click', handleSubmit);
});

document.querySelectorAll('[id^="userResend"], [id^="staffResend"], [id^="adminResend"]').forEach(btn => {
    btn.addEventListener('click', async () => {
        const role = btn.id.includes('user') ? 'user' : btn.id.includes('staff') ? 'staff' : 'admin';
        const isSignup = btn.id.includes('Signup');
        
        let identifier;
        if (isSignup) {
            identifier = document.getElementById(`${role}SignupEmail`)?.value;
        } else {
            identifier = document.getElementById(`${role}OtpIdentifier`)?.value;
        }
        
        if (identifier) {
            const purpose = isSignup ? 'signup' : 'login';
            const response = await apiService.resendOTP(identifier, role, purpose);
            if (response.success) {
                showTemporaryMessage("OTP resent successfully!");
            } else {
                showTemporaryMessage(response.message || "Failed to resend OTP");
            }
        } else {
            showTemporaryMessage("Please enter your email/phone first");
        }
    });
});

document.querySelectorAll('[id$="ForgotPassword"]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        showTemporaryMessage("Password reset feature coming soon!");
    });
});

const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const contactData = Object.fromEntries(formData.entries());
        
        console.log("Contact form data:", contactData);
        showTemporaryMessage("Thank you! Your message has been received.");
        e.target.reset();
    });
}