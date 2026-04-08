export const slowScroll = (id) => {
  const element = document.getElementById(id);
  if (!element) return;
  const targetPosition = element.getBoundingClientRect().top + window.pageYOffset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  const duration = 1000; // Slower duration for a more relaxed glide
  let start = null;

  function step(timestamp) {
    if (!start) start = timestamp;
    const progress = timestamp - start;
    const percent = Math.min(progress / duration, 1);
    
    // Easing function: easeInOutQuad (smooth, but avoids the aggressive fast-slow-fast of Cubic)
    const easing = percent < 0.5 ? 2 * percent * percent : 1 - Math.pow(-2 * percent + 2, 2) / 2;
    
    window.scrollTo(0, startPosition + distance * easing);
    if (progress < duration) {
      window.requestAnimationFrame(step);
    }
  }
  window.requestAnimationFrame(step);
};
