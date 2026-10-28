
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

  let editing = false;
  let toastTimer;

  /*--- Load Saved Authentication Data ---*/
  function getProfileData() {
    const sessionEmail = sessionStorage.getItem("cs-auth-email");
    const savedEmail = localStorage.getItem("cs-auth-email");
    const role = sessionStorage.getItem("cs-auth-role") ||
      localStorage.getItem("cs-auth-role") || "";

    return {
      name: localStorage.getItem("cs-auth-name") || "",
      phone: localStorage.getItem("cs-auth-phone") || "",
      email: sessionEmail || savedEmail || "",
      role: role
    };
  }

  /*--- Toast Notification ---*/
  function showToast(message, isError = false) {
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
    const fields = [name, phone, email];
    const completed = fields.filter(value => String(value).trim()).length;
    $("#cs-ap-profile-completion").textContent =
      `${completed} of 3 details provided`;
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

    $("#cs-ap-display-name").textContent = displayName;
    $("#cs-ap-display-email").textContent = displayEmail;
    $("#cs-ap-info-email").textContent = displayEmail;
    roleElement.textContent = displayRole;

    const initials = displayName === "Admin Account"
      ? "A"
      : displayName.trim().split(/\s+/).slice(0, 2)
          .map(part => part.charAt(0).toUpperCase()).join("");

    $("#cs-ap-avatar").textContent = initials;
    updateCompletion(data.name, data.phone, data.email);

    if (data.role && data.role !== "admin") {
      showToast("The current account role is not admin.", true);
    }
  }

  /*--- Edit Mode ---*/
  function setEditMode(enabled) {
    editing = enabled;
    nameInput.readOnly = !enabled;
    phoneInput.readOnly = !enabled;
    editButton.hidden = enabled;
    saveButton.hidden = !enabled;
    cancelButton.hidden = !enabled;

    if (enabled) {
      nameInput.focus();
    }
  }

  /*--- Keep Name Alphabetic ---*/
  nameInput.addEventListener("input", function () {
    const original = this.value;
    const start = this.selectionStart;

    this.value = original
      .replace(/[^A-Za-z ]/g, "")
      .replace(/ {2,}/g, " ")
      .replace(/^ +/, "");

    if (original !== this.value && start !== null) {
      const position = Math.min(start, this.value.length);
      this.setSelectionRange(position, position);
    }

    this.setCustomValidity("");
  });

  /*--- Keep Phone Numeric, Maximum 10 Digits ---*/
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
      nameInput.setCustomValidity("Enter letters and single spaces only.");
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

    /*--- Save Profile Information ---*/
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
