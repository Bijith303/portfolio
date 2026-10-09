(() => {
 const strip=document.querySelector('.client-marquee');
 const toggle=document.querySelector('.client-marquee-toggle');
 if(!strip||!toggle)return;
 toggle.addEventListener('click',()=>{
  const paused=strip.classList.toggle('is-paused');
  toggle.setAttribute('aria-pressed',String(paused));
  toggle.textContent=paused?'Resume logos':'Pause logos';
 });
})();
