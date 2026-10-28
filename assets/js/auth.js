
/*--- Stackly Authentication Pages ---*/
document.addEventListener("DOMContentLoaded", function () {
  /*--- Shared Helpers ---*/
  const currentYear = new Date().getFullYear();
  const yearElements = [
    document.getElementById("cs-auth-year"),
    document.getElementById("cs-auth-register-year")
  ];
  yearElements.forEach(function (element) {
    if (element) element.textContent = currentYear;
  });

  function showError(element, message) {
    if (!element) return;
    element.textContent = message;
    element.hidden = false;
  }

  function clearError(element) {
    if (!element) return;
    element.textContent = "";
    element.hidden = true;
  }

  /*--- Password Visibility Toggles ---*/
  document.querySelectorAll("[data-password-toggle]").forEach(function (button) {
    button.addEventListener("click", function () {
      const input = document.getElementById(button.dataset.passwordToggle);
      if (!input) return;
      const showPassword = input.type === "password";
      input.type = showPassword ? "text" : "password";
      button.innerHTML = showPassword
        ? '<i class="bi bi-eye-slash"></i>'
        : '<i class="bi bi-eye"></i>';
      button.setAttribute("aria-label", showPassword ? "Hide password" : "Show password");
      button.setAttribute("aria-pressed", String(showPassword));
    });
  });

  /*--- Login Page ---*/
  const loginForm = document.getElementById("cs-auth-login-form");
  if (loginForm) {
    const roleInput = document.getElementById("cs-auth-role");
    const emailInput = document.getElementById("cs-auth-email");
    const passwordInput = document.getElementById("cs-auth-password");
    const rememberInput = document.getElementById("cs-auth-remember");
    const errorElement = document.getElementById("cs-auth-error");
    const roleButtons = document.querySelectorAll("[data-role]");

    /*--- Restore Remembered Email and Role ---*/
    const rememberedEmail = localStorage.getItem("cs-auth-email");
    const registeredRole = localStorage.getItem("cs-auth-role");
    if (rememberedEmail && emailInput) {
      emailInput.value = rememberedEmail;
      if (rememberInput) rememberInput.checked = true;
    }
    if (registeredRole && roleInput) {
      const matchingRole = Array.from(roleButtons).find(function (button) {
        return button.dataset.role === registeredRole;
      });
      if (matchingRole) matchingRole.click();
    }

    /*--- Role Selection ---*/
    roleButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        roleButtons.forEach(function (item) {
          item.classList.remove("cs-auth-role-active");
          item.setAttribute("aria-pressed", "false");
        });
        button.classList.add("cs-auth-role-active");
        button.setAttribute("aria-pressed", "true");
        roleInput.value = button.dataset.role;
        clearError(errorElement);
      });
    });

    /*--- Clear Login Errors ---*/
    loginForm.addEventListener("input", function () {
      clearError(errorElement);
    });

    /*--- Login Submission ---*/
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!loginForm.checkValidity()) {
        loginForm.reportValidity();
        return;
      }

      const email = emailInput.value.trim().toLowerCase();
      const password = passwordInput.value;
      const role = roleInput.value;

      if (!email || !password || !["admin", "client"].includes(role)) {
        showError(errorElement, "Please complete all required fields.");
        return;
      }

      /*--- Store Display Information ---*/
      sessionStorage.setItem("cs-auth-email", email);
      sessionStorage.setItem("cs-auth-role", role);

      if (rememberInput && rememberInput.checked) {
        localStorage.setItem("cs-auth-email", email);
      } else {
        localStorage.removeItem("cs-auth-email");
      }

      /*--- Role-Based Demo Redirect ---*/
      window.location.href = role === "admin"
        ? "admin-dashboard.html"
        : "client-dashboard.html";
    });
  }

  /*--- Register Page ---*/
  const registerForm = document.getElementById("cs-auth-register-form");
  if (registerForm) {
    const roleInput = document.getElementById("cs-auth-register-role");
    const nameInput = document.getElementById("cs-auth-register-name");
    const phoneInput = document.getElementById("cs-auth-register-phone");
    const emailInput = document.getElementById("cs-auth-register-email");
    const passwordInput = document.getElementById("cs-auth-register-password");
    const confirmInput = document.getElementById("cs-auth-register-confirm");
    const errorElement = document.getElementById("cs-auth-register-error");
    const roleButtons = document.querySelectorAll("[data-register-role]");

    /*--- Restore Profile Details if Previously Entered ---*/
    const previousName = localStorage.getItem("cs-auth-name");
    const previousPhone = localStorage.getItem("cs-auth-phone");
    const previousEmail = localStorage.getItem("cs-auth-email");
    if (previousName) nameInput.value = previousName;
    if (previousPhone) phoneInput.value = previousPhone;
    if (previousEmail) emailInput.value = previousEmail;

    /*--- Account Type Selection ---*/
    roleButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        roleButtons.forEach(function (item) {
          item.classList.remove("cs-auth-role-active");
          item.setAttribute("aria-pressed", "false");
        });
        button.classList.add("cs-auth-role-active");
        button.setAttribute("aria-pressed", "true");
        roleInput.value = button.dataset.registerRole;
        clearError(errorElement);
      });
    });

    /*--- Name: Letters and Single Spaces Only ---*/
    nameInput.addEventListener("input", function () {
      const start = this.selectionStart;
      const original = this.value;
      this.value = original.replace(/[^a-zA-Z ]/g, "").replace(/ {2,}/g, " ");
      if (this.value !== original && start !== null) {
        const position = Math.min(start, this.value.length);
        this.setSelectionRange(position, position);
      }
      this.setCustomValidity("");
    });

    /*--- Phone: Digits Only, Maximum 10 ---*/
    phoneInput.addEventListener("input", function () {
      this.value = this.value.replace(/\D/g, "").slice(0, 10);
      this.setCustomValidity("");
    });

    /*--- Password Confirmation Validation ---*/
    function validatePasswordMatch() {
      if (confirmInput.value && confirmInput.value !== passwordInput.value) {
        confirmInput.setCustomValidity("Passwords do not match.");
      } else {
        confirmInput.setCustomValidity("");
      }
    }

    passwordInput.addEventListener("input", function () {
      this.setCustomValidity("");
      validatePasswordMatch();
    });
    confirmInput.addEventListener("input", validatePasswordMatch);

    /*--- Clear Registration Error ---*/
    registerForm.addEventListener("input", function () {
      clearError(errorElement);
    });

    /*--- Register Submission ---*/
    registerForm.addEventListener("submit", function (event) {
      event.preventDefault();
      validatePasswordMatch();

      if (!registerForm.checkValidity()) {
        registerForm.reportValidity();
        return;
      }

      const name = nameInput.value.trim();
      const phone = phoneInput.value;
      const email = emailInput.value.trim().toLowerCase();
      const password = passwordInput.value;
      const role = roleInput.value;

      if (!name || !phone || !email || !password || !confirmInput.value ||
          !["admin", "client"].includes(role)) {
        showError(errorElement, "Please complete all required fields.");
        return;
      }

      if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(name)) {
        nameInput.setCustomValidity("Enter letters and single spaces only.");
        registerForm.reportValidity();
        nameInput.setCustomValidity("");
        return;
      }

      if (!/^[0-9]{10}$/.test(phone)) {
        phoneInput.setCustomValidity("Enter exactly 10 digits.");
        registerForm.reportValidity();
        phoneInput.setCustomValidity("");
        return;
      }

      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}/.test(password)) {
        passwordInput.setCustomValidity("Use at least 8 characters, including uppercase, lowercase, a number and a special character.");
        registerForm.reportValidity();
        passwordInput.setCustomValidity("");
        return;
      }

      if (password !== confirmInput.value) {
        confirmInput.setCustomValidity("Passwords do not match.");
        registerForm.reportValidity();
        confirmInput.setCustomValidity("");
        return;
      }

      /*--- Save Profile Details for Frontend Dashboard Display ---*/
      localStorage.setItem("cs-auth-name", name);
      localStorage.setItem("cs-auth-phone", phone);
      localStorage.setItem("cs-auth-email", email);
      localStorage.setItem("cs-auth-role", role);

      /*--- Never Store the Password in Browser Storage ---*/
      passwordInput.value = "";
      confirmInput.value = "";

      /*--- Return to Login ---*/
      window.location.href = "login.html";
    });
  }
});
/*--- Stackly Authentication Pages End ---*/
