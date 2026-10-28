
/*--- Footer Initialization ---*/
(() => {
    const initializeFooter = () => {
        const footer = document.getElementById("cs-footer");
        if (!footer) return;
        if (footer.dataset.initialized === "true") return;
        footer.dataset.initialized = "true";

        const footerYear = footer.querySelector("#cs-footer-year");
        const footerTopButton = footer.querySelector("#cs-footer-top");
        const footerLinks = footer.querySelectorAll(
            ".cs-footer-links a, .cs-footer-legal a, .cs-footer-about-link"
        );

        /*--- Dynamic Copyright Year ---*/
        if (footerYear) {
            footerYear.textContent = new Date().getFullYear();
        }

        /*--- Back To Top Button ---*/
        if (footerTopButton) {
            const updateTopButton = () => {
                const isVisible = window.scrollY > 300;

                footerTopButton.classList.toggle("cs-footer-top-visible", isVisible);
                footerTopButton.setAttribute("aria-hidden", String(!isVisible));
                footerTopButton.tabIndex = isVisible ? 0 : -1;
            };

            updateTopButton();

            window.addEventListener("scroll", updateTopButton, {
                passive: true
            });

            footerTopButton.addEventListener("click", (event) => {
                event.preventDefault();

                const reduceMotion = window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches;

                window.scrollTo({
                    top: 0,
                    behavior: reduceMotion ? "auto" : "smooth"
                });
            });
        }

        /*--- Footer Link Interaction ---*/
        footerLinks.forEach((link) => {
            link.addEventListener("click", () => {
                link.classList.add("cs-footer-link-clicked");

                window.setTimeout(() => {
                    link.classList.remove("cs-footer-link-clicked");
                }, 350);
            });
        });

        /*--- Footer Reveal On Scroll ---*/
        const footerRevealElements = footer.querySelectorAll(
            ".cs-footer-cta, .cs-footer-main, .cs-footer-bottom"
        );

        if ("IntersectionObserver" in window && footerRevealElements.length) {
            const revealObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("cs-footer-revealed");
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.08
            });

            footerRevealElements.forEach((element) => {
                revealObserver.observe(element);
            });
        } else {
            footerRevealElements.forEach((element) => {
                element.classList.add("cs-footer-revealed");
            });
        }
    };

    /*--- Support Dynamically Loaded Components ---*/
    window.initializeFooter = initializeFooter;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeFooter, { once: true });
    } else {
        initializeFooter();
    }
})();
