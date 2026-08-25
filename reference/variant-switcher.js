"use strict";

(() => {
  const LABELS = {
    a: "OPTION A",
    b: "OPTION B",
    c: "CURRENT",
  };

  function host() {
    try {
      return window.parent !== window ? window.parent.RedStampHost : null;
    } catch {
      return null;
    }
  }

  function activeVariant() {
    return host()?.variantFromHash?.() || "c";
  }

  function selectVariant(variant) {
    try {
      window.parent.location.hash = variant === "c" ? "#c" : `#${variant}`;
    } catch {
      // The reference surface is expected to be same-origin with its host.
    }
  }

  function ensureSwitcher() {
    let switcher = document.querySelector("#reference-variant-switcher");
    if (switcher) return switcher;
    switcher = document.createElement("nav");
    switcher.id = "reference-variant-switcher";
    switcher.setAttribute("aria-label", "Gameplay interface option");
    switcher.innerHTML = `
      <span data-variant-label></span>
      <button data-variant="c" type="button">CURRENT</button>
      <button data-variant="a" type="button">A</button>
      <button data-variant="b" type="button">B</button>`;
    switcher.addEventListener("click", (event) => {
      const button = event.target.closest?.("[data-variant]");
      if (button) selectVariant(button.dataset.variant);
    });
    document.body.append(switcher);
    return switcher;
  }

  function sync() {
    const started = Boolean(host()?.snapshot?.()?.state?.started);
    if (!started) {
      document.querySelector("#reference-variant-switcher")?.remove();
      return;
    }
    const variant = activeVariant();
    const switcher = ensureSwitcher();
    switcher.dataset.activeVariant = variant;
    switcher.querySelector("[data-variant-label]").textContent = `UI · ${LABELS[variant]}`;
    for (const button of switcher.querySelectorAll("[data-variant]")) {
      button.setAttribute("aria-pressed", String(button.dataset.variant === variant));
    }
  }

  window.setInterval(sync, 180);
  sync();
})();
