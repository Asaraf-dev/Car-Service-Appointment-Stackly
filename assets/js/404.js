
/*--- 404 Page Initialization ---*/
(() => {
    const backButton = document.getElementById("cs-404-back");
    const yearElement = document.getElementById("cs-404-year");
    const particlesContainer = document.getElementById("cs-404-particles");

    /*--- Dynamic Copyright Year ---*/
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    /*--- Go Back Button ---*/
    if (backButton) {
        backButton.addEventListener("click", () => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = "index.html";
            }
        });
    }

    /*--- Background Particles ---*/
    if (particlesContainer && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const fragment = document.createDocumentFragment();
        const particleCount = window.innerWidth <= 575 ? 12 : 24;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement("span");
            const size = 2 + Math.random() * 3;

            particle.className = "cs-404-particle";
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.animationDelay = `${Math.random() * 6}s`;
            particle.style.animationDuration = `${4 + Math.random() * 5}s`;

            fragment.appendChild(particle);
        }

        particlesContainer.appendChild(fragment);
    }
})();
