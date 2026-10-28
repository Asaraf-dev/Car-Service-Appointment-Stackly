
/*--- Loader Elements ---*/
(() => {
    const loader = document.getElementById("cs-ldr-loader");
    const message = document.getElementById("cs-ldr-message");
    const particles = document.getElementById("cs-ldr-particles");

    if (!loader || loader.dataset.initialized === "true") return;
    loader.dataset.initialized = "true";

    let messageInterval = null;
    let messageSwapTimeout = null;
    let hideTimeout = null;
    let exitTimeout = null;
    let messageIndex = 0;
    let isHidden = false;

    /*--- Loader Messages ---*/
    const messages = [
        "Preparing your driving experience...",
        "Getting your vehicle care ready...",
        "Checking our service systems...",
        "Making everything road-ready...",
        "Almost ready for the journey..."
    ];

    /*--- Create Background Particles ---*/
    const createParticles = () => {
        if (!particles || particles.children.length) return;

        const particleCount = window.innerWidth <= 575 ? 18 : 32;
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement("span");
            const size = 2 + Math.random() * 3;

            particle.className = "cs-ldr-particle";
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.animationDelay = `${Math.random() * 5}s`;
            particle.style.animationDuration = `${4 + Math.random() * 5}s`;

            fragment.appendChild(particle);
        }

        particles.appendChild(fragment);
    };

    /*--- Rotate Loader Messages ---*/
    const startMessages = () => {
        clearInterval(messageInterval);
        clearTimeout(messageSwapTimeout);

        messageIndex = 0;
        if (message) message.textContent = messages[0];

        messageInterval = setInterval(() => {
            if (!message || isHidden) return;

            message.style.opacity = "0";
            message.style.transform = "translateY(5px)";

            messageSwapTimeout = setTimeout(() => {
                messageIndex = (messageIndex + 1) % messages.length;
                message.textContent = messages[messageIndex];
                message.style.opacity = "1";
                message.style.transform = "translateY(0)";
            }, 250);
        }, 1500);
    };

    /*--- Show Loader ---*/
    const showLoader = () => {
        clearTimeout(hideTimeout);
        clearTimeout(exitTimeout);
        clearInterval(messageInterval);
        clearTimeout(messageSwapTimeout);

        isHidden = false;
        loader.style.display = "flex";
        loader.classList.remove("cs-ldr-hidden", "cs-ldr-exit");

        createParticles();
        startMessages();
    };

    /*--- Hide Loader ---*/
    const hideLoader = () => {
        if (isHidden) return;

        clearTimeout(hideTimeout);

        /*--- Short Delay For A Smooth First Impression ---*/
        hideTimeout = setTimeout(() => {
            clearInterval(messageInterval);
            clearTimeout(messageSwapTimeout);

            loader.classList.add("cs-ldr-exit");
            isHidden = true;

            exitTimeout = setTimeout(() => {
                loader.classList.add("cs-ldr-hidden");
                loader.style.display = "none";
            }, 750);
        }, 450);
    };

    /*--- Mouse Glow ---*/
    document.addEventListener("mousemove", (event) => {
        if (isHidden || window.innerWidth <= 767) return;

        loader.style.setProperty("--cs-ldr-x", `${event.clientX}px`);
        loader.style.setProperty("--cs-ldr-y", `${event.clientY}px`);
    }, { passive: true });

    /*--- Initial Page Load ---*/
    createParticles();

    if (document.readyState === "complete") {
        showLoader();
        hideLoader();
    } else {
        showLoader();
    }

    /*--- Wait Until Page Resources Are Loaded ---*/
    window.addEventListener("load", hideLoader, { once: true });

    /*--- Browser Back / Forward Navigation ---*/
    window.addEventListener("pageshow", (event) => {
        if (event.persisted) {
            showLoader();
            hideLoader();
        }
    });
})();
