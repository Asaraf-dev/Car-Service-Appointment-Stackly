/*--- Our Story Section Start ---*/
(() => {
    const initializeStory = () => {
        const story = document.querySelector(".cs-ab-story");
        if (!story || story.dataset.storyInitialized === "true") return;
        story.dataset.storyInitialized = "true";

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            story.classList.add("cs-ab-story-visible");
            return;
        }

        story.classList.add("cs-ab-story-reveal");

        if (!("IntersectionObserver" in window)) {
            story.classList.add("cs-ab-story-visible");
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("cs-ab-story-visible");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12 });

        observer.observe(story);
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeStory, { once: true });
    } else {
        initializeStory();
    }
})();
/*--- Our Story Section End ---*/
