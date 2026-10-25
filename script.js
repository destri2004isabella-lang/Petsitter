(() => {
  "use strict";

  const WHATSAPP_NUMBER = "5521989482058";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector("#menu-mobile");
  const menuClose = document.querySelector(".mobile-menu-close");
  const menuScrim = document.querySelector(".menu-scrim");
  const desktopNav = document.querySelector(".desktop-nav");

  let menuOpen = false;
  let lastFocusedElement = null;

  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  const getMenuFocusables = () => {
    if (!mobileMenu) return [];
    return Array.from(
      mobileMenu.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter((element) => element.offsetParent !== null);
  };

  const openMenu = () => {
    if (!mobileMenu || !menuToggle || menuOpen) return;
    menuOpen = true;
    lastFocusedElement = document.activeElement;
    mobileMenu.classList.add("is-open");
    menuScrim?.classList.add("is-visible");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Fechar menu");
    mobileMenu.setAttribute("aria-hidden", "false");
    mobileMenu.removeAttribute("inert");
    document.body.classList.add("menu-open");
    window.setTimeout(() => menuClose?.focus(), 60);
  };

  const closeMenu = ({ restoreFocus = true } = {}) => {
    if (!mobileMenu || !menuToggle || !menuOpen) return;
    menuOpen = false;
    mobileMenu.classList.remove("is-open");
    menuScrim?.classList.remove("is-visible");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menu");
    mobileMenu.setAttribute("aria-hidden", "true");
    mobileMenu.setAttribute("inert", "");
    document.body.classList.remove("menu-open");
    if (restoreFocus) {
      const target = lastFocusedElement instanceof HTMLElement ? lastFocusedElement : menuToggle;
      window.setTimeout(() => target.focus(), 60);
    }
  };

  menuToggle?.addEventListener("click", () => {
    if (menuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  menuClose?.addEventListener("click", () => closeMenu());
  menuScrim?.addEventListener("click", () => closeMenu());

  mobileMenu?.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", () => closeMenu({ restoreFocus: false }));
  });

  document.addEventListener("keydown", (event) => {
    if (!menuOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      return;
    }

    if (event.key !== "Tab") return;

    const focusables = getMenuFocusables();
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  });

  const desktopQuery = window.matchMedia("(min-width: 980px)");
  const handleDesktopChange = (event) => {
    if (event.matches && menuOpen) closeMenu({ restoreFocus: false });
  };

  if (typeof desktopQuery.addEventListener === "function") {
    desktopQuery.addEventListener("change", handleDesktopChange);
  } else if (typeof desktopQuery.addListener === "function") {
    desktopQuery.addListener(handleDesktopChange);
  }

  const navLinks = Array.from(document.querySelectorAll(".desktop-nav a[href^='#']"));
  const trackedSections = navLinks
    .map((link) => {
      const id = link.getAttribute("href");
      const section = id ? document.querySelector(id) : null;
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  if (trackedSections.length && "IntersectionObserver" in window) {
    const activeSectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const match = trackedSections.find(({ section }) => section === entry.target);
          if (!match) return;
          navLinks.forEach((link) => link.classList.remove("is-active"));
          match.link.classList.add("is-active");
        });
      },
      { rootMargin: "-28% 0px -58% 0px", threshold: 0 }
    );

    trackedSections.forEach(({ section }) => activeSectionObserver.observe(section));
  }

  const revealElements = Array.from(document.querySelectorAll(".reveal"));
  const canAnimate = "IntersectionObserver" in window && !prefersReducedMotion.matches;

  if (revealElements.length) {
    if (!canAnimate) {
      revealElements.forEach((element) => element.classList.add("is-visible"));
    } else {
      document.documentElement.classList.add("reveal-ready");
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );

      revealElements.forEach((element) => revealObserver.observe(element));
    }
  }

  document.querySelectorAll(".js-accordion").forEach((group) => {
    const items = Array.from(group.querySelectorAll("details"));
    items.forEach((item) => {
      item.addEventListener("toggle", () => {
        if (!item.open) return;
        items.forEach((other) => {
          if (other !== item && other.open) other.open = false;
        });
      });
    });
  });

  const checklist = document.querySelector(".checklist");
  const checklistInputs = Array.from(document.querySelectorAll(".prep-check"));
  const checklistCount = document.querySelector("#checklist-count");
  const checklistBar = document.querySelector("#checklist-bar");
  const checklistMessage = document.querySelector("#checklist-message");
  const progressTrack = document.querySelector(".progress-track");
  const checklistReset = document.querySelector("#checklist-reset");
  const CHECKLIST_KEY = "isabella-destri-pet-sitter-checklist";

  const getSavedChecklist = () => {
    try {
      const saved = window.localStorage.getItem(CHECKLIST_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      return [];
    }
  };

  const saveChecklist = (values) => {
    try {
      window.localStorage.setItem(CHECKLIST_KEY, JSON.stringify(values));
    } catch (error) {
      /* O checklist continua funcionando sem armazenamento local. */
    }
  };

  const updateChecklist = ({ persist = true, announce = false } = {}) => {
    if (!checklistInputs.length) return;

    const checked = checklistInputs.filter((input) => input.checked);
    const total = checklistInputs.length;
    const count = checked.length;
    const percentage = total ? (count / total) * 100 : 0;

    if (checklistCount) checklistCount.textContent = `${count} de ${total} itens`;
    if (checklistBar) checklistBar.style.width = `${percentage}%`;
    if (progressTrack) progressTrack.setAttribute("aria-valuenow", String(count));

    if (checklistMessage) {
      checklistMessage.classList.toggle("is-complete", count === total);
      if (count === total) {
        checklistMessage.textContent = "Tudo pronto para a pré-visita. Você organizou todos os itens.";
      } else if (count === 0) {
        checklistMessage.textContent = "Marque os itens conforme for organizando.";
      } else {
        checklistMessage.textContent = `Você já organizou ${count} ${count === 1 ? "item" : "itens"}.`;
      }
    }

    if (persist) {
      saveChecklist(checked.map((input) => input.value));
    }

    if (announce && checklistMessage) {
      checklistMessage.setAttribute("data-announce", "true");
    }
  };

  if (checklistInputs.length) {
    const savedValues = new Set(getSavedChecklist());
    checklistInputs.forEach((input) => {
      input.checked = savedValues.has(input.value);
      input.addEventListener("change", () => updateChecklist({ announce: true }));
    });

    updateChecklist({ persist: false });

    checklistReset?.addEventListener("click", () => {
      checklistInputs.forEach((input) => {
        input.checked = false;
      });
      updateChecklist();
      checklistInputs[0]?.focus();
    });
  }

  const contactForm = document.querySelector("#contact-form");
  const formResult = document.querySelector("#form-result");
  const formFallback = document.querySelector("#form-fallback");

  if (contactForm) {
    const hideFormResult = () => {
      if (formResult) formResult.hidden = true;
    };

    contactForm.addEventListener("input", hideFormResult);
    contactForm.addEventListener("change", hideFormResult);

    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!contactForm.reportValidity()) return;

      const formData = new FormData(contactForm);
      const name = String(formData.get("nome") || "").trim();
      const species = String(formData.get("especie") || "").trim();
      const quantity = String(formData.get("quantidade") || "").trim();
      const period = String(formData.get("periodo") || "").trim();
      const notes = String(formData.get("mensagem") || "").trim();

      const lines = [
        "Olá, Isabella! Conheci seu site e gostaria de saber mais sobre seus serviços de Pet Sitter e agendar a pré-visita gratuita.",
        "",
        `Nome: ${name}`,
        `Espécie: ${species}`,
        `Quantidade de animais: ${quantity}`,
        `Período desejado: ${period}`
      ];

      if (notes) lines.push(`Mensagem: ${notes}`);

      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;

      if (formFallback) formFallback.href = url;
      if (formResult) formResult.hidden = false;

      const openedWindow = window.open(url, "_blank", "noopener,noreferrer");
      if (openedWindow) openedWindow.opener = null;
    });
  }

  const year = document.querySelector("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  const handleMotionPreference = (event) => {
    if (!event.matches) return;
    document.documentElement.classList.remove("reveal-ready");
    revealElements.forEach((element) => element.classList.add("is-visible"));
  };

  if (typeof prefersReducedMotion.addEventListener === "function") {
    prefersReducedMotion.addEventListener("change", handleMotionPreference);
  } else if (typeof prefersReducedMotion.addListener === "function") {
    prefersReducedMotion.addListener(handleMotionPreference);
  }
})();
