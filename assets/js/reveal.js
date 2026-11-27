// Scroll reveal for content below the first screen.
// Only elements that start below the viewport are animated, so whatever a visitor
// (or a link preview) sees first is always complete. Skipped entirely for
// reduced-motion users and browsers without IntersectionObserver.
(function () {
  "use strict";

  if (!("IntersectionObserver" in window)) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Components that read as one unit. Kept to top-level blocks so nothing animates twice.
  var SELECTOR = [
    ".news",
    ".publications ol.bibliography > li",
    ".publications > h2",
    ".pj-group-title",
    ".pj-item",
    ".cv > .card",
    ".repositories > .repo",
    ".social",
  ].join(",");

  var STAGGER_MS = 70;
  var MAX_STAGGER_STEPS = 4;

  function init() {
    var fold = window.innerHeight || document.documentElement.clientHeight;
    var items = Array.prototype.slice.call(document.querySelectorAll(SELECTOR)).filter(function (el) {
      return el.getBoundingClientRect().top > fold;
    });
    if (!items.length) return;

    items.forEach(function (el) {
      el.classList.add("reveal", "reveal-pending");
    });

    var queue = [];
    var scheduled = false;

    function finish(el) {
      el.classList.remove("reveal");
      el.style.transitionDelay = "";
    }

    function flush() {
      scheduled = false;
      queue.forEach(function (el, i) {
        el.style.transitionDelay = Math.min(i, MAX_STAGGER_STEPS) * STAGGER_MS + "ms";
        el.classList.remove("reveal-pending");
        var done = function (ev) {
          if (ev.target !== el || ev.propertyName !== "opacity") return;
          el.removeEventListener("transitionend", done);
          finish(el);
        };
        el.addEventListener("transitionend", done);
      });
      queue = [];
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            io.unobserve(entry.target);
            queue.push(entry.target);
          }
        });
        if (queue.length && !scheduled) {
          scheduled = true;
          window.requestAnimationFrame(flush);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0 }
    );

    items.forEach(function (el) {
      io.observe(el);
    });

    // Never leave anything hidden when printing.
    window.addEventListener("beforeprint", function () {
      items.forEach(function (el) {
        el.classList.remove("reveal-pending");
        finish(el);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
