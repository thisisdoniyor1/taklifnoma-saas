let activeFrame = null;
let removeInterruptListeners = null;

const clearActiveScroll = () => {
  if (activeFrame !== null) {
    window.cancelAnimationFrame(activeFrame);
    activeFrame = null;
  }

  if (typeof removeInterruptListeners === 'function') {
    removeInterruptListeners();
    removeInterruptListeners = null;
  }
};

const resolveOffset = (offset) => {
  if (typeof offset === 'number') {
    return offset;
  }

  const navbar = document.querySelector('[data-app-navbar="true"]');
  if (!navbar) {
    return 112;
  }

  return Math.round(navbar.getBoundingClientRect().height + 24);
};

const resolveDuration = (distance, duration) => {
  if (typeof duration === 'number') {
    return duration;
  }

  return Math.min(Math.max(Math.abs(distance) * 0.6, 600), 1200);
};

const animateWindowScroll = (targetPosition, duration) => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const safeTargetPosition = Math.max(targetPosition, 0);

  if (prefersReducedMotion) {
    clearActiveScroll();
    window.scrollTo({ top: safeTargetPosition, left: 0, behavior: 'auto' });
    return;
  }

  clearActiveScroll();

  const startPosition = window.scrollY;
  const distance = safeTargetPosition - startPosition;
  const resolvedDuration = resolveDuration(distance, duration);

  if (Math.abs(distance) < 2) {
    window.scrollTo({ top: safeTargetPosition, left: 0, behavior: 'auto' });
    return;
  }

  let startTime = null;

  const easeInOutQuart = (progress) => (
    progress < 0.5
      ? 8 * progress * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 4) / 2
  );

  const interruptScroll = () => {
    clearActiveScroll();
  };

  window.addEventListener('wheel', interruptScroll, { passive: true });
  window.addEventListener('touchstart', interruptScroll, { passive: true });
  removeInterruptListeners = () => {
    window.removeEventListener('wheel', interruptScroll);
    window.removeEventListener('touchstart', interruptScroll);
  };

  const step = (timestamp) => {
    if (startTime === null) {
      startTime = timestamp;
    }

    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / resolvedDuration, 1);
    const eased = easeInOutQuart(progress);

    window.scrollTo({ top: startPosition + distance * eased, left: 0, behavior: 'auto' });

    if (progress < 1) {
      activeFrame = window.requestAnimationFrame(step);
      return;
    }

    clearActiveScroll();
  };

  activeFrame = window.requestAnimationFrame(step);
};

export const slowScroll = (id, offset, duration) => {
  const element = document.getElementById(id);
  if (!element) {
    return;
  }

  const targetPosition = element.getBoundingClientRect().top + window.scrollY - resolveOffset(offset);
  animateWindowScroll(targetPosition, duration);
};

export const smoothScrollToTop = (duration = 760) => {
  animateWindowScroll(0, duration);
};
