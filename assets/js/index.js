/*--- Hero Section Start ---*/
(() => {
    const hero = document.getElementById("cs-ind-hero");
    const visual = hero?.querySelector(".cs-ind-hero-visual");
    const image = hero?.querySelector(".cs-ind-hero-image");

    if (!hero || !visual || !image) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;

    /*--- Subtle Pointer Movement ---*/
    visual.addEventListener("pointermove", (event) => {
        const bounds = visual.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;

        image.style.transform = `scale(1.035) translate(${x * -8}px, ${y * -8}px)`;
    });

    visual.addEventListener("pointerleave", () => {
        image.style.transform = "";
    });
})();
/*--- Hero Section End ---*/

/*--- Customer Reviews Section Start ---*/
/*--- Customer Reviews Section End ---*/