
/*--- Admin Overview Initialization ---*/
document.addEventListener("DOMContentLoaded", function () {
  const overview = document.querySelector(".cs-ao");
  if (!overview) return;

  /*--- Admin Welcome Name ---*/
  const storedName = localStorage.getItem("cs-auth-name") || "";
  const storedRole = sessionStorage.getItem("cs-auth-role")
    || localStorage.getItem("cs-auth-role")
    || "";
  const welcomeName = document.getElementById("cs-ao-admin-name");

  if (welcomeName) {
    welcomeName.textContent = storedName.trim()
      ? storedName.trim().split(/\s+/)[0]
      : "Admin";
  }

  /*--- Current Local Date ---*/
  const dateElement = document.getElementById("cs-ao-current-date");
  if (dateElement) {
    dateElement.textContent = new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(new Date());
  }

  /*--- Admin Role Display ---*/
  if (storedRole && storedRole !== "admin") {
    console.warn("The current stored account role is not admin.");
  }

  /*--- Keep Demo Figures Explicit ---*/
  overview.querySelectorAll("[data-ao-count]").forEach(function (element) {
    element.textContent = Number(element.dataset.aoCount).toLocaleString("en-IN");
  });
});
/*--- Admin Overview Initialization End ---*/
