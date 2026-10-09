(() => {
  const lens = document.getElementById('cursor-glass');
  const source = document.querySelector('.site-shell');
  if (!lens || !source) return;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const diameter = 106, radius = diameter / 2, zoom = 1.35;
  const view = document.createElement('div');
  view.className = 'glass-view'; view.inert = true;
  lens.append(view);
  // A radial displacement map bends the sampled content toward the lens centre.
  const map = document.createElement('canvas'); map.width = map.height = diameter;
  const ctx = map.getContext('2d');
  const pixels = ctx.createImageData(diameter, diameter);
  for (let py = 0; py < diameter; py++) for (let px = 0; px < diameter; px++) {
    const dx = (px - radius) / radius, dy = (py - radius) / radius;
    const falloff = Math.max(0, 1 - dx * dx - dy * dy);
    const index = (py * diameter + px) * 4;
    pixels.data[index] = 128 - dx * falloff * 110;
    pixels.data[index + 1] = 128 - dy * falloff * 110;
    pixels.data[index + 2] = 128; pixels.data[index + 3] = 255;
  }
  ctx.putImageData(pixels, 0, 0);
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', '0'); svg.setAttribute('height', '0');
  svg.style.position = 'absolute'; svg.setAttribute('aria-hidden', 'true');
  const filter = document.createElementNS(ns, 'filter');
  filter.id = 'fisheye-warp'; filter.setAttribute('x', '0'); filter.setAttribute('y', '0');
  filter.setAttribute('width', '100%'); filter.setAttribute('height', '100%');
  filter.setAttribute('color-interpolation-filters', 'sRGB');
  const image = document.createElementNS(ns, 'feImage');
  image.setAttribute('href', map.toDataURL()); image.setAttribute('result', 'warp');
  const displacement = document.createElementNS(ns, 'feDisplacementMap');
  displacement.setAttribute('in', 'SourceGraphic'); displacement.setAttribute('in2', 'warp');
  displacement.setAttribute('scale', '38'); displacement.setAttribute('xChannelSelector', 'R');
  displacement.setAttribute('yChannelSelector', 'G');
  filter.append(image, displacement); svg.append(filter); lens.append(svg);
  let copy, x = 0, y = 0, targetX = 0, targetY = 0, frame = 0, visible = false, dirty = true;
  function refresh() {
    if (!dirty && copy) return;
    copy = source.cloneNode(true);
    copy.removeAttribute('id');
    copy.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
    copy.querySelectorAll('script,canvas').forEach(element => element.remove());
    copy.setAttribute('aria-hidden', 'true'); copy.inert = true;
    copy.classList.add('glass-copy');
    copy.style.width = `${source.getBoundingClientRect().width}px`;
    view.replaceChildren(copy); dirty = false;
  }
  function place() {
    refresh();
    lens.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
    const bounds = source.getBoundingClientRect();
    copy.style.transform = `translate(${radius - (x - bounds.left) * zoom}px,${radius - (y - bounds.top) * zoom}px) scale(${zoom})`;
  }
  function animate() {
    frame = 0;
    x += (targetX - x) * .28; y += (targetY - y) * .28;
    if (Math.hypot(targetX - x, targetY - y) < .15) { x = targetX; y = targetY; place(); return; }
    place(); if (visible) frame = requestAnimationFrame(animate);
  }
  function hide() { visible = false; lens.classList.remove('is-visible'); cancelAnimationFrame(frame); frame = 0; }
  window.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !finePointer.matches) { hide(); return; }
    targetX = event.clientX; targetY = event.clientY;
    if (!visible || reducedMotion.matches) { x = targetX; y = targetY; place(); }
    visible = true; lens.classList.add('is-visible');
    if (!frame && !reducedMotion.matches) frame = requestAnimationFrame(animate);
  }, { passive: true });
  window.addEventListener('scroll', () => { if (visible) place(); }, { passive: true });
  window.addEventListener('resize', () => { dirty = true; if (visible) place(); }, { passive: true });
  new MutationObserver(() => { dirty = true; if (visible) place(); }).observe(source, { subtree: true, childList: true, characterData: true, attributes: true });
  document.documentElement.addEventListener('pointerleave', hide);
  window.addEventListener('blur', hide);
  document.addEventListener('visibilitychange', () => { if (document.hidden) hide(); });
  document.addEventListener('keydown', event => { if (event.key === 'Tab' || event.key === 'Escape') hide(); });
  finePointer.addEventListener('change', hide);
})();
