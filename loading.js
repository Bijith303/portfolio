(() => {
 const loader=document.getElementById('portfolio-loader');if(!loader)return;
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const content=document.querySelector('.site-shell');
 let done=false;const start=performance.now();
 loader.hidden=false;content.inert=true;
 function dismiss(){if(done)return;done=true;content.inert=false;const focused=loader.contains(document.activeElement);loader.classList.add('is-leaving');if(focused){const brand=content.querySelector('header a');if(brand)brand.focus({preventScroll:true});}setTimeout(()=>{loader.hidden=true;},380);}
 loader.querySelector('button').addEventListener('click',dismiss);
 const escape=event=>{if(event.key==='Escape'){dismiss();document.removeEventListener('keydown',escape);}};
 document.addEventListener('keydown',escape);
 function ready(){setTimeout(dismiss,Math.max(0,1000-(performance.now()-start)));}
 if(document.readyState==='complete')ready();else window.addEventListener('load',ready,{once:true});
 setTimeout(dismiss,2500);
})();
