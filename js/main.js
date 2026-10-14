(() => {
  const themeToggle = document.querySelector(".theme-toggle");
  const themeStorageKey = "anum-portfolio-theme";

  const applyTheme = (theme, persist = false) => {
    const selectedTheme = theme === "light" ? "light" : "dark";
    document.body.classList.toggle("light-theme", selectedTheme === "light");
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

  const observedSections = document.querySelectorAll("main section[id]");
  const sectionNavLinks = navLinks?.querySelectorAll('a[href^="#"]') ?? [];
  if ("IntersectionObserver" in window && observedSections.length > 0 && sectionNavLinks.length > 0) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const sectionHref = `#${entry.target.id}`;
        sectionNavLinks.forEach((link) => {
          const isCurrent = link.getAttribute("href") === sectionHref;
          link.classList.toggle("active", isCurrent);
          if (isCurrent) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    }, { rootMargin: "-30% 0px -60% 0px", threshold: 0 });

    observedSections.forEach((section) => sectionObserver.observe(section));
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

  const createCategoryItems = (folder, filenames) => filenames.map((filename) => ({
    title: filename.replace(/\.[^.]+$/, ""),
    src: `Project/${folder}/${filename}`.split("/").map(encodeURIComponent).join("/")
  }));

  const categoryGalleryData = {
    "2d-character": createCategoryItems("2D Character", [
      "Dongfang and orchid.jpg",
      "Venom.JPG",
      "W-Auranzaib.jpg"
    ]),
    "ai-work": createCategoryItems("AI work", [
      "Model 1.mp4",
      "Model 2.mp4",
      "Model 3.mp4",
      "Model 4.mp4",
      "Model 5.mp4",
      "Model 6.mp4",
      "Model 7.mp4",
      "Post 1.jpeg",
      "Post 2.jpeg",
      "Post 3.jpeg",
      "Post 4.jpeg",
      "Post 5.jpeg",
      "Post 6.jpeg",
      "Post 7.jpeg",
      "Post 8.jpeg"
    ]),
    "2d-animation": createCategoryItems("Animation", [
      "Agg Lagy Is Mohabbat Ko.mp4",
      "Revange of Cangyang Sea Clip.mp4"
    ]),
    "branding": createCategoryItems("Branding", [
      "Business_Card_Mockup_4.jpg",
      "Envelope-Mockups-3.jpg"
    ]),
    "logo-designing": createCategoryItems("Logo designing", [
      "Cascadia Logo Mockup.png",
      "Cascadia Logo.jpg",
      "Khushbu Logo Mockup.png",
      "Khushbu Logo.png",
      "Kohinoor Logo Mockup 1.png",
      "Kohinoor Logo Mockup 2.png",
      "Kohinoor Logo Mockup 3.png",
      "Kohinoor Logo.jpg",
      "Modern Pets N Pet mock up.png",
      "Nailvana Logo Mockup 1.png",
      "Naivana Logo Mockup 2.png",
      "Pets n Pet Logo.JPG",
      "Quiz Rush Logo Mockup 1.jpeg",
      "Quiz Rush Logo.png"
    ]),
    "manipulation": createCategoryItems("Manipulation", [
      "Manipulation Post 1.jpg"
    ]),
    "motion-graphics": createCategoryItems("Motion Graphics", [
      "Boba Coffee Poster Motion Graphic.mp4",
      "Chocolate Ad.mp4",
      "Final Fibroid.mp4",
      "Fizi.mp4",
      "Ketchup Add.mp4",
      "Pickle.mp4"
    ]),
    "social-media-post": createCategoryItems("Social Media Post", [
      "Explore Pakistan 1.jpg",
      "Explore Pakistan 2.jpg",
      "Explore Pakistan 3.jpg",
      "Explore Pakistan 4.jpg",
      "Explore Pakistan 5.jpg",
      "Hiring sales representative.jpg",
      "Magazine with Flowers Mockup.jpg",
      "Need A Designer.jpg",
      "Need A Growth Hacker.jpg",
      "Social Media Post 1.jpg",
      "Social Media Post 2.jpg",
      "Social Media Post 3.jpg"
    ]),
    "video-editing": createCategoryItems("Video Editing", [
      "Hacathone.mp4",
      "Lesson 1 Flat Illutration.mp4",
      "Lesson 2 Flat Illutration.mp4",
      "Lesson 3 Flat Illutration.mp4",
      "SAP.mp4"
    ])
  };

  const galleryModal = document.querySelector("#portfolio-gallery-modal");
  const categoryTitle = document.querySelector("#modal-category-title");
  const categorySubtitle = document.querySelector("#modal-category-subtitle");
  const categoryCount = document.querySelector("#modal-category-count");
  const galleryGrid = document.querySelector("#modal-gallery-grid");

  const renderGalleryMedia = (item, index) => {
    const videoExtension = item.src.match(/\.(mp4|webm|mov)$/i)?.[1]?.toLowerCase();
    const videoTypes = {
      mp4: "video/mp4",
      webm: "video/webm",
      mov: "video/quicktime"
    };
    const isVideo = Boolean(videoExtension);
    const mediaMarkup = isVideo
      ? `<video controls playsinline preload="metadata" width="100%" aria-label="${item.title}" style="width:100%; aspect-ratio:16/9; background:#000;"><source src="${item.src}" type="${videoTypes[videoExtension]}">Your browser does not support the video tag.</video>`
      : `<img src="${item.src}" alt="${item.title}" loading="lazy" decoding="async">`;

    return `
      <article class="gallery-item">
        <div class="gallery-media"${isVideo ? ' style="aspect-ratio:16/9"' : ""}>${mediaMarkup}</div>
        <div class="gallery-item-info">
          <span class="project-num">#${index + 1}</span>
          <p>${item.title}</p>
        </div>
      </article>
    `;
  };

  const openCategoryGallery = (category) => {
    if (!(galleryModal instanceof HTMLDialogElement) || !galleryGrid || !categoryTitle || !categoryCount || !categorySubtitle) return;

    const categoryItems = categoryGalleryData[category];
    if (!categoryItems || !categoryItems.length) return;

    const heading = document.querySelector(`.portfolio-card[data-category="${category}"] h3`)?.textContent || "Category Projects";
    categoryTitle.textContent = heading;
    categorySubtitle.textContent = "Explore all projects in this category";
    categoryCount.textContent = `Showing all ${categoryItems.length} media items`;
    galleryGrid.innerHTML = categoryItems.map(renderGalleryMedia).join("");
    galleryModal.showModal();
  };

  document.querySelectorAll(".portfolio-card").forEach((card) => {
    const category = card.dataset.category;
    if (!category) return;

    card.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest("button, a, video")) return;
      openCategoryGallery(category);
    });

    card.addEventListener("keydown", (event) => {
      if ((event.key === "Enter" || event.key === " ") && document.activeElement === card) {
        event.preventDefault();
        openCategoryGallery(category);
      }
    });
  });

  document.querySelectorAll(".open-gallery-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const category = button.dataset.category;
      if (category) openCategoryGallery(category);
    });
  });

  galleryModal?.querySelector(".modal-close")?.addEventListener("click", () => {
    galleryModal.close();
  });

  galleryModal?.addEventListener("click", (event) => {
    if (event.target === galleryModal) galleryModal.close();
  });
})();
