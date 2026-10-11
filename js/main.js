(() => {
  const themeToggle = document.querySelector(".theme-toggle");
  const themeStorageKey = "anum-portfolio-theme";

  const applyTheme = (theme, persist = false) => {
    const selectedTheme = theme === "light" ? "light" : "dark";
    document.body.dataset.theme = selectedTheme;
    if (themeToggle instanceof HTMLButtonElement) {
      const isLight = selectedTheme === "light";
      themeToggle.setAttribute("aria-pressed", String(isLight));
      themeToggle.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", selectedTheme === "light" ? "#f8fafc" : "#0f0f12");

    if (persist) {
      try {
        window.localStorage.setItem(themeStorageKey, selectedTheme);
      } catch (error) {
        console.warn("Unable to save the selected theme in this browser:", error);
      }
    }
  };

  let savedTheme = "dark";
  try {
    const storedTheme = window.localStorage.getItem(themeStorageKey);
    if (storedTheme === "light" || storedTheme === "dark") savedTheme = storedTheme;
  } catch (error) {
    console.warn("Unable to restore the saved theme in this browser:", error);
  }
  applyTheme(savedTheme);

  themeToggle?.addEventListener("click", () => {
    const nextTheme = document.body.dataset.theme === "light" ? "dark" : "light";
    applyTheme(nextTheme, true);
  });

  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector("#primary-navigation");

  if (navToggle instanceof HTMLButtonElement && navLinks instanceof HTMLElement) {
    const closeNavigation = () => {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open navigation menu");
      navLinks.classList.remove("is-open");
    };

    navToggle.addEventListener("click", () => {
      const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isExpanded));
      navToggle.setAttribute("aria-label", isExpanded ? "Open navigation menu" : "Close navigation menu");
      navLinks.classList.toggle("is-open", !isExpanded);
    });

    navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNavigation));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNavigation();
    });
    document.addEventListener("click", (event) => {
      if (navToggle.getAttribute("aria-expanded") === "true" && event.target instanceof Node && !navToggle.contains(event.target) && !navLinks.contains(event.target)) {
        closeNavigation();
      }
    });
  }

  const year = document.querySelector("#current-year");
  if (year) year.textContent = String(new Date().getFullYear());

  const revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  const counters = Array.from(document.querySelectorAll("[data-count]")).filter((element) => {
    const target = Number(element.dataset.count);
    return Number.isFinite(target) && target >= 0;
  });
  const animateCounter = (element) => {
    const target = Number(element.dataset.count);
    if (!Number.isFinite(target) || target < 0) return;

    const suffix = element.dataset.countSuffix || "";
    const duration = 1000;
    const startTime = performance.now();
    const update = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const easedProgress = 1 - (1 - progress) ** 3;
      element.textContent = `${Math.round(target * easedProgress)}${suffix}`;
      if (progress < 1) window.requestAnimationFrame(update);
    };
    window.requestAnimationFrame(update);
  };

  if ("IntersectionObserver" in window && counters.length) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach((counter) => counterObserver.observe(counter));
  } else {
    counters.forEach(animateCounter);
  }
})();
