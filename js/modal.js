(() => {
  const portfolioModal = document.querySelector("#portfolio-modal");

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

        const renderImage = () => {
          image.src = imageUrls[currentImage];
          image.alt = `${title} project preview ${currentImage + 1} of ${imageUrls.length}`;
          counter.textContent = `${currentImage + 1} / ${imageUrls.length}`;
        };
        const counter = document.createElement("span");
        counter.className = "gallery-count";
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
