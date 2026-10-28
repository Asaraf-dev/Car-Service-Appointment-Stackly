
/*--- Components Initialization ---*/
document.addEventListener("DOMContentLoaded", async () => {
    const componentConfig = [
        {
            id: "cs-navbar-component",
            path: "assets/components/navbar.html",
            name: "Navbar"
        },
        {
            id: "cs-footer-component",
            path: "assets/components/footer.html",
            name: "Footer"
        }
    ];
    /*--- Load HTML Component ---*/
    const loadComponent = async (component) => {
        const container = document.getElementById(component.id);
        if (!container) return false;
        try {
            const response = await fetch(component.path);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${component.path}`);
            }
            const html = await response.text();
            container.innerHTML = html;
            return true;
        } catch (error) {
            console.error(`Failed to load ${component.name}:`, error);
            container.innerHTML = "";
            return false;
        }
    };
    /*--- Initialize Component Script ---*/
    const initializeScript = (scriptPath, initializer) => {
        if (typeof initializer === "function") {
            initializer();
            return;
        }
        const existingScript = document.querySelector(`script[data-component-script="${scriptPath}"]`);
        if (existingScript) return;
        const script = document.createElement("script");
        script.src = scriptPath;
        script.dataset.componentScript = scriptPath;
        script.onload = () => {
            if (typeof initializer === "function") initializer();
        };
        script.onerror = () => {
            console.error(`Failed to load script: ${scriptPath}`);
        };
        document.body.appendChild(script);
    };
    /*--- Load Shared Components ---*/
    const results = await Promise.all(
        componentConfig.map(async (component) => ({
            component,
            loaded: await loadComponent(component)
        }))
    );
    /*--- Initialize Navbar And Footer ---*/
    results.forEach(({ component, loaded }) => {
        if (!loaded) return;
        if (component.name === "Navbar") {
            initializeScript("assets/js/navbar.js");
        }
        if (component.name === "Footer") {
            initializeScript("assets/js/footer.js");
        }
    });
    /*--- Components Ready Event ---*/
    document.dispatchEvent(new CustomEvent("cs:components-ready", {
        detail: {
            navbar: results.some((item) => item.component.name === "Navbar" && item.loaded),
            footer: results.some((item) => item.component.name === "Footer" && item.loaded)
        }
    }));
});
