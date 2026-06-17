/*
 * Scroll-reveal helper.
 *
 * Two jobs:
 *
 *  1. Our own content (elements tagged `.mkk-anim`, e.g. the Our Story page)
 *     fades in as it scrolls into view — on EVERY breakpoint. These elements
 *     have no Webflow interaction attached, so we drive them ourselves.
 *
 *  2. Webflow's built-in "scroll into view" interactions on this site are
 *     gated to the desktop breakpoint, so on small screens several content
 *     blocks that start at opacity:0 never animate in and stay invisible.
 *     On viewports <= 991px we patch those up with the same observer.
 *
 * The loader, discount pop-up and announcement bar use opacity:0 too but are
 * meant to stay hidden until triggered, so they are always excluded.
 */
(function () {
    function revealNow(el) {
        el.style.opacity = "1";
        el.style.transform = "none";
    }

    function observe(nodes) {
        if (!nodes.length) return;
        nodes.forEach(function (el) {
            el.style.transition = "opacity 0.9s ease, transform 0.9s ease";
            el.style.willChange = "opacity, transform";
        });
        if (!("IntersectionObserver" in window)) {
            nodes.forEach(revealNow); // no observer support: just show everything
            return;
        }
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    revealNow(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
        nodes.forEach(function (el) { observer.observe(el); });
    }

    // Overlays whose hidden state is intentional — never reveal these.
    var EXCLUDE = ".lead-generation-pop-up, .page-loading-wrapper, .announcement";

    function init() {
        // 1) Our own reveal elements — all breakpoints.
        var own = Array.prototype.slice.call(document.querySelectorAll(".mkk-anim"));

        // 2) Webflow's desktop-only scroll reveals — patch only on small screens.
        var gap = [];
        if (window.matchMedia("(max-width: 991px)").matches) {
            gap = Array.prototype.slice.call(
                document.querySelectorAll('[style*="opacity:0"], [style*="opacity: 0"]')
            ).filter(function (el) {
                return !el.closest(EXCLUDE) && !el.classList.contains("mkk-anim");
            });
        }

        observe(own.concat(gap));
    }

    // Run after Webflow has applied its interaction initial states.
    if (document.readyState === "complete") {
        setTimeout(init, 300);
    } else {
        window.addEventListener("load", function () { setTimeout(init, 300); });
    }
})();
