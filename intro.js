(() => {
  const intro = document.querySelector('.intro');
  const main = document.querySelector('main');
  const skip = document.querySelector('.intro-skip');
  const replay = document.querySelector('.replay-intro');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0, active = false, previousFocus, start = 0;
  const close = () => {
    if (!active) return;
    active = false;
    cancelAnimationFrame(frame);
    intro.classList.add('intro-done');
    main.inert = false;
    document.body.classList.remove('intro-active');
    if (previousFocus && previousFocus !== document.body) previousFocus.focus({preventScroll:true});
    else document.querySelector('.brand').focus({preventScroll:true});
    setTimeout(() => { if (!active) intro.hidden = true; }, reduce.matches ? 0 : 650);
  };
  function tick(now) {
    if (!active) return;
    const progress = Math.min((now - start) / 2600, 1);
    intro.style.setProperty('--progress', progress);
    document.querySelector('.intro-count').textContent = String(Math.round(progress * 100)).padStart(3,'0');
    if (progress === 1) close(); else frame = requestAnimationFrame(tick);
  }
  function open() {
    if (active) return;
    previousFocus = document.activeElement;
    intro.hidden = false;
    intro.classList.remove('intro-done');
    intro.style.setProperty('--rx','-8deg');
    intro.style.setProperty('--ry','-15deg');
    intro.style.setProperty('--progress','0');
    active = true;
    main.inert = true;
    document.body.classList.add('intro-active');
    skip.focus({preventScroll:true});
    start = performance.now();
    if (reduce.matches) close(); else frame = requestAnimationFrame(tick);
  }
  intro.addEventListener('pointermove', e => {
    if (!active || reduce.matches) return;
    intro.style.setProperty('--rx', `${(0.5-e.clientY/innerHeight)*35}deg`);
    intro.style.setProperty('--ry', `${(e.clientX/innerWidth-0.5)*50}deg`);
  });
  intro.addEventListener('pointerleave', () => {
    intro.style.setProperty('--rx','-8deg');intro.style.setProperty('--ry','-15deg');
  });
  skip.addEventListener('click', close);
  document.addEventListener('keydown', e => {
    if (!active) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') { e.preventDefault(); skip.focus(); }
  });
  document.addEventListener('visibilitychange', () => {if (document.hidden) close();});
  reduce.addEventListener('change', () => {if(reduce.matches) close();});
  replay.addEventListener('click', open);
  // Every visit gets a brief, skippable creative intro; content never waits on assets.
  if (!reduce.matches) open();
})();
