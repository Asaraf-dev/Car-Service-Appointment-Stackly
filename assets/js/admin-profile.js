
/*--- Admin Profile Initialization ---*/
document.addEventListener("DOMContentLoaded", function () {
  const root = document.querySelector(".cs-ap");
  if (!root) return;
  const $ = selector => root.querySelector(selector);
  const form = $("#cs-ap-form");
  const nameInput = $("#cs-ap-name");
  const phoneInput = $("#cs-ap-phone");
  const emailInput = $("#cs-ap-email");
  const roleElement = $("#cs-ap-role");
  const editButton = $("#cs-ap-edit-btn");
  const saveButton = $("#cs-ap-save-btn");
  const cancelButton = $("#cs-ap-cancel-btn");
  const toastElement = $("#cs-ap-toast");
  const displayNameElement = $("#cs-ap-display-name");
  const displayEmailElement = $("#cs-ap-display-email");
  const infoEmailElement = $("#cs-ap-info-email");
  const avatarElement = $("#cs-ap-avatar");
  const completionElement = $("#cs-ap-profile-completion");

  if (!form || !nameInput || !phoneInput || !emailInput ||
      !roleElement || !editButton || !saveButton || !cancelButton) {
    console.error("Admin Profile: Required HTML elements are missing. Check the IDs in admin-profile.html.");
    return;
  }

  let editing = false;
  let toastTimer;

  /*--- Load Saved Authentication Data ---*/
  function getProfileData() {
    return {
      name: localStorage.getItem("cs-auth-name") || "",
      phone: localStorage.getItem("cs-auth-phone") || "",
      email: sessionStorage.getItem("cs-auth-email") ||
        localStorage.getItem("cs-auth-email") || "",
      role: sessionStorage.getItem("cs-auth-role") ||
        localStorage.getItem("cs-auth-role") || ""
    };
  }

  /*--- Toast Notification ---*/
  function showToast(message, isError = false) {
    if (!toastElement) {
      console[isError ? "error" : "log"](message);
      return;
    }
    toastElement.textContent = message;
    toastElement.classList.toggle("cs-ap-toast-error", isError);
    toastElement.classList.add("cs-ap-toast-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastElement.classList.remove("cs-ap-toast-visible");
    }, 3000);
  }

  /*--- Profile Completion ---*/
  function updateCompletion(name, phone, email) {
    if (!completionElement) return;
    const completed = [name, phone, email]
      .filter(value => String(value).trim()).length;
    completionElement.textContent = `${completed} of 3 details provided`;
  }

  /*--- Display Profile Data ---*/
  function renderProfile() {
    const data = getProfileData();
    const displayName = data.name.trim() || "Admin Account";
    const displayEmail = data.email || "No login email found";
    const displayRole = data.role
      ? data.role.charAt(0).toUpperCase() + data.role.slice(1)
      : "Not available";

    nameInput.value = data.name;
    phoneInput.value = data.phone;
    emailInput.value = data.email;
    roleElement.textContent = displayRole;

    if (displayNameElement) displayNameElement.textContent = displayName;
    if (displayEmailElement) displayEmailElement.textContent = displayEmail;
    if (infoEmailElement) infoEmailElement.textContent = displayEmail;

    if (avatarElement) {
      const initials = displayName === "Admin Account"
        ? "A"
        : displayName.trim().split(/\s+/).slice(0, 2)
            .map(part => part.charAt(0).toUpperCase()).join("");
      const avatarImage = avatarElement.querySelector("img");
      if (avatarImage) {
        avatarImage.alt = displayName;
      } else {
        avatarElement.textContent = initials;
      }
    }

    updateCompletion(data.name, data.phone, data.email);

  }

  /*--- Edit Mode ---*/
  function setEditMode(enabled) {
    editing = enabled;
    nameInput.readOnly = !enabled;
    phoneInput.readOnly = !enabled;
    editButton.hidden = enabled;
    saveButton.hidden = !enabled;
    cancelButton.hidden = !enabled;

    if (enabled) nameInput.focus();
  }

  /*--- Keep Name Alphabetic ---*/
  nameInput.addEventListener("input", function () {
    const original = this.value;
    const start = this.selectionStart;
    this.value = original.replace(/[^A-Za-z ]/g, "")
      .replace(/ {2,}/g, " ").replace(/^ +/, "");
    if (original !== this.value && start !== null) {
      const position = Math.min(start, this.value.length);
      this.setSelectionRange(position, position);
    }
    this.setCustomValidity("");
  });

  /*--- Keep Phone Numeric ---*/
  phoneInput.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 10);
    this.setCustomValidity("");
  });

  /*--- Start Editing ---*/
  editButton.addEventListener("click", function () {
    renderProfile();
    setEditMode(true);
  });

  /*--- Cancel Editing ---*/
  cancelButton.addEventListener("click", function () {
    form.reset();
    renderProfile();
    setEditMode(false);
  });

  /*--- Save Profile Changes ---*/
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!editing) return;

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(name)) {
      nameInput.setCustomValidity("Use letters and single spaces only.");
      form.reportValidity();
      nameInput.setCustomValidity("");
      nameInput.focus();
      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      phoneInput.setCustomValidity("Enter exactly 10 digits.");
      form.reportValidity();
      phoneInput.setCustomValidity("");
      phoneInput.focus();
      return;
    }

    localStorage.setItem("cs-auth-name", name);
    localStorage.setItem("cs-auth-phone", phone);

    renderProfile();
    setEditMode(false);
    showToast("Profile details saved successfully.");
  });

  /*--- Initial Page Setup ---*/
  renderProfile();
  setEditMode(false);
});
/*--- Admin Profile Initialization End ---*/
