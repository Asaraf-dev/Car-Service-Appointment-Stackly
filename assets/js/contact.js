/*--- Send Us a Message Section Start ---*/
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("cs-con-message-form");
  const nameInput = document.getElementById("cs-con-message-name");
  const phoneInput = document.getElementById("cs-con-message-phone");
  const modal = document.getElementById("cs-con-message-modal");
  const doneButton = document.getElementById("cs-con-message-success-done");
  if (!form || !nameInput || !phoneInput || !modal || !doneButton) return;
  let previousFocus = null;

  /*--- Name: Allow Alphabetic Characters and Spaces Only ---*/
  nameInput.addEventListener("input", function () {
    const start = this.selectionStart;
    const original = this.value;
    this.value = original.replace(/[^a-zA-Z ]/g, "").replace(/ {2,}/g, " ");
    if (this.value !== original && start !== null) {
      const position = Math.min(start, this.value.length);
      this.setSelectionRange(position, position);
    }
  });

  /*--- Phone: Allow Exactly 10 Digits ---*/
  phoneInput.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 10);
  });

  /*--- Open Success Popup ---*/
  function openModal() {
    previousFocus = document.activeElement;
    modal.classList.add("cs-con-message-modal-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("cs-con-message-modal-lock");
    doneButton.focus();
  }

  /*--- Close Success Popup ---*/
  function closeModal() {
    modal.classList.remove("cs-con-message-modal-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("cs-con-message-modal-lock");
    if (previousFocus && typeof previousFocus.focus === "function") {
      previousFocus.focus();
    }
  }

  /*--- Validate and Submit Form ---*/
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    openModal();
    form.reset();
  });

  /*--- Popup Close Controls ---*/
  modal.querySelectorAll("[data-cs-message-close]").forEach(function (button) {
    button.addEventListener("click", closeModal);
  });
  doneButton.addEventListener("click", closeModal);

  /*--- Keyboard Accessibility ---*/
  document.addEventListener("keydown", function (event) {
    if (!modal.classList.contains("cs-con-message-modal-open")) return;
    if (event.key === "Escape") closeModal();
    if (event.key === "Tab") {
      event.preventDefault();
      doneButton.focus();
    }
  });
});
/*--- Send Us a Message Section End ---*/

/*--- Find Our Workshop Section Start ---*/
const csWorkshopCopyButton = document.getElementById("cs-con-workshop-copy");
if (csWorkshopCopyButton) {
  csWorkshopCopyButton.addEventListener("click", async function () {
    const address = "MMR Complex, Chinna Thirupathi, Salem, Tamil Nadu 636008, India";
    const originalHTML = this.innerHTML;
    try {
      await navigator.clipboard.writeText(address);
      this.innerHTML = '<i class="bi bi-check2"></i> Address copied';
    } catch (error) {
      const textArea = document.createElement("textarea");
      textArea.value = address;
      textArea.setAttribute("readonly", "");
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      const copied = document.execCommand("copy");
      textArea.remove();
      this.innerHTML = copied ? '<i class="bi bi-check2"></i> Address copied' : originalHTML;
    }
    window.setTimeout(() => {
      this.innerHTML = originalHTML;
    }, 2200);
  });
}
/*--- Find Our Workshop Section End ---*/

/*--- Frequently Asked Questions Section Start ---*/
document.querySelectorAll(".cs-con-faq-item").forEach(function (item) {
  item.addEventListener("toggle", function () {
    if (!item.open) return;
    document.querySelectorAll(".cs-con-faq-item").forEach(function (otherItem) {
      if (otherItem !== item) otherItem.open = false;
    });
  });
});
/*--- Frequently Asked Questions Section End ---*/