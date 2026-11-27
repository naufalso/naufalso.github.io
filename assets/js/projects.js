// Projects showcase: theme filter + reveal-on-scroll.
// The page is fully usable without this script; it only adds motion and filtering.
(function () {
  "use strict";

  var root = document.querySelector("[data-pj-root]");
  if (!root) return;

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cards = Array.prototype.slice.call(root.querySelectorAll(".pj-reveal"));
  var groups = Array.prototype.slice.call(root.querySelectorAll(".pj-group"));
  var chips = Array.prototype.slice.call(root.querySelectorAll(".pj-chip"));

  // Small stagger so cards in the same row do not appear at exactly the same time.
  function stagger(list) {
    list.forEach(function (card, i) {
      card.style.setProperty("--pj-delay", (i % 2) * 0.09 + "s");
    });
  }

  function show(card) {
    card.classList.add("is-visible");
  }

  if (!reduceMotion && "IntersectionObserver" in window) {
    root.classList.add("pj-motion");
    groups.forEach(function (g) {
      stagger(Array.prototype.slice.call(g.querySelectorAll(".pj-reveal")));
    });

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            show(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    cards.forEach(function (c) {
      io.observe(c);
    });
  } else {
    cards.forEach(show);
  }

  // Filtering by theme.
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var filter = chip.getAttribute("data-filter");

      chips.forEach(function (c) {
        var active = c === chip;
        c.classList.toggle("is-active", active);
        c.setAttribute("aria-pressed", active ? "true" : "false");
      });

      groups.forEach(function (g) {
        var match = filter === "all" || g.getAttribute("data-cat") === filter;
        g.classList.toggle("is-hidden", !match);
        if (match && root.classList.contains("pj-motion")) {
          // Replay the entrance for the newly shown group.
          var list = Array.prototype.slice.call(g.querySelectorAll(".pj-reveal"));
          list.forEach(function (c) {
            c.classList.remove("is-visible");
          });
          // Force a reflow so the transition runs again.
          void g.offsetWidth;
          stagger(list);
          list.forEach(show);
        }
      });
    });
  });
})();
