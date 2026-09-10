/* =========================================================
   ZAIN — PORTFOLIO  |  script.js
   Vanilla JS: nav, reveal, spotlight, glow, form, year
   ========================================================= */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------------------------------------------------
     1. Mobile navigation
  --------------------------------------------------- */
  const navToggle = document.getElementById("navToggle");
  const navLinks  = document.getElementById("navLinks");
  const overlay   = document.getElementById("overlay");

  function openNav() {
    navLinks.classList.add("is-open");
    overlay.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("nav-open");
  }

  function closeNav() {
    navLinks.classList.remove("is-open");
    overlay.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  }

  function toggleNav() {
    navToggle.getAttribute("aria-expanded") === "true" ? closeNav() : openNav();
  }

  if (navToggle) {
    navToggle.addEventListener("click", toggleNav);
  }
  if (overlay) {
    overlay.addEventListener("click", closeNav);
  }

  // Close the mobile menu after clicking any nav link
  navLinks.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeNav);
  });

  // Close on Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && navLinks.classList.contains("is-open")) closeNav();
  });

  // Close if we resize back to desktop
  let resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (window.innerWidth > 860) closeNav();
    }, 150);
  });

  /* ---------------------------------------------------
     2. Sticky navbar state + scroll progress
  --------------------------------------------------- */
  const nav      = document.getElementById("nav");
  const progress = document.getElementById("progress");

  function onScroll() {
    const y = window.scrollY || window.pageYOffset;

    if (nav) nav.classList.toggle("is-scrolled", y > 12);

    if (progress) {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const pct = max > 0 ? (y / max) * 100 : 0;
      progress.style.width = pct + "%";
    }

    updateActiveLink(y);
  }

  /* ---------------------------------------------------
     3. Active nav link on scroll (scroll spy)
  --------------------------------------------------- */
  const sections = Array.prototype.slice.call(
    document.querySelectorAll("main section[id]")
  );

  function updateActiveLink(y) {
    if (!sections.length) return;

    const probe = y + window.innerHeight * 0.32;
    let currentId = sections[0].id;

    for (let i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= probe) currentId = sections[i].id;
    }

    // If we're at the very bottom, highlight the last section
    if (y + window.innerHeight >= document.documentElement.scrollHeight - 4) {
      currentId = sections[sections.length - 1].id;
    }

    navLinks.querySelectorAll("a").forEach(function (link) {
      const href = link.getAttribute("href") || "";
      link.classList.toggle("is-active", href === "#" + currentId);
    });
  }

  /* ---------------------------------------------------
     4. Scroll reveal (IntersectionObserver)
  --------------------------------------------------- */
  const revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          const el = entry.target;
          const delay = parseInt(el.dataset.delay || "0", 10);

          setTimeout(function () {
            el.classList.add("is-visible");
          }, delay);

          observer.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback: show everything immediately
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------------------------------------------------
     5. Cursor spotlight
  --------------------------------------------------- */
  const spotlight = document.getElementById("spotlight");
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  if (spotlight && finePointer && !prefersReducedMotion) {
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let rafId = null;

    function render() {
      currentX += (targetX - currentX) * 0.14;
      currentY += (targetY - currentY) * 0.14;
      spotlight.style.transform =
        "translate3d(" + currentX + "px," + currentY + "px,0)";

      if (Math.abs(targetX - currentX) > 0.4 || Math.abs(targetY - currentY) > 0.4) {
        rafId = requestAnimationFrame(render);
      } else {
        rafId = null;
      }
    }

    window.addEventListener(
      "mousemove",
      function (e) {
        targetX = e.clientX;
        targetY = e.clientY;
        spotlight.classList.add("is-on");
        if (!rafId) rafId = requestAnimationFrame(render);
      },
      { passive: true }
    );

    document.addEventListener("mouseleave", function () {
      spotlight.classList.remove("is-on");
    });
  }

  /* ---------------------------------------------------
     6. Card glow follow (projects + certs)
  --------------------------------------------------- */
  if (finePointer && !prefersReducedMotion) {
    const glowCards = document.querySelectorAll("[data-glow]");

    glowCards.forEach(function (card) {
      card.addEventListener(
        "mousemove",
        function (e) {
          const rect = card.getBoundingClientRect();
          const mx = ((e.clientX - rect.left) / rect.width) * 100;
          const my = ((e.clientY - rect.top) / rect.height) * 100;
          card.style.setProperty("--mx", mx + "%");
          card.style.setProperty("--my", my + "%");
        },
        { passive: true }
      );

      card.addEventListener("mouseleave", function () {
        card.style.removeProperty("--mx");
        card.style.removeProperty("--my");
      });
    });
  }

  /* ---------------------------------------------------
     7. Portrait image fallback
  --------------------------------------------------- */
  const portraitImg = document.getElementById("portraitImg");
  if (portraitImg) {
    portraitImg.addEventListener("error", function () {
      portraitImg.style.display = "none";
    });
  }

  /* ---------------------------------------------------
     8. Contact form (UI-only validation + feedback)
  --------------------------------------------------- */
  const form       = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setError(input, message) {
    const field = input.closest(".field");
    if (!field) return;
    const slot = field.querySelector('[data-error-for="' + input.id + '"]');
    if (message) {
      field.classList.add("has-error");
      if (slot) slot.textContent = message;
      input.setAttribute("aria-invalid", "true");
    } else {
      field.classList.remove("has-error");
      if (slot) slot.textContent = "";
      input.removeAttribute("aria-invalid");
    }
  }

  function validateField(input) {
    const value = (input.value || "").trim();

    if (input.id === "name") {
      if (value.length < 2) {
        setError(input, "Please enter your name (min 2 characters).");
        return false;
      }
    }

    if (input.id === "email") {
      if (!value) {
        setError(input, "Email is required.");
        return false;
      }
      if (!EMAIL_RE.test(value)) {
        setError(input, "Please enter a valid email address.");
        return false;
      }
    }

    if (input.id === "message") {
      if (value.length < 10) {
        setError(input, "Message should be at least 10 characters.");
        return false;
      }
    }

    setError(input, "");
    return true;
  }

  if (form) {
    const fields = [
      document.getElementById("name"),
      document.getElementById("email"),
      document.getElementById("message"),
    ].filter(Boolean);

    // Validate on blur, and clear errors while typing
    fields.forEach(function (input) {
      input.addEventListener("blur", function () {
        validateField(input);
      });
      input.addEventListener("input", function () {
        if (input.closest(".field").classList.contains("has-error")) {
          validateField(input);
        }
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      let valid = true;
      fields.forEach(function (input) {
        if (!validateField(input)) valid = false;
      });

      if (!valid) {
        const firstError = form.querySelector(".field.has-error input, .field.has-error textarea");
        if (firstError) firstError.focus();

        formStatus.textContent = "Please fix the highlighted fields and try again.";
        formStatus.className = "form-status is-visible error";
        return;
      }

      // UI-only success state (no backend on a static deploy)
      formStatus.textContent = "Thanks! Your message is ready — I'll get back to you shortly. ✦";
      formStatus.className = "form-status is-visible ok";

      form.reset();
      fields.forEach(function (input) {
        setError(input, "");
      });

      setTimeout(function () {
        formStatus.classList.remove("is-visible");
      }, 6000);
    });
  }

  /* ---------------------------------------------------
     9. Footer year
  --------------------------------------------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------
     10. Bind scroll listener (passive)
  --------------------------------------------------- */
  let scrollTicking = false;
  window.addEventListener(
    "scroll",
    function () {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(function () {
        onScroll();
        scrollTicking = false;
      });
    },
    { passive: true }
  );

  // Initial run
  onScroll();
})();
