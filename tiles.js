(() => {
  const canvas = document.getElementById('tile-background');
  if (!canvas) return;
  const context = canvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, frame = 0, strength = 0;
  let pointer = { x: -1000, y: -1000 }, active = false;
  function resize() {
    width = window.innerWidth; height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * ratio; canvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    if (active) start();
  }
  function draw() {
    frame = 0;
    strength += ((active ? 1 : 0) - strength) * 0.14;
    context.clearRect(0, 0, width, height);
    if (strength < 0.005 && !active) { strength = 0; return; }
    const size = 64, radius = 205;
    const column = Math.floor(pointer.x / size), row = Math.floor(pointer.y / size);
    for (let y = row - 4; y <= row + 4; y++) {
      for (let x = column - 4; x <= column + 4; x++) {
        const left = x * size, top = y * size;
        const distance = Math.hypot(left + size / 2 - pointer.x, top + size / 2 - pointer.y);
        const glow = Math.max(0, 1 - distance / radius) * strength;
        if (!glow) continue;
        context.fillStyle = `rgba(38,38,209,${glow * 0.065})`;
        context.strokeStyle = `rgba(38,38,209,${glow * 0.16})`;
        context.lineWidth = 1;
        context.fillRect(left + 3, top + 3, size - 6, size - 6);
        context.strokeRect(left + 3.5, top + 3.5, size - 7, size - 7);
      }
    }
    if (Math.abs((active ? 1 : 0) - strength) > 0.005) start();
  }
  function start() { if (!frame) frame = requestAnimationFrame(draw); }
  function clear() { active = false; start(); }
  window.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || reducedMotion.matches) return;
    pointer = { x: event.clientX, y: event.clientY };
    active = true; start();
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', clear);
  window.addEventListener('blur', clear);
  window.addEventListener('resize', resize, { passive: true });
  reducedMotion.addEventListener('change', clear);
  resize();
})();
