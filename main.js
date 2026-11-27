(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.getElementById("siteHeader");
  const progress = document.getElementById("scrollProgress");
  const backToTop = document.getElementById("backToTop");
  const navToggle = document.getElementById("navToggle");
  const mobileNav = document.getElementById("mobileNav");
  const year = document.getElementById("currentYear");

  if (year) year.textContent = new Date().getFullYear();

  const closeMenu = () => {
    if (!navToggle || !mobileNav) return;
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation menu");
    mobileNav.hidden = true;
    document.body.classList.remove("menu-open");
  };

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
      mobileNav.hidden = isOpen;
      document.body.classList.toggle("menu-open", !isOpen);
    });
    mobileNav.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closeMenu();
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 800) closeMenu();
    });
  }

  let scrollTicking = false;
  const updateScrollUI = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;
    if (progress) progress.style.width = `${ratio * 100}%`;
    if (header) header.classList.toggle("is-scrolled", scrollTop > 30);
    if (backToTop) backToTop.classList.toggle("visible", scrollTop > 600);
    scrollTicking = false;
  };
  window.addEventListener("scroll", () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(updateScrollUI);
      scrollTicking = true;
    }
  }, { passive: true });
  updateScrollUI();

  if (backToTop) {
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" }));
  }

  const revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    revealElements.forEach(element => revealObserver.observe(element));
  } else {
    revealElements.forEach(element => element.classList.add("is-visible"));
  }

  const counters = document.querySelectorAll("[data-count]");
  const formatCounter = (value, decimals) => new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);

  const animateCounter = element => {
    const target = Number(element.dataset.count || 0);
    const decimals = Number(element.dataset.decimals || 0);
    if (!Number.isFinite(target)) return;
    if (reducedMotion) {
      element.textContent = formatCounter(target, decimals);
      return;
    }
    const duration = 1250;
    const start = performance.now();
    const step = now => {
      const progressValue = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progressValue, 4);
      element.textContent = formatCounter(target * eased, decimals);
      if (progressValue < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.7 });
    counters.forEach(counter => counterObserver.observe(counter));
  } else {
    counters.forEach(animateCounter);
  }

  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".desktop-nav a");
  if ("IntersectionObserver" in window && navLinks.length) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            const active = link.getAttribute("href") === `#${entry.target.id}`;
            link.classList.toggle("active", active);
          });
        }
      });
    }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });
    sections.forEach(section => sectionObserver.observe(section));
  }
})();
