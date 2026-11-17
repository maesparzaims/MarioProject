"use strict";

const CONTACT_EMAIL = "mario_esparza1@hotmail.com";
const placeholderEmail = "tu.correo@ejemplo.com";

const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#site-nav");

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? "Abrir menú" : "Cerrar menú");
  siteNav.classList.toggle("is-open", !isExpanded);
});

siteNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú");
    siteNav.classList.remove("is-open");
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú");
    siteNav.classList.remove("is-open");
  }
});

document.querySelector("#current-year").textContent = String(new Date().getFullYear());

const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (CONTACT_EMAIL === placeholderEmail) {
    formStatus.dataset.state = "error";
    formStatus.textContent = "Configura tu correo de destino en script.js antes de publicar el portafolio.";
    return;
  }

  const formData = new FormData(contactForm);
  const name = formData.get("name").trim();
  const email = formData.get("email").trim();
  const message = formData.get("message").trim();
  const subject = encodeURIComponent(`Mensaje de portafolio — ${name}`);
  const body = encodeURIComponent(`Nombre: ${name}\nCorreo: ${email}\n\n${message}`);

  formStatus.dataset.state = "success";
  formStatus.textContent = "Abriendo tu aplicación de correo con el mensaje listo para enviar.";
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
});

const canvas = document.querySelector(".particle-canvas");
const context = canvas.getContext("2d");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const revealElements = document.querySelectorAll(".reveal");
const PARTICLE_LINK_DISTANCE = 105;
const PARTICLE_LINK_DISTANCE_SQUARED = PARTICLE_LINK_DISTANCE * PARTICLE_LINK_DISTANCE;
const POINTER_LINK_DISTANCE = 210;
const POINTER_ATTRACTION_RADIUS = 260;

if ("IntersectionObserver" in window && !motionPreference.matches) {
  document.documentElement.classList.add("has-reveal");
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("visible"));
}

const pointer = { x: -1000, y: -1000, active: false };
let particles = [];
let animationFrame = 0;
let lastFrame = 0;

function resizeCanvas() {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * pixelRatio);
  canvas.height = Math.floor(window.innerHeight * pixelRatio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const count = Math.min(140, Math.floor((window.innerWidth * window.innerHeight) / 9000));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.22,
    vy: (Math.random() - 0.5) * 0.22,
    radius: Math.random() * 1.8 + 1.1,
    alpha: Math.random() * 0.36 + 0.42,
  }));
}

function drawParticles(timestamp) {
  if (timestamp - lastFrame < 32) {
    animationFrame = window.requestAnimationFrame(drawParticles);
    return;
  }
  lastFrame = timestamp;

  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  if (pointer.active) {
    const glow = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 220);
    glow.addColorStop(0, "rgba(183, 216, 131, 0.34)");
    glow.addColorStop(0.45, "rgba(137, 180, 103, 0.16)");
    glow.addColorStop(1, "rgba(137, 180, 103, 0)");
    context.fillStyle = glow;
    context.fillRect(pointer.x - 220, pointer.y - 220, 440, 440);
  }

  particles.forEach((particle, index) => {
    const dx = pointer.x - particle.x;
    const dy = pointer.y - particle.y;
    const distance = Math.hypot(dx, dy);

    if (pointer.active && distance < POINTER_ATTRACTION_RADIUS && distance > 0) {
      const influence = Math.min(1, (POINTER_ATTRACTION_RADIUS - distance) / 55);
      const targetSpeed = Math.min(1.6, distance * 0.02) * influence;
      particle.vx += ((dx / distance) * targetSpeed - particle.vx) * 0.14;
      particle.vy += ((dy / distance) * targetSpeed - particle.vy) * 0.14;
    }

    particle.vx += (Math.random() - 0.5) * 0.003;
    particle.vy += (Math.random() - 0.5) * 0.003;
    particle.vx *= 0.994;
    particle.vy *= 0.994;
    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.x < -5) particle.x = window.innerWidth + 5;
    if (particle.x > window.innerWidth + 5) particle.x = -5;
    if (particle.y < -5) particle.y = window.innerHeight + 5;
    if (particle.y > window.innerHeight + 5) particle.y = -5;

    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    const cursorHighlight = pointer.active && distance < 190 ? (1 - distance / 190) * 0.62 : 0;
    context.fillStyle = `rgba(205, 235, 169, ${Math.min(1, particle.alpha + cursorHighlight)})`;
    context.fill();

    if (pointer.active && distance < POINTER_LINK_DISTANCE) {
      context.beginPath();
      context.moveTo(particle.x, particle.y);
      context.lineTo(pointer.x, pointer.y);
      context.lineWidth = 1.2;
      context.strokeStyle = `rgba(190, 225, 151, ${0.68 * (1 - distance / POINTER_LINK_DISTANCE)})`;
      context.stroke();
    }

    for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
      const next = particles[nextIndex];
      const offsetX = particle.x - next.x;
      const offsetY = particle.y - next.y;
      const separationSquared = offsetX * offsetX + offsetY * offsetY;
      if (separationSquared < PARTICLE_LINK_DISTANCE_SQUARED) {
        const separation = Math.sqrt(separationSquared);
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(next.x, next.y);
        context.lineWidth = 1;
        context.strokeStyle = `rgba(160, 192, 131, ${0.14 * (1 - separation / PARTICLE_LINK_DISTANCE)})`;
        context.stroke();
      }
    }
  });

  animationFrame = window.requestAnimationFrame(drawParticles);
}

function stopParticles() {
  window.cancelAnimationFrame(animationFrame);
  animationFrame = 0;
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
}

function syncMotionPreference() {
  if (motionPreference.matches || document.hidden) {
    pointer.active = false;
    stopParticles();
    return;
  }
  resizeCanvas();
  window.cancelAnimationFrame(animationFrame);
  animationFrame = window.requestAnimationFrame(drawParticles);
}

let resizeFrame = 0;
window.addEventListener("resize", () => {
  if (resizeFrame) return;
  resizeFrame = window.requestAnimationFrame(() => {
    resizeFrame = 0;
    if (!motionPreference.matches && !document.hidden) resizeCanvas();
  });
}, { passive: true });
window.addEventListener("pointermove", (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.active = true;
}, { passive: true });
window.addEventListener("pointerleave", () => {
  pointer.x = -1000;
  pointer.y = -1000;
  pointer.active = false;
});
document.addEventListener("visibilitychange", syncMotionPreference);

if (typeof motionPreference.addEventListener === "function") {
  motionPreference.addEventListener("change", syncMotionPreference);
}
syncMotionPreference();
