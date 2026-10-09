(() => {
  const dock = document.querySelector('.software-dock');
  if (!dock) return;
  const buttons = [...dock.querySelectorAll('button')];
  const name = document.getElementById('dock-name');
  const description = document.getElementById('dock-description');
  let selected = null;
  function show(button) {
    name.textContent = button ? button.dataset.name : 'A tool for every idea.';
    description.textContent = button ? button.dataset.description : 'Hover or tap a logo to explore.';
  }
  buttons.forEach(button => {
    button.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') show(button); });
    button.addEventListener('focus', () => show(button));
    button.addEventListener('click', () => {
      selected = selected === button ? null : button;
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === selected)));
      show(selected);
    });
  });
  dock.addEventListener('pointerleave', () => show(selected));
  dock.addEventListener('focusout', event => { if (!dock.contains(event.relatedTarget)) show(selected); });
})();
