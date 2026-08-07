const defaultProps = {
  easing: "cubic-bezier(0.5, 0, 0, 1)",
  distance: "30px",
  origin: "bottom",
  duration: 500,
  desktop: true,
  mobile: true,
  viewFactor: 0.1, // Trigger animation when 20% of element is visible
  viewOffset: { top: 0, bottom: -300 }, // Add offset for earlier triggering
};
// Hero Section
ScrollReveal().reveal(".hero-title", {
  ...defaultProps,
  delay: 500,
  origin: window.innerWidth > 768 ? "left" : "bottom",
});
ScrollReveal().reveal(".name", {
  ...defaultProps,
  distance: "0px",
  delay: 700,
  scale: 0,
});
ScrollReveal().reveal(".hero-cta", {
  ...defaultProps,
  delay: 700,
  origin: window.innerWidth > 768 ? "left" : "bottom",
});
ScrollReveal().reveal(".scroll-down-link", {
  ...defaultProps,
  delay: 700,
  origin: "top",
});

/* About Section */
ScrollReveal().reveal(".section-title", {
  ...defaultProps,
  delay: 100,
  distance: "0px",
  viewOffset: { top: 0, bottom: -100 },
});
ScrollReveal().reveal(".about-wrapper__image", {
  ...defaultProps,
  delay: 200,
  scale: 0.5,
  viewOffset: { top: 0, bottom: -100 },
});

ScrollReveal().reveal(".about-wrapper__info", {
  ...defaultProps,
  delay: 200,
  distance: "100px",
  origin: window.innerWidth > 768 ? "left" : "top",
  viewOffset: { top: 0, bottom: -100 },
});

/* Projects Section */
ScrollReveal().reveal(".project-wrapper__text", {
  ...defaultProps,
  delay: 300,
  origin: window.innerWidth > 768 ? "left" : "bottom",
});

ScrollReveal().reveal(".project-wrapper__image", {
  ...defaultProps,
  delay: 300,
  scale: 0.9,
  origin: window.innerWidth > 768 ? "right" : "bottom",
});

/* Contact Section */
ScrollReveal().reveal(".contact-wrapper", {
  ...defaultProps,
  delay: 600,
});

ScrollReveal().reveal('.social-links', {
	...defaultProps,
	delay: 500,
});

ScrollReveal().reveal('.fa-angle-up', {
    ...defaultProps,
    delay: 500,
});
