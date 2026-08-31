(function () {
  function visibleImageFor(diagram) {
    var images = diagram.querySelectorAll("img");
    for (var i = 0; i < images.length; i += 1) {
      if (window.getComputedStyle(images[i]).display !== "none") {
        return images[i];
      }
    }
    return images[0] || null;
  }

  function closeLightbox(lightbox) {
    lightbox.classList.remove("is-open");
    lightbox.querySelector("img").removeAttribute("src");
  }

  function applyConfiguredWidths() {
    document.querySelectorAll(".theme-diagram[width]").forEach(function (diagram) {
      if (diagram.style.getPropertyValue("--diagram-width")) {
        return;
      }
      diagram.style.setProperty("--diagram-width", diagram.getAttribute("width"));
    });
  }

  function initDiagramLightbox() {
    var lightbox = document.createElement("div");
    lightbox.className = "diagram-lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Expanded diagram");

    var closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Close expanded diagram");
    closeButton.textContent = "x";

    var expandedImage = document.createElement("img");
    expandedImage.alt = "";

    lightbox.appendChild(closeButton);
    lightbox.appendChild(expandedImage);
    document.body.appendChild(lightbox);

    applyConfiguredWidths();

    document.querySelectorAll(".theme-diagram").forEach(function (diagram) {
      diagram.addEventListener("click", function () {
        var image = visibleImageFor(diagram);
        if (!image || !image.getAttribute("src")) {
        }
        expandedImage.src = image.src;
        expandedImage.alt = image.alt || "Expanded diagram";
        var isLight = image.classList.contains("diagram-light");
        lightbox.classList.toggle("is-light", isLight);
        lightbox.classList.add("is-open");
      });
    });

    closeButton.addEventListener("click", function () {
      closeLightbox(lightbox);
    });

    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox || event.target === expandedImage) {
        closeLightbox(lightbox);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
        closeLightbox(lightbox);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDiagramLightbox);
  } else {
    initDiagramLightbox();
  }
})();
