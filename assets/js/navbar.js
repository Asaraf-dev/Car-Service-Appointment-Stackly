
/*--- Navbar Initialization ---*/
(() => {
    const initializeNavbar = () => {
        const navbarHeader = document.getElementById("cs-nav-header");
        const navbarToggle = document.getElementById("cs-nav-toggle");
        const navbarClose = document.getElementById("cs-nav-mobile-close");
        const navbarBackdrop = document.getElementById("cs-nav-backdrop");
        const navbarMobile = document.getElementById("cs-nav-mobile");

        if (!navbarHeader || !navbarToggle || !navbarMobile) return;
        if (navbarHeader.dataset.initialized === "true") return;
        navbarHeader.dataset.initialized = "true";

        /*--- Navbar Variables ---*/
        const body = document.body;
        const mobileMenuLinks = navbarMobile.querySelectorAll("a");
        const allNavLinks = navbarHeader.querySelectorAll("a[href]");
        const desktopMediaQuery = window.matchMedia("(min-width: 992px)");
        let previousBodyOverflow = "";
        let previousFocus = null;
        let lastScrollY = window.scrollY;
        let focusTimer = null;

        /*--- Normalize Page Paths ---*/
        const normalizePath = (path) => {
            const cleanPath = path.split("?")[0].split("#")[0];
            if (!cleanPath || cleanPath === "/" || cleanPath.endsWith("/")) {
                return "index.html";
            }
            return cleanPath.split("/").pop().toLowerCase();
        };

        /*--- Active Navigation Link ---*/
        const currentPage = normalizePath(window.location.pathname);

        allNavLinks.forEach((link) => {
            const href = link.getAttribute("href");
            if (!href || href.startsWith("#") || /^(mailto:|tel:|https?:|javascript:)/i.test(href)) return;

            const isActive = normalizePath(href) === currentPage;
            link.classList.toggle("cs-nav-active", isActive);

            if (isActive) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });

        /*--- Menu State ---*/
        const isMenuOpen = () => navbarHeader.classList.contains("cs-nav-menu-open");

        /*--- Open Mobile Menu ---*/
        const openMobileMenu = () => {
            if (isMenuOpen() || desktopMediaQuery.matches) return;

            previousFocus = document.activeElement;
            previousBodyOverflow = body.style.overflow;

            navbarMobile.removeAttribute("inert");
            navbarMobile.setAttribute("aria-hidden", "false");
            navbarToggle.setAttribute("aria-expanded", "true");
            navbarToggle.setAttribute("aria-label", "Close navigation menu");

            navbarHeader.classList.add("cs-nav-menu-open");
            navbarMobile.classList.add("cs-nav-mobile-open");
            navbarBackdrop?.classList.add("cs-nav-backdrop-visible");
            navbarToggle.classList.add("cs-nav-toggle-active");

            body.classList.add("cs-nav-scroll-locked");
            body.style.overflow = "hidden";

            if (focusTimer) window.clearTimeout(focusTimer);
            focusTimer = window.setTimeout(() => {
                if (!isMenuOpen()) return;
                const firstFocusable = navbarMobile.querySelector(
                    'a[href]:not([tabindex="-1"]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
                );
                firstFocusable?.focus({ preventScroll: true });
            }, 100);
        };

        /*--- Close Mobile Menu ---*/
        const closeMobileMenu = (restoreFocus = true) => {
            if (!isMenuOpen()) return;

            if (focusTimer) {
                window.clearTimeout(focusTimer);
                focusTimer = null;
            }

            navbarHeader.classList.remove("cs-nav-menu-open");
            navbarMobile.classList.remove("cs-nav-mobile-open");
            navbarBackdrop?.classList.remove("cs-nav-backdrop-visible");
            navbarToggle.classList.remove("cs-nav-toggle-active");

            navbarToggle.setAttribute("aria-expanded", "false");
            navbarToggle.setAttribute("aria-label", "Open navigation menu");
            navbarMobile.setAttribute("aria-hidden", "true");

            /*--- Restore Inert After Closing ---*/
            navbarMobile.setAttribute("inert", "");

            body.classList.remove("cs-nav-scroll-locked");
            body.style.overflow = previousBodyOverflow;

            if (restoreFocus && previousFocus?.isConnected) {
                previousFocus.focus({ preventScroll: true });
            }
        };

        /*--- Initial Menu Accessibility State ---*/
        navbarToggle.setAttribute("aria-expanded", "false");
        navbarToggle.setAttribute("aria-controls", navbarMobile.id || "cs-nav-mobile");
        navbarToggle.setAttribute("aria-label", "Open navigation menu");
        navbarMobile.setAttribute("aria-hidden", "true");
        navbarMobile.setAttribute("inert", "");

        /*--- Toggle Mobile Menu ---*/
        navbarToggle.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();

            if (isMenuOpen()) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        /*--- Close Button ---*/
        navbarClose?.addEventListener("click", (event) => {
            event.preventDefault();
            closeMobileMenu();
        });

        /*--- Backdrop Click ---*/
        navbarBackdrop?.addEventListener("click", (event) => {
            event.preventDefault();
            closeMobileMenu();
        });

        /*--- Mobile Navigation Link Clicks ---*/
        mobileMenuLinks.forEach((link) => {
            link.addEventListener("click", () => {
                closeMobileMenu(false);
            });
        });

        /*--- Prevent Placeholder Link Navigation ---*/
        navbarHeader.querySelectorAll('a[href="#"]').forEach((link) => {
            link.addEventListener("click", (event) => {
                event.preventDefault();
            });
        });

        /*--- Keyboard Navigation ---*/
        document.addEventListener("keydown", (event) => {
            if (!isMenuOpen()) return;

            if (event.key === "Escape") {
                event.preventDefault();
                closeMobileMenu();
                return;
            }

            if (event.key !== "Tab") return;

            const focusableElements = Array.from(
                navbarMobile.querySelectorAll(
                    'a[href]:not([tabindex="-1"]), button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
                )
            ).filter((element) => {
                return element.getClientRects().length > 0 &&
                    !element.closest("[inert]");
            });

            if (!focusableElements.length) {
                event.preventDefault();
                return;
            }

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        });

        /*--- Close Menu When Switching To Desktop ---*/
        const handleBreakpointChange = (event) => {
            if (event.matches) {
                closeMobileMenu(false);
            }
        };

        if (desktopMediaQuery.addEventListener) {
            desktopMediaQuery.addEventListener("change", handleBreakpointChange);
        } else {
            desktopMediaQuery.addListener(handleBreakpointChange);
        }

        /*--- Navbar Scroll Effect ---*/
        const updateNavbarScroll = () => {
            const scrollY = window.scrollY;

            navbarHeader.classList.toggle("cs-nav-scrolled", scrollY > 30);
            navbarHeader.classList.toggle("cs-nav-scroll-up", scrollY < lastScrollY);
            navbarHeader.classList.toggle(
                "cs-nav-scroll-down",
                scrollY > lastScrollY && scrollY > 150
            );

            lastScrollY = scrollY;
        };

        updateNavbarScroll();
        window.addEventListener("scroll", updateNavbarScroll, { passive: true });

        /*--- Prevent Accidental Menu State On Page Restore ---*/
        window.addEventListener("pageshow", () => {
            if (desktopMediaQuery.matches) {
                closeMobileMenu(false);
            }
        });
    };

    /*--- Expose Initializer For Dynamic Components ---*/
    window.initializeNavbar = initializeNavbar;

    /*--- Initialize Navbar ---*/
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeNavbar, { once: true });
    } else {
        initializeNavbar();
    }
})();
