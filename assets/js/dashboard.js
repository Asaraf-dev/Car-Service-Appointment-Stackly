
/*--- Dashboard Initialization ---*/
document.addEventListener("DOMContentLoaded", function () {
    const body = document.body;
    const sidebar = document.getElementById("cs-db-sidebar");
    const overlay = document.getElementById("cs-db-overlay");
    const menuButton = document.getElementById("cs-db-menu-toggle");
    const closeButton = document.getElementById("cs-db-sidebar-close");
    const logoutButton = document.getElementById("cs-db-logout");
    const profileButton = document.getElementById("cs-db-profile-button");
    const pageTitle = document.getElementById("cs-db-page-title");
    const yearElement = document.getElementById("cs-db-year");



    /*--- Current Page Detection ---*/
    const currentFile = window.location.pathname.split("/").pop().toLowerCase();
    const isAdmin = currentFile.startsWith("admin-");
    const dashboardTitle = isAdmin ? "Admin Dashboard" : "Client Dashboard";
    const currentPage = currentFile.includes("appointment")
        ? "appointments"
        : currentFile.includes("vehicle")
            ? "vehicles"
            : currentFile.includes("profile")
                ? "profile"
                : "dashboard";

    if (pageTitle) pageTitle.textContent = dashboardTitle;
    if (yearElement) yearElement.textContent = new Date().getFullYear();
    document.title = dashboardTitle + " | Stackly Automotive Care";

    /*--- Active Navigation Link ---*/
    document.querySelectorAll(".cs-db-nav-link[data-db-page]").forEach(function (link) {
        const active = link.dataset.dbPage === currentPage;
        link.classList.toggle("cs-db-nav-active", active);
        if (active) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });
    /*--- Current Page Detection End ---*/


    /*--- Load Profile Details ---*/
    const email = sessionStorage.getItem("cs-auth-email")
        || localStorage.getItem("cs-auth-email")
        || "";
    const name = localStorage.getItem("cs-auth-name") || "Account holder";
    const phone = localStorage.getItem("cs-auth-phone") || "Phone number not available";
    const role = sessionStorage.getItem("cs-auth-role")
        || localStorage.getItem("cs-auth-role")
        || (isAdmin ? "admin" : "client");

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    setText("cs-db-topbar-email", email || "Email not available");
    setText("cs-db-mobile-user-email", email || "Email not available");
    setText("cs-db-mobile-user-name", name);
    setText("cs-db-welcome-name", name === "Account holder" ? "there" : name.split(" ")[0]);
    setText("cs-db-profile-name", name);
    setText("cs-db-profile-email", email || "Email not available");
    setText("cs-db-profile-phone", phone);
    setText("cs-db-account-type", role === "admin" ? "Admin" : "Client");

    /*--- Sidebar Open ---*/
    function openSidebar() {
        if (!sidebar || !menuButton) return;
        body.classList.add("cs-db-sidebar-open");
        body.classList.add("cs-db-scroll-lock");
        menuButton.setAttribute("aria-expanded", "true");
        if (closeButton) closeButton.focus();
    }

    /*--- Sidebar Close ---*/
    function closeSidebar(restoreFocus = false) {
        body.classList.remove("cs-db-sidebar-open");
        body.classList.remove("cs-db-scroll-lock");
        if (menuButton) menuButton.setAttribute("aria-expanded", "false");
        if (restoreFocus && menuButton) menuButton.focus();
    }

    if (menuButton) {
        menuButton.addEventListener("click", function () {
            if (body.classList.contains("cs-db-sidebar-open")) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });
    }

    if (closeButton) {
        closeButton.addEventListener("click", function () {
            closeSidebar(true);
        });
    }

    if (overlay) {
        overlay.addEventListener("click", function () {
            closeSidebar(true);
        });
    }

    /*--- Close Mobile Sidebar After Navigation ---*/
    document.querySelectorAll(".cs-db-nav-link").forEach(function (link) {
        link.addEventListener("click", function () {
            closeSidebar();
        });
    });

    /*--- Keyboard and Responsive Controls ---*/
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && body.classList.contains("cs-db-sidebar-open")) {
            closeSidebar(true);
        }
    });

    window.addEventListener("resize", function () {
        if (window.innerWidth > 991) closeSidebar();
    });

    /*--- Profile Button ---*/
    if (profileButton) {
        profileButton.addEventListener("click", function () {
            window.location.href = "404.html";
        });
    }

    /*--- Logout ---*/
    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            sessionStorage.removeItem("cs-auth-email");
            sessionStorage.removeItem("cs-auth-role");
            localStorage.removeItem("cs-auth-role");
            closeSidebar();
            window.location.href = "login.html";
        });
    }
});
/*--- Dashboard Initialization End ---*/
