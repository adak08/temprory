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
  function openAuthModal(userType = "user", formType = "signup") {
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

  // --- CORE FORM SUBMISSION LOGIC ---
  async function handleFormSubmission(
    formElement,
    submitBtnElement,
    endpoint,
    successMessage,
    isSignUp = false,
    isStaff = false,
    isOtpLogin = false
  ) {
    if (!formElement || !submitBtnElement) {
      console.error("Form element or submit button not found");
      return;
    }

    // Prevent double submission
    const originalText = submitBtnElement.textContent;
    submitBtnElement.disabled = true;
    submitBtnElement.textContent = "Processing...";

    // Prepare data structure for the backend
    let payload = {};
    let validationError = false;
    
    if (isSignUp && !isStaff) {
      // User Signup - Use FormData for all fields
      const formData = new FormData(formElement);
      const data = Object.fromEntries(formData.entries());

      console.log("🔍 User Signup Form data collected:", data);

      // Password Mismatch Check
      if (data.password !== data.confirmPassword) {
        alert("Error: Passwords do not match.");
        submitBtnElement.disabled = false;
        submitBtnElement.textContent = originalText;
        return;
      }

      // Client-side validation
      if (!data.name || !data.email || !data.password || !data.phone) {
        alert("Please fill all required fields");
        submitBtnElement.disabled = false;
        submitBtnElement.textContent = originalText;
        return;
      }

      payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        street: data.street || "",
        city: data.city || "",
        state: data.state || "",
        pincode: data.pincode || "",
      };
    } else if (!isSignUp && !isStaff) {
      // User Sign In
      if (isOtpLogin) {
        // OTP Login - Only collect OTP fields
        const otp = getOtpValue('userLoginOtpInputs');
        const otpIdentifier = document.getElementById('userOtpIdentifier')?.value;

        if (!otpIdentifier) {
          alert("Please enter your email or phone number");
          validationError = true;
        } else if (!otp || otp.length !== 6) {
          alert("Please enter a valid 6-digit OTP");
          validationError = true;
        }

        if (validationError) {
          submitBtnElement.disabled = false;
          submitBtnElement.textContent = originalText;
          return;
        }

        payload = {
          identifier: otpIdentifier,
          otp: otp
        };
        console.log("🔍 User OTP Login data:", payload);
      } else {
        // Password Login - Only collect password fields
        const loginIdentifier = document.querySelector('#userSignInForm input[name="loginIdentifier"]')?.value;
        const password = document.querySelector('#userSignInForm input[name="password"]')?.value;

        if (!loginIdentifier || !password) {
          alert("Please enter both email/phone and password");
          submitBtnElement.disabled = false;
          submitBtnElement.textContent = originalText;
          return;
        }

        // FIXED: Use 'identifier' instead of 'email' for password login
        payload = {
          identifier: loginIdentifier,
          password: password,
        };
        console.log("🔍 User Password Login data:", payload);
      }
    } else if (isStaff && isSignUp) {
      // Staff Signup - Use FormData for all fields
      const formData = new FormData(formElement);
      const data = Object.fromEntries(formData.entries());

      console.log("🔍 Staff Signup Form data collected:", data);

      // Password Mismatch Check
      if (data.password !== data.confirmPassword) {
        alert("Error: Passwords do not match.");
        submitBtnElement.disabled = false;
        submitBtnElement.textContent = originalText;
        return;
      }

      // Client-side validation
      if (!data.name || !data.email || !data.staffId || !data.password || !data.phone) {
        alert("Please fill all required fields");
        submitBtnElement.disabled = false;
        submitBtnElement.textContent = originalText;
        return;
      }

      payload = {
        name: data.name,
        email: data.email,
        staffId: data.staffId,
        phone: data.phone,
        password: data.password,
      };
    } else if (isStaff && !isSignUp) {
      // Staff Sign In
      if (isOtpLogin) {
        // OTP Login - Only collect OTP fields
        const otp = getOtpValue('staffLoginOtpInputs');
        const otpIdentifier = document.getElementById('staffOtpIdentifier')?.value;

        if (!otpIdentifier) {
          alert("Please enter your Staff ID, email or phone number");
          validationError = true;
        } else if (!otp || otp.length !== 6) {
          alert("Please enter a valid 6-digit OTP");
          validationError = true;
        }

        if (validationError) {
          submitBtnElement.disabled = false;
          submitBtnElement.textContent = originalText;
          return;
        }

        payload = {
          identifier: otpIdentifier,
          otp: otp
        };
        console.log("🔍 Staff OTP Login data:", payload);
      } else {
        // Password Login - Only collect password fields
        const staffIdOrEmail = document.querySelector('#staffSignInForm input[name="staffIdOrEmail"]')?.value;
        const password = document.querySelector('#staffSignInForm input[name="password"]')?.value;

        if (!staffIdOrEmail || !password) {
          alert("Please enter both Staff ID/Email and password");
          submitBtnElement.disabled = false;
          submitBtnElement.textContent = originalText;
          return;
        }

        // FIXED: Use 'identifier' instead of 'staffIdOrEmail' for password login
        payload = {
          identifier: staffIdOrEmail,
          password: password,
        };
        console.log("🔍 Staff Password Login data:", payload);
      }
    } else {
      // Admin Sign In
      if (isOtpLogin) {
        // OTP Login - Only collect OTP fields
        const otp = getOtpValue('adminLoginOtpInputs');
        const otpIdentifier = document.getElementById('adminOtpIdentifier')?.value;

        if (!otpIdentifier) {
          alert("Please enter your Admin ID");
          validationError = true;
        } else if (!otp || otp.length !== 6) {
          alert("Please enter a valid 6-digit OTP");
          validationError = true;
        }

        if (validationError) {
          submitBtnElement.disabled = false;
          submitBtnElement.textContent = originalText;
          return;
        }

        payload = {
          identifier: otpIdentifier,
          otp: otp
        };
        console.log("🔍 Admin OTP Login data:", payload);
      } else {
        // Password Login - Only collect password fields
        const adminId = document.querySelector('#adminSignInForm input[name="adminId"]')?.value;
        const password = document.querySelector('#adminSignInForm input[name="password"]')?.value;

        if (!adminId || !password) {
          alert("Please enter both Admin ID and password");
          submitBtnElement.disabled = false;
          submitBtnElement.textContent = originalText;
          return;
        }

        // FIXED: Use 'identifier' instead of 'adminId' for password login
        payload = {
          identifier: adminId,
          password: password,
        };
        console.log("🔍 Admin Password Login data:", payload);
      }
    }

    const finalUrl = BASE_URL + endpoint;

    console.log("SENDING REQUEST:");
    console.log("URL:", finalUrl);
    console.log("Method: POST");
    console.log("Payload:", payload);
    console.log("Is Signup:", isSignUp);
    console.log("Is Staff:", isStaff);
    console.log("Is OTP Login:", isOtpLogin);

    try {
      const response = await fetch(finalUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("RESPONSE RECEIVED:");
      console.log("Status:", response.status);
      console.log("Status Text:", response.statusText);
      console.log("OK:", response.ok);

      const responseText = await response.text();
      console.log("Raw Response Text:", responseText);

      // Check if the server responded but with an error status
      if (!response.ok) {
        console.log("SERVER RETURNED ERROR STATUS");

        let errorMessage = `Server returned status ${response.status}`;

        if (responseText) {
          try {
            const errorResult = JSON.parse(responseText);
            errorMessage =
              errorResult.message ||
              errorResult.error ||
              JSON.stringify(errorResult);
          } catch (e) {
            errorMessage = `Server returned status ${response.status}: ${responseText}`;
          }
        }

        console.log("Error Message:", errorMessage);
        throw new Error(errorMessage);
      }

      // If we got here, response is OK (200-299)
      console.log("SERVER RETURNED SUCCESS STATUS");

      let result;
      if (responseText) {
        try {
          result = JSON.parse(responseText);
          console.log("Parsed JSON Result:", result);
        } catch (e) {
          console.error("Failed to parse JSON:", e);
          throw new Error("Server returned invalid JSON response");
        }
      } else {
        console.warn("Server returned empty response");
        result = { message: "Empty response from server" };
      }

      console.log("SUCCESS - Processing result:", result);

      // Handle successful authentication
      handleSuccessfulAuth(result, formElement, endpoint, isSignUp, isStaff);
      
    } catch (error) {
      console.error("SUBMISSION FAILED:");
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);

      let userFriendlyMessage = error.message;

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        userFriendlyMessage =
          "Network error: Cannot connect to server. Make sure the backend is running.";
      } else if (error.message.includes("Failed to fetch")) {
        userFriendlyMessage =
          "Network error: Cannot connect to server. Check if the backend is running on port 3000.";
      } else if (error.message.includes("CORS")) {
        userFriendlyMessage =
          "CORS error: Browser blocked the request. Check server CORS configuration.";
      }

      alert(`Error: ${userFriendlyMessage}`);
    } finally {
      submitBtnElement.disabled = false;
      submitBtnElement.textContent = originalText;
      console.log("Form submission process completed");
    }
  }

  // Helper function to get OTP value from input fields
  function getOtpValue(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return '';
    
    const inputs = container.querySelectorAll('.otp-input');
    let otp = '';
    inputs.forEach(input => {
      otp += input.value || '';
    });
    return otp;
  }

  // Handle successful authentication
  function handleSuccessfulAuth(result, formElement, endpoint, isSignUp, isStaff) {
    // Check if this is an ADMIN login
    if ((endpoint === "/api/admin/login" || endpoint === "/api/otp/login/admin") && result.accessToken) {
      console.log("ADMIN LOGIN DETECTED - Storing admin token");
      localStorage.setItem("adminToken", result.accessToken);
      if (result.admin) {
        localStorage.setItem("adminData", JSON.stringify(result.admin));
      }
      formElement.reset();
      if (authModal) authModal.classList.add("hidden");

      setTimeout(() => {
        console.log("Redirecting to admin dashboard...");
        window.location.href = "admin.html";
      }, 500);
    }
    // Check if this is a USER login
    else if (result.accessToken && result.user) {
      console.log("USER LOGIN DETECTED - Storing user token and data");
      localStorage.setItem("accessToken", result.accessToken);
      localStorage.setItem("user", JSON.stringify(result.user));

      formElement.reset();
      if (authModal) authModal.classList.add("hidden");

      setTimeout(() => {
        console.log("Redirecting to user homepage...");
        window.location.href = "home.html";
      }, 500);
    }
    // Check if this is a STAFF login
    else if ((endpoint === "/api/staff/login" || endpoint === "/api/otp/login/staff") && result.accessToken) {
      console.log("STAFF LOGIN DETECTED - Storing staff token");
      localStorage.setItem("staffToken", result.accessToken);
      if (result.staff) {
        localStorage.setItem("staffData", JSON.stringify(result.staff));
      }
      formElement.reset();
      if (authModal) authModal.classList.add("hidden");

      setTimeout(() => {
        console.log("Redirecting to staff dashboard...");
        window.location.href = "staff.html";
      }, 500);
    }
    // Handle new response format with data object
    else if (result.success && result.data) {
      const { accessToken, user } = result.data;
      
      if (accessToken && user) {
        console.log(`${user.role.toUpperCase()} LOGIN SUCCESS - Storing token and data`);
        
        // Store token and user data
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("user", JSON.stringify(user));
        
        // Store role-specific tokens
        if (user.role === 'admin') {
          localStorage.setItem("adminToken", accessToken);
          localStorage.setItem("adminData", JSON.stringify(user));
        } else if (user.role === 'staff') {
          localStorage.setItem("staffToken", accessToken);
          localStorage.setItem("staffData", JSON.stringify(user));
        }
        
        formElement.reset();
        if (authModal) authModal.classList.add("hidden");

        // Redirect based on role
        setTimeout(() => {
          console.log(`Redirecting to ${user.role} dashboard...`);
          if (user.role === 'user') {
            window.location.href = "home.html";
          } else if (user.role === 'staff') {
            window.location.href = "staff.html";
          } else if (user.role === 'admin') {
            window.location.href = "admin.html";
          }
        }, 500);
        return;
      }
    }
    // Handle successful signups
    else if (
      isSignUp &&
      result.message &&
      result.message.toLowerCase().includes("success")
    ) {
      console.log("SIGNUP SUCCESSFUL");
      formElement.reset();
      if (authModal) authModal.classList.add("hidden");
      setTimeout(() => {
        alert("Registration successful! Please login with your credentials.");
        if (isStaff) {
          openAuthModal("staff", "signin");
        } else {
          openAuthModal("user", "signin");
        }
      }, 500);
    }
    // Generic success case
    else if (result.message) {
      console.log("OPERATION COMPLETED SUCCESSFULLY");
      formElement.reset();
      if (authModal) authModal.classList.add("hidden");
      alert(result.message);
    }
    // Fallback
    else {
      console.warn("No specific success handler matched");
      formElement.reset();
      if (authModal) authModal.classList.add("hidden");
      alert("Operation completed successfully");
    }
  }

  // Event listeners for opening modal - with null checks
  if (navLoginBtn) {
    navLoginBtn.addEventListener("click", () =>
      openAuthModal("user", "signin")
    );
  }

  if (navRegisterBtn) {
    navRegisterBtn.addEventListener("click", () =>
      openAuthModal("user", "signup")
    );
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
    heroGetStartedBtn.addEventListener("click", () =>
      openAuthModal("user", "signup")
    );
  }

  if (ctaSignUpBtn) {
    ctaSignUpBtn.addEventListener("click", () =>
      openAuthModal("user", "signup")
    );
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
      resetUserTypeButtons();
      userBtn.classList.add("active");
      hideAllSections();
      if (userSection) {
        userSection.classList.remove("hidden");
        userSection.classList.add("block");
      }
      if (userSignUpTab) userSignUpTab.click();
    });
  }

  if (staffBtn) {
    staffBtn.addEventListener("click", () => {
      resetUserTypeButtons();
      staffBtn.classList.add("active");
      hideAllSections();
      if (staffSection) {
        staffSection.classList.remove("hidden");
        staffSection.classList.add("block");
      }
      if (staffSignUpTab) staffSignUpTab.click();
    });
  }

  if (adminBtn) {
    adminBtn.addEventListener("click", () => {
      resetUserTypeButtons();
      adminBtn.classList.add("active");
      hideAllSections();
      if (adminSection) {
        adminSection.classList.remove("hidden");
        adminSection.classList.add("block");
      }
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
      // Reset login method to password when switching tabs
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
      // Reset login method to password when switching tabs
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
      // Reset login method to password when switching tabs
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
      // Reset login method to password when switching tabs
      resetLoginMethod('staff');
    });
  }

  // Admin authentication tab switching
  if (adminSignInTab) {
    adminSignInTab.addEventListener("click", () => {
      adminSignInTab.classList.add("active");
      if (adminSignInForm) adminSignInForm.classList.remove("hidden");
      // Reset login method to password when switching tabs
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
      const isSignUp =
        userSignUpForm && !userSignUpForm.classList.contains("hidden");
      const formElement = isSignUp ? userSignUpForm : userSignInForm;
      
      let endpoint, message, isOtpLogin = false;
      
      if (isSignUp) {
        endpoint = "/api/users/signup";
        message = "User Registration Successful";
      } else {
        // Check if OTP login is selected
        const isOtpSelected = document.querySelector('.login-method-btn[data-form="user"][data-method="otp"]').classList.contains('selected');
        if (isOtpSelected) {
          endpoint = "/api/otp/login/user";
          message = "User Login Successful";
          isOtpLogin = true;
        } else {
          endpoint = "/api/users/login";
          message = "User Login Successful";
        }
      }

      if (formElement) {
        handleFormSubmission(
          formElement,
          userSubmitBtn,
          endpoint,
          message,
          isSignUp,
          false,
          isOtpLogin
        );
      }
    });
  }

  // Staff Submission
  if (staffSubmitBtn) {
    staffSubmitBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const isSignUp =
        staffSignUpForm && !staffSignUpForm.classList.contains("hidden");
      const formElement = isSignUp ? staffSignUpForm : staffSignInForm;
      
      let endpoint, message, isOtpLogin = false;
      
      if (isSignUp) {
        endpoint = "/api/staff/register";
        message = "Staff Registration Successful";
      } else {
        // Check if OTP login is selected
        const isOtpSelected = document.querySelector('.login-method-btn[data-form="staff"][data-method="otp"]').classList.contains('selected');
        if (isOtpSelected) {
          endpoint = "/api/otp/login/staff";
          message = "Staff Login Successful";
          isOtpLogin = true;
        } else {
          endpoint = "/api/staff/login";
          message = "Staff Login Successful";
        }
      }

      if (formElement) {
        handleFormSubmission(
          formElement,
          staffSubmitBtn,
          endpoint,
          message,
          isSignUp,
          true,
          isOtpLogin
        );
      }
    });
  }

  // Admin Submission
  if (adminSubmitBtn) {
    adminSubmitBtn.addEventListener("click", (e) => {
      e.preventDefault();
      
      let endpoint, message, isOtpLogin = false;
      
      // Check if OTP login is selected
      const isOtpSelected = document.querySelector('.login-method-btn[data-form="admin"][data-method="otp"]').classList.contains('selected');
      if (isOtpSelected) {
        endpoint = "/api/otp/login/admin";
        message = "Admin Login Successful";
        isOtpLogin = true;
      } else {
        endpoint = "/api/admin/login";
        message = "Admin Login Successful";
      }

      if (adminSignInForm) {
        handleFormSubmission(
          adminSignInForm,
          adminSubmitBtn,
          endpoint,
          message,
          false,
          false,
          isOtpLogin
        );
      }
    });
  }

  function checkLoginAndRedirect() {
    const accessToken = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("user");

    if (accessToken && userData) {
      const user = JSON.parse(userData);
      console.log("User already logged in. Redirecting...");
      
      if (user.role === 'user') {
        window.location.href = "home.html";
      } else if (user.role === 'staff') {
        window.location.href = "staff.html";
      } else if (user.role === 'admin') {
        window.location.href = "admin.html";
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
        // Only allow numbers
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        
        if (e.target.value.length === 1 && index < inputs.length - 1) {
          inputs[index + 1].focus();
        }
        
        // Auto-submit when all OTP digits are entered
        const allFilled = Array.from(inputs).every(input => input.value.length === 1);
        if (allFilled && containerId.includes('Login')) {
          // Auto-submit OTP login forms
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

      // Update selected state
      document
        .querySelectorAll(`.login-method-btn[data-form="${formType}"]`)
        .forEach((b) => {
          b.classList.remove("selected");
        });
      this.classList.add("selected");

      // Show/hide appropriate fields
      if (formType === "user") {
        document
          .getElementById("userPasswordFields")
          .classList.toggle("hidden", method !== "password");
        document
          .getElementById("userOtpFields")
          .classList.toggle("hidden", method !== "otp");
        // Reset OTP section when switching methods
        if (method === "password") {
          document.getElementById("userLoginOtpSection").classList.add("hidden");
        }
      } else if (formType === "staff") {
        document
          .getElementById("staffPasswordFields")
          .classList.toggle("hidden", method !== "password");
        document
          .getElementById("staffOtpFields")
          .classList.toggle("hidden", method !== "otp");
        // Reset OTP section when switching methods
        if (method === "password") {
          document.getElementById("staffLoginOtpSection").classList.add("hidden");
        }
      } else if (formType === "admin") {
        document
          .getElementById("adminPasswordFields")
          .classList.toggle("hidden", method !== "password");
        document
          .getElementById("adminOtpFields")
          .classList.toggle("hidden", method !== "otp");
        // Reset OTP section when switching methods
        if (method === "password") {
          document.getElementById("adminLoginOtpSection").classList.add("hidden");
        }
      }
    });
  });

  // Send OTP Button Handlers
  document.querySelectorAll('[id$="SendOtpBtn"]').forEach((btn) => {
    btn.addEventListener("click", async function () {
      const formType = this.id.replace("SendOtpBtn", "").toLowerCase();
      const identifierInput = document.getElementById(
        `${formType}OtpIdentifier`
      );

      if (!identifierInput || !identifierInput.value) {
        alert("Please enter your email or phone number");
        return;
      }

      // Disable button to prevent multiple clicks
      this.disabled = true;
      const originalText = this.innerHTML;
      this.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending...';

      try {
        // Send OTP request to backend using the correct endpoint
        const response = await fetch(`${BASE_URL}/api/otp/request`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identifier: identifierInput.value,
            purpose: "login" // Specify the purpose for OTP
          }),
        });

        if (response.ok) {
          const result = await response.json();
          alert(result.message || `OTP sent to ${identifierInput.value}`);
          
          // Show OTP input section
          document
            .getElementById(`${formType}LoginOtpSection`)
            .classList.remove("hidden");
        } else {
          const error = await response.json();
          alert(error.message || "Failed to send OTP. Please try again.");
        }
      } catch (error) {
        console.error("Error sending OTP:", error);
        alert("Network error: Failed to send OTP. Please check your connection.");
      } finally {
        // Re-enable button
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
      const identifierInput = document.getElementById(
        `${formType}OtpIdentifier`
      );

      if (!identifierInput || !identifierInput.value) {
        alert("Please enter your email or phone number first");
        return;
      }

      // Disable button temporarily
      this.disabled = true;
      const originalText = this.innerHTML;
      this.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Resending...';

      try {
        // Resend OTP request to backend
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
        // Re-enable button after 30 seconds to prevent spam
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
      alert(
        "Password reset instructions will be sent to your registered email"
      );
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