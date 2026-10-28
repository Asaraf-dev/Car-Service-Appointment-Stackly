
(() => {
    "use strict";

    const initAllHero = () => {
        const hero = document.querySelector("[data-cs-hero]");
        if (!hero || hero.dataset.initialized === "true") return;
        hero.dataset.initialized = "true";

        const pageName = hero.dataset.page?.trim();
        const eyebrowText = hero.dataset.eyebrow?.trim();
        const currentBreadcrumb = hero.querySelector(".cs-all-hero-breadcrumb-current");
        const eyebrow = hero.querySelector(".cs-all-hero-eyebrow-text");
        const background = hero.querySelector(".cs-all-hero-background");
        const scrollLink = hero.querySelector(".cs-all-hero-scroll");
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const pointerFine = window.matchMedia("(pointer: fine)");

        /*--- Update Page Labels ---*/
        if (pageName && currentBreadcrumb) {
            currentBreadcrumb.textContent = pageName;
            hero.setAttribute("aria-label", `${pageName} page introduction`);
        }

        if (eyebrowText && eyebrow) {
            eyebrow.textContent = eyebrowText;
        }

        /*--- Subtle Pointer Parallax ---*/
        let frameRequested = false;
        let pointerX = 0;
        let pointerY = 0;

        const updateBackground = () => {
            frameRequested = false;
            if (!background || reducedMotion.matches || !pointerFine.matches) return;
            background.style.transform = `scale(1.055) translate3d(${pointerX}px, ${pointerY}px, 0)`;
        };

        const handlePointerMove = (event) => {
            if (reducedMotion.matches || !pointerFine.matches) return;
            const bounds = hero.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width - 0.5;
            const y = (event.clientY - bounds.top) / bounds.height - 0.5;

            pointerX = x * -10;
            pointerY = y * -7;

            if (!frameRequested) {
                frameRequested = true;
                window.requestAnimationFrame(updateBackground);
            }
        };

        const resetBackground = () => {
            if (!background) return;
            background.style.transform = "";
        };

        if (pointerFine.matches && !reducedMotion.matches) {
            hero.addEventListener("pointermove", handlePointerMove, { passive: true });
            hero.addEventListener("pointerleave", resetBackground, { passive: true });
        }

        /*--- Smooth Scroll To Next Section ---*/
        if (scrollLink) {
            scrollLink.addEventListener("click", (event) => {
                const targetId = scrollLink.getAttribute("href");
                if (!targetId || !targetId.startsWith("#") || targetId.length < 2) return;

                const target = document.getElementById(targetId.slice(1));
                if (!target) return;

                event.preventDefault();
                target.scrollIntoView({
                    behavior: reducedMotion.matches ? "auto" : "smooth",
                    block: "start"
                });
            });
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initAllHero, { once: true });
    } else {
        initAllHero();
    }
})();