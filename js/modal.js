(() => {
  const portfolioModal = document.querySelector("#portfolio-modal");
  const galleryModal = document.querySelector("#portfolio-gallery-modal");

  const categoryGalleryData = {
    "2d-character": [
      { title: "2D Character - Concept Art 1", src: "Project/2D Character/Dongfang and orchid.jpg" },
      { title: "2D Character - Character Sheet 2", src: "Project/2D Character/W-Auranzaib.jpg" }
    ],
    "ai-work": [
      { title: "AI Visual Art 1", src: "Project/AI work/Post 1.jpeg" },
      { title: "AI Visual Art 2", src: "Project/AI work/Post 2.jpeg" },
      { title: "AI Visual Art 3", src: "Project/AI work/Post 3.jpeg" },
      { title: "AI Visual Art 4", src: "Project/AI work/Post 4.jpeg" },
      { title: "AI Visual Art 5", src: "Project/AI work/Post 5.jpeg" },
      { title: "AI Visual Art 6", src: "Project/AI work/Post 6.jpeg" },
      { title: "AI Visual Art 7", src: "Project/AI work/Post 7.jpeg" },
      { title: "AI Visual Art 8", src: "Project/AI work/Post 8.jpeg" }
    ],
    "2d-animation": [
      { title: "2D Animation Reel 1", src: "Project/Animation/Agg Lagy Is Mohabbat Ko.mp4" },
      { title: "2D Animation Scene 2", src: "Project/Animation/Revange of Cangyang Sea Clip.mp4" }
    ],
    "branding": [
      { title: "Brand Identity Guide 1", src: "Project/Branding/Business_Card_Mockup_4.jpg" },
      { title: "Brand Identity Guide 2", src: "Project/Branding/Nailvana Bag.jpg" },
      { title: "Brand Identity Guide 3", src: "Project/Branding/Logo.jpg" }
    ],
    "logo-designing": [
      { title: "Logo Design 1", src: "Project/Logo designing/Cascadia Logo Mockup.png" },
      { title: "Logo Design 2", src: "Project/Logo designing/Khushbu Logo Mockup.png" },
      { title: "Logo Design 3", src: "Project/Logo designing/Quiz Rush Logo.png" }
    ],
    "manipulation": [
      { title: "Photo Manipulation 1", src: "Project/Manipulation/Manipulation Post 1.jpg" }
    ],
    "motion-graphics": [
      { title: "Motion Graphics Work 1", src: "Project/Motion Graphics/Boba Coffee Poster Motion Graphic.mp4" },
      { title: "Motion Graphics Work 2", src: "Project/Motion Graphics/Chocolate Ad.mp4" }
    ],
    "social-media-post": [
      { title: "Social Media Creative 1", src: "Project/Social Media Post/Explore Pakistan 1.jpg" },
      { title: "Social Media Creative 2", src: "Project/Social Media Post/Hiring sales representative.jpg" },
      { title: "Social Media Creative 3", src: "Project/Social Media Post/Need A Designer.jpg" }
    ],
    "video-editing": [
      { title: "Video Edit Showreel 1", src: "Project/Video Editing/Hacathone.mp4" },
      { title: "Video Edit Showreel 2", src: "Project/Video Editing/Lesson 1 Flat Illutration.mp4" }
    ]
  };

  const renderGalleryItems = (category, data) => {
    const modalTitle = document.querySelector("#modal-category-title");
    const modalSubtitle = document.querySelector("#modal-category-subtitle");
    const modalCount = document.querySelector("#modal-category-count");
    const galleryGrid = document.querySelector("#modal-gallery-grid");

    if (!galleryGrid || !modalTitle || !modalSubtitle || !modalCount) return;

    const cardTitle = document.querySelector(`.portfolio-card[data-category="${category}"] h3`)?.textContent || "Category Work";
    modalTitle.textContent = cardTitle;
    modalSubtitle.textContent = "Explore all projects in this category";
    modalCount.textContent = `Showing all ${data.length} projects`;

    galleryGrid.innerHTML = data.map((item, index) => {
      const isVideo = item.src.toLowerCase().endsWith(".mp4");
      const mediaMarkup = isVideo
        ? `<video src="${item.src}" controls playsinline preload="metadata" aria-label="${item.title}"></video>`
        : `<img src="${item.src}" alt="${item.title}" loading="lazy" />`;

      return `
        <div class="gallery-item">
          <div class="gallery-img-wrapper">
            ${mediaMarkup}
          </div>
          <div class="gallery-item-info">
            <span class="project-num">#${index + 1}</span>
            <p>${item.title}</p>
          </div>
        </div>
      `;
    }).join("");
  };

  const openGalleryModal = (category) => {
    if (!(galleryModal instanceof HTMLDialogElement)) return;
    const data = categoryGalleryData[category];
    if (!data || !data.length) return;
    renderGalleryItems(category, data);
    galleryModal.showModal();
  };

  galleryModal?.querySelector(".modal-close")?.addEventListener("click", () => {
    galleryModal.close();
  });

  galleryModal?.addEventListener("click", (event) => {
    if (event.target === galleryModal) galleryModal.close();
  });

  document.querySelectorAll(".open-gallery-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const category = button.dataset.category;
      if (category) openGalleryModal(category);
    });
  });

  if (!(portfolioModal instanceof HTMLDialogElement)) return;

  const modalMedia = portfolioModal.querySelector("#modal-media");
  const modalTitle = portfolioModal.querySelector("#modal-title");
  const modalDescription = portfolioModal.querySelector("#modal-description");
  const modalKicker = portfolioModal.querySelector("#modal-kicker");
  const modalProjectLink = portfolioModal.querySelector("#modal-project-link");

  document.querySelectorAll(".portfolio-card").forEach((card) => {
    const trigger = card.querySelector(".portfolio-preview");
    if (!(trigger instanceof HTMLButtonElement)) return;

    trigger.addEventListener("click", () => {
      const title = card.dataset.title || card.querySelector("h3")?.textContent || "Selected work";
      const description = card.dataset.description || "";
      const previewType = card.dataset.previewType;
      const mediaUrl = card.dataset.mediaUrl;
      const galleryUrls = (card.dataset.gallery || "").split("|").map((url) => url.trim()).filter(Boolean);
      const projectUrl = card.dataset.behanceUrl;
      const previewArt = card.querySelector(".project-art");
      if (!(modalMedia instanceof HTMLElement) || !(modalTitle instanceof HTMLElement) || !(modalDescription instanceof HTMLElement)) return;

      modalMedia.replaceChildren();
      modalTitle.textContent = title;
      modalDescription.textContent = description;
      if (modalKicker instanceof HTMLElement) {
        modalKicker.textContent = previewType === "video" ? "Motion preview · Concept" : "Selected work · Concept";
      }
      if (modalProjectLink instanceof HTMLAnchorElement) {
        modalProjectLink.hidden = !projectUrl;
        if (projectUrl) modalProjectLink.href = projectUrl;
      }

      if (mediaUrl && previewType === "video") {
        const embedUrl = new URL(mediaUrl, window.location.href);
        const isHostedEmbed = embedUrl.protocol === "https:"
          && ((embedUrl.hostname === "www.youtube-nocookie.com" && embedUrl.pathname.startsWith("/embed/"))
          || (embedUrl.hostname === "www.youtube.com" && embedUrl.pathname.startsWith("/embed/"))
          || (embedUrl.hostname === "player.vimeo.com" && embedUrl.pathname.startsWith("/video/")));

        if (isHostedEmbed) {
          const frame = document.createElement("iframe");
          frame.src = embedUrl.href;
          frame.title = `${title} video preview`;
          frame.allow = "autoplay; encrypted-media; picture-in-picture";
          frame.allowFullscreen = true;
          frame.referrerPolicy = "strict-origin-when-cross-origin";
          modalMedia.append(frame);
        } else {
          const video = document.createElement("video");
          video.src = embedUrl.href;
          video.controls = true;
          video.playsInline = true;
          video.setAttribute("aria-label", `${title} video preview`);
          modalMedia.append(video);
        }
      } else if ((mediaUrl || galleryUrls.length) && previewType === "image") {
        const imageUrls = [mediaUrl, ...galleryUrls].filter((url, index, urls) => url && urls.indexOf(url) === index);
        const gallery = document.createElement("div");
        gallery.className = "modal-gallery";
        const image = document.createElement("img");
        image.alt = `${title} project preview`;
        let currentImage = 0;

        const counter = document.createElement("span");
        counter.className = "gallery-count";
        const renderImage = () => {
          image.src = imageUrls[currentImage];
          image.alt = `${title} project preview ${currentImage + 1} of ${imageUrls.length}`;
          counter.textContent = `${currentImage + 1} / ${imageUrls.length}`;
        };
        if (imageUrls.length > 1) {
          const controls = document.createElement("div");
          controls.className = "gallery-controls";
          const previous = document.createElement("button");
          previous.type = "button";
          previous.setAttribute("aria-label", "Previous project image");
          previous.textContent = "←";
          const next = document.createElement("button");
          next.type = "button";
          next.setAttribute("aria-label", "Next project image");
          next.textContent = "→";
          previous.addEventListener("click", () => {
            currentImage = (currentImage - 1 + imageUrls.length) % imageUrls.length;
            renderImage();
          });
          next.addEventListener("click", () => {
            currentImage = (currentImage + 1) % imageUrls.length;
            renderImage();
          });
          controls.append(previous, next);
          gallery.append(controls);
        }
        renderImage();
        gallery.append(image, counter);
        modalMedia.append(gallery);
      } else if (previewArt instanceof HTMLElement) {
        modalMedia.append(previewArt.cloneNode(true));
      }

      portfolioModal.showModal();
    });
  });

  document.querySelectorAll(".site-modal").forEach((dialog) => {
    dialog.querySelector(".modal-close")?.addEventListener("click", () => {
      if (dialog instanceof HTMLDialogElement) dialog.close();
    });

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog && dialog instanceof HTMLDialogElement) dialog.close();
    });
  });
})();
