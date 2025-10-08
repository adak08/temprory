document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ DOM fully loaded - initializing ResolveX");

  const BASE_URL = "http://localhost:3000";

  // Navbar scroll effect
  window.addEventListener("scroll", function () {
    const navbar = document.getElementById("navbar");
    if (window.scrollY > 50) {
      navbar.classList.add("nav-scrolled");
    } else {
      navbar.classList.remove("nav-scrolled");
    }
  });

  // Mobile menu toggle
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  if (mobileMenuButton) {
    mobileMenuButton.addEventListener("click", function () {
      const mobileMenu = document.getElementById("mobile-menu");
      if (mobileMenu) {
        mobileMenu.classList.toggle("hidden");
      }
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: "smooth",
        });

        // Close mobile menu if open
        const mobileMenu = document.getElementById("mobile-menu");
        if (mobileMenu) {
          mobileMenu.classList.add("hidden");
        }
      }
    });
  });

  // Section fade-in animation on scroll
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("section-visible");
      }
    });
  }, observerOptions);

  document.querySelectorAll(".section-fade-in").forEach((section) => {
    observer.observe(section);
  });

  // Authentication Modal Logic
  const authModal = document.getElementById("authModal");
  const closeAuthModal = document.getElementById("closeAuthModal");

  // Open modal triggers - with null checks
  const navLoginBtn = document.getElementById("navLoginBtn");
  const navRegisterBtn = document.getElementById("navRegisterBtn");
  const mobileLoginBtn = document.getElementById("mobileLoginBtn");
  const mobileRegisterBtn = document.getElementById("mobileRegisterBtn");
  const heroGetStartedBtn = document.getElementById("heroGetStartedBtn");
  const ctaSignUpBtn = document.getElementById("ctaSignUpBtn");

  // User type selection
  const userBtn = document.getElementById("userBtn");
  const staffBtn = document.getElementById("staffBtn");
  const adminBtn = document.getElementById("adminBtn");

  const userSection = document.getElementById("userSection");
  const staffSection = document.getElementById("staffSection");
  const adminSection = document.getElementById("adminSection");

  // User authentication tabs
  const userSignUpTab = document.getElementById("userSignUpTab");
  const userSignInTab = document.getElementById("userSignInTab");
  const userSignUpForm = document.getElementById("userSignUpForm");
  const userSignInForm = document.getElementById("userSignInForm");
  const userSubmitBtn = document.getElementById("userSubmitBtn");

  // Staff authentication tabs
  const staffSignUpTab = document.getElementById("staffSignUpTab");
  const staffSignInTab = document.getElementById("staffSignInTab");
  const staffSignUpForm = document.getElementById("staffSignUpForm");
  const staffSignInForm = document.getElementById("staffSignInForm");
  const staffSubmitBtn = document.getElementById("staffSubmitBtn");

  // Admin authentication tabs
  const adminSignInTab = document.getElementById("adminSignInTab");
  const adminSignInForm = document.getElementById("adminSignInForm");
  const adminSubmitBtn = document.getElementById("adminSubmitBtn");

  // Function to open modal with specific user type and form
  function openAuthModal(userType = "user", formType = "signin") {
    if (!authModal) return;

    authModal.classList.remove("hidden");
    resetUserTypeButtons();
    hideAllSections();

    if (userType === "user") {
      if (userBtn) userBtn.classList.add("active");
      if (userSection) {
        userSection.classList.remove("hidden");
        userSection.classList.add("block");
      }

      if (formType === "signin" && userSignInTab) {
        userSignInTab.click();
      } else if (userSignUpTab) {
        userSignUpTab.click();
      }
    } else if (userType === "staff") {
      if (staffBtn) staffBtn.classList.add("active");
      if (staffSection) {
        staffSection.classList.remove("hidden");
        staffSection.classList.add("block");
      }

      if (formType === "signin" && staffSignInTab) {
        staffSignInTab.click();
      } else if (staffSignUpTab) {
        staffSignUpTab.click();
      }
    } else if (userType === "admin") {
      if (adminBtn) adminBtn.classList.add("active");
      if (adminSection) {
        adminSection.classList.remove("hidden");
        adminSection.classList.add("block");
      }
    }
  }

  // Function to reset all user type buttons
  function resetUserTypeButtons() {
    if (userBtn) userBtn.classList.remove("active");
    if (staffBtn) staffBtn.classList.remove("active");
    if (adminBtn) adminBtn.classList.remove("active");
  }

  // Function to hide all sections
  function hideAllSections() {
    if (userSection) {
      userSection.classList.add("hidden");
      userSection.classList.remove("block");
    }
    if (staffSection) {
      staffSection.classList.add("hidden");
      staffSection.classList.remove("block");
    }
    if (adminSection) {
      adminSection.classList.add("hidden");
      adminSection.classList.remove("block");
    }
  }

  // Helper function to get OTP value from input fields
  // Helper function to get OTP value from input fields - IMPROVED VERSION
function getOtpValue(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`OTP container not found: ${containerId}`);
    return '';
  }

  const inputs = container.querySelectorAll('.otp-input');
  console.log(`Found ${inputs.length} OTP inputs in ${containerId}`);
  
  let otp = '';
  inputs.forEach((input, index) => {
    console.log(`OTP input ${index}:`, input.value);
    otp += input.value || '';
  });
  
  console.log(`Final OTP for ${containerId}:`, otp);
  return otp;
}

  // Handle successful authentication - SIMPLIFIED VERSION FOR LOGIN ONLY
  function handleSuccessfulAuth(result, formElement, userRole) {
    console.log(`SUCCESSFUL RESPONSE RECEIVED FOR ROLE: ${userRole.toUpperCase()}`);
    console.log("Full result:", result);

    // Extract data based on different possible response structures
    const accessToken = result.accessToken || result.token || result.data?.accessToken;
    const userData = result.user || result.staff || result.admin || result.data?.user || result.data;

    if (accessToken && userData) {
      console.log("LOGIN SUCCESS - Storing token and data");

      // Clear previous tokens and store the new one
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      localStorage.removeItem("staffToken");
      localStorage.removeItem("staffData");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminData");

      // Store primary token and user object
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify({ ...userData, role: userRole }));

      // Store role-specific tokens for clarity
      if (userRole === 'admin') {
        localStorage.setItem("adminToken", accessToken);
        localStorage.setItem("adminData", JSON.stringify(userData));
      } else if (userRole === 'staff') {
        localStorage.setItem("staffToken", accessToken);
        localStorage.setItem("staffData", JSON.stringify(userData));
      }

      formElement.reset();
      if (authModal) authModal.classList.add("hidden");

      // Redirect based on role
      setTimeout(() => {
        console.log(`Redirecting to ${userRole} dashboard...`);
        if (userRole === 'user') {
          window.location.href = "home.html";
        } else if (userRole === 'staff') {
          window.location.href = "staff.html";
        } else if (userRole === 'admin') {
          window.location.href = "admin.html";
        }
      }, 500);
      return;
    }

    // Handle login success with message but no token (fallback)
    else if (result.message && (result.message.toLowerCase().includes("login") || result.message.toLowerCase().includes("success"))) {
      console.log("LOGIN SUCCESS (message-based)");
      formElement.reset();
      if (authModal) authModal.classList.add("hidden");

      // Still redirect even if no token (for demo purposes)
      setTimeout(() => {
        console.log(`Redirecting to ${userRole} dashboard...`);
        if (userRole === 'user') {
          window.location.href = "home.html";
        } else if (userRole === 'staff') {
          window.location.href = "staff.html";
        } else if (userRole === 'admin') {
          window.location.href = "admin.html";
        }
      }, 500);
    }
    // Fallback for any other successful operation with a message
    else if (result.message) {
      console.log("GENERIC SUCCESS");
      formElement.reset();
      if (authModal) authModal.classList.add("hidden");
      alert(result.message);
    }
    // Final fallback
    else {
      console.warn("No specific success handler matched");
      formElement.reset();
      if (authModal) authModal.classList.add("hidden");
      alert("Login completed successfully");
    }
  }

  // --- SIMPLIFIED FORM SUBMISSION LOGIC FOR LOGIN ---
  // --- CORRECTED FORM SUBMISSION LOGIC ---
  async function handleFormSubmission(
    formElement,
    submitBtnElement,
    userRole, // 'user', 'staff', or 'admin'
    isSignUp = false,
    isOtpLogin = false
  ) {
    console.log("🔍 FORM SUBMISSION DEBUG:", {
      role: userRole,
      isSignUp: isSignUp,
      isOtpLogin: isOtpLogin,
      formId: formElement?.id
    });

    if (!formElement || !submitBtnElement) {
      console.error("Form element or submit button not found");
      return;
    }

    const originalText = submitBtnElement.textContent;
    submitBtnElement.disabled = true;
    submitBtnElement.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';

    let payload = {};
    let endpoint = "";
    let validationError = false;
    let identifierName = "";

    // --- DETERMINE PAYLOAD AND ENDPOINT ---
    if (userRole === "user") {
      identifierName = "email/phone";
      if (isSignUp) {
        endpoint = "/api/users/signup";
        const formData = new FormData(formElement);
        payload = Object.fromEntries(formData.entries());
        if (payload.password !== payload.confirmPassword) {
          alert("Error: Passwords do not match.");
          validationError = true;
        }
        delete payload.confirmPassword;
        delete payload.userTerms;
      } else {
        if (isOtpLogin) {
          endpoint = "/api/otp/login/user";
          const otp = getOtpValue('userLoginOtpInputs');
          const identifier = document.getElementById('userOtpIdentifier')?.value;
          console.log("🔍 User OTP Data:", { identifier, otp, otpLength: otp?.length });

          if (!identifier || !otp || otp.length !== 6) {
            alert(`Please enter a valid ${identifierName} and a 6-digit OTP.`);
            validationError = true;
          } else {
            payload = { identifier, otp };
          }
        } else {
          endpoint = "/api/users/login";
          const identifier = document.querySelector('#userSignInForm input[name="loginIdentifier"]')?.value;
          const password = document.querySelector('#userSignInForm input[name="password"]')?.value;
          if (!identifier || !password) {
            alert(`Please enter both ${identifierName} and password.`);
            validationError = true;
          } else {
            payload = { identifier, password };
          }
        }
      }
    } else if (userRole === "staff") {
      identifierName = "Staff ID/Email";
      if (isSignUp) {
        endpoint = "/api/staff/register";
        const formData = new FormData(formElement);
        payload = Object.fromEntries(formData.entries());
        if (payload.password !== payload.confirmPassword) {
          alert("Error: Passwords do not match.");
          validationError = true;
        }
        delete payload.confirmPassword;
        delete payload.staffTerms;
      } else {
        if (isOtpLogin) {
          endpoint = "/api/otp/login/staff";
          const otp = getOtpValue('staffLoginOtpInputs');
          const identifier = document.getElementById('staffOtpIdentifier')?.value;
          console.log("🔍 Staff OTP Data:", { identifier, otp, otpLength: otp?.length });

          if (!identifier || !otp || otp.length !== 6) {
            alert(`Please enter a valid ${identifierName} and a 6-digit OTP.`);
            validationError = true;
          } else {
            payload = { identifier, otp };
          }
        } else {
          endpoint = "/api/staff/login";
          const identifier = document.querySelector('#staffSignInForm input[name="identifier"]')?.value;
          const password = document.querySelector('#staffSignInForm input[name="password"]')?.value;
          if (!identifier || !password) {
            alert(`Please enter both ${identifierName} and password.`);
            validationError = true;
          } else {
            payload = { identifier, password };
          }
        }
      }
    } else if (userRole === "admin") {
      identifierName = "Admin ID";
      if (isOtpLogin) {
        endpoint = "/api/otp/login/admin";
        const otp = getOtpValue('adminLoginOtpInputs');
        const identifier = document.getElementById('adminOtpIdentifier')?.value;

        console.log("🔍 Admin OTP Data:", {
          identifier,
          otp,
          otpLength: otp?.length,
          otpInputs: document.querySelectorAll('#adminLoginOtpInputs .otp-input').length
        });

        // Debug: Check each OTP input value
        const otpInputs = document.querySelectorAll('#adminLoginOtpInputs .otp-input');
        otpInputs.forEach((input, index) => {
          console.log(`OTP Input ${index}:`, input.value);
        });

        if (!identifier) {
          alert(`Please enter a valid ${identifierName}.`);
          validationError = true;
        } else if (!otp || otp.length !== 6) {
          alert("Please enter a valid 6-digit OTP.");
          validationError = true;
        } else {
          // FIXED: Use identifier instead of adminId for admin OTP login
          payload = { identifier, otp };
        }
      } else {
        endpoint = "/api/admin/login";
        const adminIdInput = document.querySelector('#adminSignInForm input[name="adminId"]');
        const passwordInput = document.querySelector('#adminSignInForm input[name="password"]');

        const adminId = adminIdInput?.value;
        const password = passwordInput?.value;

        console.log("🔍 Admin Password Data:", { adminId, password });

        if (!adminId || !password) {
          alert(`Please enter both ${identifierName} and password.`);
          validationError = true;
        } else {
          payload = { adminId, password };
        }
      }
    }

    if (validationError) {
      submitBtnElement.disabled = false;
      submitBtnElement.textContent = originalText;
      return;
    }

    console.log("SENDING REQUEST to:", BASE_URL + endpoint);
    console.log("Payload being sent:", payload);

    // --- EXECUTE API CALL ---
    try {
      const response = await fetch(BASE_URL + endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Add detailed debug logging
      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log("Raw response text:", responseText);

      if (!response.ok) {
        let errorMessage = `Server returned status ${response.status}`;
        if (responseText) {
          try {
            const errorResult = JSON.parse(responseText);
            errorMessage = errorResult.message || JSON.stringify(errorResult);
          } catch (e) {
            errorMessage = `Server returned status ${response.status}: ${responseText}`;
          }
        }
        throw new Error(errorMessage);
      }

      let result;
      try {
        result = JSON.parse(responseText);
        console.log("Parsed response result:", result);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        result = { message: responseText };
      }

      handleSuccessfulAuth(result, formElement, userRole);

    } catch (error) {
      console.error("SUBMISSION FAILED:");
      console.error("Error message:", error.message);

      let userFriendlyMessage = error.message.includes("Failed to fetch")
        ? "Network error: Cannot connect to server. Is the backend running on port 3000?"
        : error.message;

      alert(`Error: ${userFriendlyMessage}`);
    } finally {
      submitBtnElement.disabled = false;
      submitBtnElement.textContent = originalText;
      console.log("Form submission process completed");
    }
  }
  // Event listeners for opening modal
  if (navLoginBtn) {
    navLoginBtn.addEventListener("click", () => openAuthModal("user", "signin"));
  }

  if (navRegisterBtn) {
    navRegisterBtn.addEventListener("click", () => openAuthModal("user", "signup"));
  }

  if (mobileLoginBtn) {
    mobileLoginBtn.addEventListener("click", () => {
      openAuthModal("user", "signin");
      const mobileMenu = document.getElementById("mobile-menu");
      if (mobileMenu) mobileMenu.classList.add("hidden");
    });
  }

  if (mobileRegisterBtn) {
    mobileRegisterBtn.addEventListener("click", () => {
      openAuthModal("user", "signup");
      const mobileMenu = document.getElementById("mobile-menu");
      if (mobileMenu) mobileMenu.classList.add("hidden");
    });
  }

  if (heroGetStartedBtn) {
    heroGetStartedBtn.addEventListener("click", () => openAuthModal("user", "signup"));
  }

  if (ctaSignUpBtn) {
    ctaSignUpBtn.addEventListener("click", () => openAuthModal("user", "signup"));
  }

  // Close modal
  if (closeAuthModal) {
    closeAuthModal.addEventListener("click", () => {
      if (authModal) authModal.classList.add("hidden");
    });
  }

  // Close modal when clicking outside
  if (authModal) {
    authModal.addEventListener("click", (e) => {
      if (e.target === authModal) {
        authModal.classList.add("hidden");
      }
    });
  }

  // User type button event listeners
  if (userBtn) {
    userBtn.addEventListener("click", () => {
      openAuthModal("user", "signin");
    });
  }

  if (staffBtn) {
    staffBtn.addEventListener("click", () => {
      openAuthModal("staff", "signin");
    });
  }

  if (adminBtn) {
    adminBtn.addEventListener("click", () => {
      openAuthModal("admin", "signin");
    });
  }

  // User authentication tab switching
  if (userSignUpTab) {
    userSignUpTab.addEventListener("click", () => {
      userSignUpTab.classList.add("active");
      if (userSignInTab) userSignInTab.classList.remove("active");
      if (userSignUpForm) userSignUpForm.classList.remove("hidden");
      if (userSignInForm) userSignInForm.classList.add("hidden");
      if (userSubmitBtn) userSubmitBtn.textContent = "SIGN UP";
      resetLoginMethod('user');
    });
  }

  if (userSignInTab) {
    userSignInTab.addEventListener("click", () => {
      userSignInTab.classList.add("active");
      if (userSignUpTab) userSignUpTab.classList.remove("active");
      if (userSignInForm) userSignInForm.classList.remove("hidden");
      if (userSignUpForm) userSignUpForm.classList.add("hidden");
      if (userSubmitBtn) userSubmitBtn.textContent = "SIGN IN";
      resetLoginMethod('user');
    });
  }

  // Staff authentication tab switching
  if (staffSignUpTab) {
    staffSignUpTab.addEventListener("click", () => {
      staffSignUpTab.classList.add("active");
      if (staffSignInTab) staffSignInTab.classList.remove("active");
      if (staffSignUpForm) staffSignUpForm.classList.remove("hidden");
      if (staffSignInForm) staffSignInForm.classList.add("hidden");
      if (staffSubmitBtn) staffSubmitBtn.textContent = "REGISTER AS STAFF";
      resetLoginMethod('staff');
    });
  }

  if (staffSignInTab) {
    staffSignInTab.addEventListener("click", () => {
      staffSignInTab.classList.add("active");
      if (staffSignUpTab) staffSignUpTab.classList.remove("active");
      if (staffSignInForm) staffSignInForm.classList.remove("hidden");
      if (staffSignUpForm) staffSignUpForm.classList.add("hidden");
      if (staffSubmitBtn) staffSubmitBtn.textContent = "STAFF LOGIN";
      resetLoginMethod('staff');
    });
  }

  // Admin authentication tab switching
  if (adminSignInTab) {
    adminSignInTab.addEventListener("click", () => {
      adminSignInTab.classList.add("active");
      if (adminSignInForm) adminSignInForm.classList.remove("hidden");
      resetLoginMethod('admin');
    });
  }

  // Reset login method to password
  function resetLoginMethod(formType) {
    const passwordBtn = document.querySelector(`.login-method-btn[data-form="${formType}"][data-method="password"]`);
    const otpBtn = document.querySelector(`.login-method-btn[data-form="${formType}"][data-method="otp"]`);

    if (passwordBtn && otpBtn) {
      passwordBtn.classList.add('selected');
      otpBtn.classList.remove('selected');

      // Show password fields, hide OTP fields
      if (formType === 'user') {
        document.getElementById('userPasswordFields').classList.remove('hidden');
        document.getElementById('userOtpFields').classList.add('hidden');
        document.getElementById('userLoginOtpSection').classList.add('hidden');
      } else if (formType === 'staff') {
        document.getElementById('staffPasswordFields').classList.remove('hidden');
        document.getElementById('staffOtpFields').classList.add('hidden');
        document.getElementById('staffLoginOtpSection').classList.add('hidden');
      } else if (formType === 'admin') {
        document.getElementById('adminPasswordFields').classList.remove('hidden');
        document.getElementById('adminOtpFields').classList.add('hidden');
        document.getElementById('adminLoginOtpSection').classList.add('hidden');
      }
    }
  }

  // --- FORM SUBMISSION HANDLERS ---

  // User Submission
  if (userSubmitBtn) {
    userSubmitBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const isSignUp = userSignUpForm && !userSignUpForm.classList.contains("hidden");
      const isOtpSelected = document.querySelector('.login-method-btn[data-form="user"][data-method="otp"]')?.classList.contains('selected');
      const formElement = isSignUp ? userSignUpForm : userSignInForm;

      if (formElement) {
        handleFormSubmission(formElement, userSubmitBtn, "user", isSignUp, isOtpSelected);
      }
    });
  }

  // Staff Submission
  if (staffSubmitBtn) {
    staffSubmitBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const isSignUp = staffSignUpForm && !staffSignUpForm.classList.contains("hidden");
      const isOtpSelected = document.querySelector('.login-method-btn[data-form="staff"][data-method="otp"]')?.classList.contains('selected');
      const formElement = isSignUp ? staffSignUpForm : staffSignInForm;

      if (formElement) {
        handleFormSubmission(formElement, staffSubmitBtn, "staff", isSignUp, isOtpSelected);
      }
    });
  }

  // Admin Submission (Always Sign In)
  if (adminSubmitBtn) {
    adminSubmitBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const isOtpSelected = document.querySelector('.login-method-btn[data-form="admin"][data-method="otp"]')?.classList.contains('selected');

      if (adminSignInForm) {
        handleFormSubmission(adminSignInForm, adminSubmitBtn, "admin", false, isOtpSelected);
      }
    });
  }

  function checkLoginAndRedirect() {
    const accessToken = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("user");

    if (accessToken && userData) {
      try {
        const user = JSON.parse(userData);
        console.log("User already logged in. Redirecting...");

        if (user.role === 'user') {
          window.location.href = "home.html";
        } else if (user.role === 'staff') {
          window.location.href = "staff.html";
        } else if (user.role === 'admin') {
          window.location.href = "admin.html";
        }
      } catch (e) {
        console.error("Could not parse user data from localStorage:", e);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      }
    }
  }

  // Check login status on page load
  checkLoginAndRedirect();

  // OTP Input Handling
  function setupOtpInputs(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const inputs = container.querySelectorAll(".otp-input");

    inputs.forEach((input, index) => {
      input.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');

        if (e.target.value.length === 1 && index < inputs.length - 1) {
          inputs[index + 1].focus();
        }

        const allFilled = Array.from(inputs).every(input => input.value.length === 1);
        if (allFilled && containerId.includes('Login')) {
          const formType = containerId.replace('LoginOtpInputs', '').toLowerCase();
          if (formType === 'user' && userSubmitBtn && !userSignUpForm.classList.contains('hidden')) {
            userSubmitBtn.click();
          } else if (formType === 'staff' && staffSubmitBtn && !staffSignUpForm.classList.contains('hidden')) {
            staffSubmitBtn.click();
          } else if (formType === 'admin' && adminSubmitBtn) {
            adminSubmitBtn.click();
          }
        }
      });

      input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !e.target.value && index > 0) {
          inputs[index - 1].focus();
        }
      });

      input.addEventListener("paste", (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
        if (pasteData.length === 6) {
          const digits = pasteData.split('');
          inputs.forEach((input, i) => {
            if (i < 6) input.value = digits[i] || '';
          });
          if (index < 5) inputs[5].focus();
        }
      });
    });
  }

  // Setup OTP inputs for all sections
  setupOtpInputs("userSignupOtpInputs");
  setupOtpInputs("userLoginOtpInputs");
  setupOtpInputs("staffSignupOtpInputs");
  setupOtpInputs("staffLoginOtpInputs");
  setupOtpInputs("adminLoginOtpInputs");

  // Login Method Selection
  document.querySelectorAll(".login-method-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const formType = this.getAttribute("data-form");
      const method = this.getAttribute("data-method");

      document.querySelectorAll(`.login-method-btn[data-form="${formType}"]`).forEach((b) => {
        b.classList.remove("selected");
      });
      this.classList.add("selected");

      if (formType === "user") {
        document.getElementById("userPasswordFields").classList.toggle("hidden", method !== "password");
        document.getElementById("userOtpFields").classList.toggle("hidden", method !== "otp");
        if (method === "password") {
          document.getElementById("userLoginOtpSection").classList.add("hidden");
        }
      } else if (formType === "staff") {
        document.getElementById("staffPasswordFields").classList.toggle("hidden", method !== "password");
        document.getElementById("staffOtpFields").classList.toggle("hidden", method !== "otp");
        if (method === "password") {
          document.getElementById("staffLoginOtpSection").classList.add("hidden");
        }
      } else if (formType === "admin") {
        document.getElementById("adminPasswordFields").classList.toggle("hidden", method !== "password");
        document.getElementById("adminOtpFields").classList.toggle("hidden", method !== "otp");
        if (method === "password") {
          document.getElementById("adminLoginOtpSection").classList.add("hidden");
        }
      }
    });
  });

  // Send OTP Button Handlers - UPDATED FOR ADMIN
  document.querySelectorAll('[id$="SendOtpBtn"]').forEach((btn) => {
    btn.addEventListener("click", async function () {
      const formType = this.id.replace("SendOtpBtn", "").toLowerCase();
      const identifierInput = document.getElementById(`${formType}OtpIdentifier`);

      if (!identifierInput || !identifierInput.value) {
        alert("Please enter your email or phone number");
        return;
      }

      this.disabled = true;
      const originalText = this.innerHTML;
      this.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending...';

      try {
        // Determine user type for OTP request
        let userType = "user";
        if (formType.includes("staff")) userType = "staff";
        if (formType.includes("admin")) userType = "admin";

        const response = await fetch(`${BASE_URL}/api/otp/request`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identifier: identifierInput.value,
            purpose: "login",
            userType: userType // CRITICAL: Tell backend which user type
          }),
        });

        if (response.ok) {
          const result = await response.json();
          alert(result.message || `OTP sent to ${identifierInput.value}`);
          document.getElementById(`${formType}LoginOtpSection`).classList.remove("hidden");
        } else {
          const error = await response.json();
          alert(error.message || "Failed to send OTP. Please try again.");
        }
      } catch (error) {
        console.error("Error sending OTP:", error);
        alert("Network error: Failed to send OTP. Please check your connection.");
      } finally {
        this.disabled = false;
        this.innerHTML = originalText;
      }
    });
  });

  // Resend OTP Button Handlers
  document.querySelectorAll('[id*="Resend"]').forEach((btn) => {
    btn.addEventListener("click", async function () {
      const formType = this.id.includes('user') ? 'user' :
        this.id.includes('staff') ? 'staff' : 'admin';
      const identifierInput = document.getElementById(`${formType}OtpIdentifier`);

      if (!identifierInput || !identifierInput.value) {
        alert("Please enter your email or phone number first");
        return;
      }

      this.disabled = true;
      const originalText = this.innerHTML;
      this.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Resending...';

      try {
        const response = await fetch(`${BASE_URL}/api/otp/resend`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identifier: identifierInput.value
          }),
        });

        if (response.ok) {
          const result = await response.json();
          alert(result.message || "OTP has been resent");
        } else {
          const error = await response.json();
          alert(error.message || "Failed to resend OTP. Please try again.");
        }
      } catch (error) {
        console.error("Error resending OTP:", error);
        alert("Network error: Failed to resend OTP. Please check your connection.");
      } finally {
        setTimeout(() => {
          this.disabled = false;
          this.innerHTML = originalText;
        }, 30000);
      }
    });
  });

  // Forgot Password Handlers
  document.querySelectorAll('[id*="ForgotPassword"]').forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      alert("Password reset instructions will be sent to your registered email");
    });
  });

  // Debug info
  console.log("TOKEN DEBUG INFO:");
  console.log("adminToken:", localStorage.getItem("adminToken"));
  console.log("accessToken:", localStorage.getItem("accessToken"));
  console.log("staffToken:", localStorage.getItem("staffToken"));
  console.log("user:", localStorage.getItem("user"));
  console.log("adminData:", localStorage.getItem("adminData"));
}); // END OF DOMContentLoaded