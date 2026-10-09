(() => {
 const canvas=document.getElementById('dimension-canvas');if(!canvas)return;
 const ctx=canvas.getContext('2d');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const blocks=[];let index=0;
 for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(let c=-1;c<=1;c++){
  const yy=1-2*(index+.5)/27,rr=Math.sqrt(1-yy*yy),theta=index*2.399963;
  blocks.push({home:[a*.82,b*.82,c*.82],orbit:[Math.cos(theta)*rr*1.8,yy*1.8,Math.sin(theta)*rr*1.8],phase:index++});
 }
 const corners=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
 const faces=[[0,1,2,3],[4,7,6,5],[0,4,5,1],[3,2,6,7],[0,3,7,4],[1,5,6,2]];
 let width=0,height=0,rx=-.35,ry=.65,visible=false,frame=0,lastTime=0;
 let morph=0,spread=.12,clock=0;
 function rotate([x,y,z]){let xx=x*Math.cos(ry)+z*Math.sin(ry),zz=-x*Math.sin(ry)+z*Math.cos(ry);return[xx,y*Math.cos(rx)-zz*Math.sin(rx),y*Math.sin(rx)+zz*Math.cos(rx)];}
 function project([x,y,z]){const scale=Math.min(width,height)*1.07/(9-z);return[width/2+x*scale,height*.47+y*scale];}
 function render(){
  ctx.clearRect(0,0,width,height);
  // Ground shadow anchors the changing sculpture.
  ctx.save();ctx.translate(width/2,height*.86);ctx.scale(1,.16);
  const shadow=ctx.createRadialGradient(0,0,0,0,0,Math.min(width,height)*.33);
  shadow.addColorStop(0,'rgba(38,38,209,.14)');shadow.addColorStop(1,'rgba(38,38,209,0)');ctx.fillStyle=shadow;ctx.beginPath();ctx.arc(0,0,Math.min(width,height)*.33,0,Math.PI*2);ctx.fill();ctx.restore();
  const polygons=[];
  blocks.forEach(block=>{
   const centre=block.home.map((v,k)=>(v*(1-morph)+block.orbit[k]*morph)*(1+spread*1.1));
   const size=.36*(1-morph*.4);
   const twist=morph*(block.phase*.31+clock*.25)+spread*.4;
   const vertices=corners.map(([x,y,z])=>rotate([centre[0]+(x*Math.cos(twist)+z*Math.sin(twist))*size,centre[1]+y*size,centre[2]+(-x*Math.sin(twist)+z*Math.cos(twist))*size]));
   faces.forEach((face,fi)=>{
    const points=face.map(i=>vertices[i]);
    const u=points[1].map((v,k)=>v-points[0][k]),v=points[2].map((q,k)=>q-points[0][k]);
    const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],length=Math.hypot(...n);
    const light=Math.abs((n[0]*-.35+n[1]*-.6+n[2]*.72)/length);
    polygons.push({points,z:points.reduce((s,p)=>s+p[2],0)/4,light,accent:block.phase%7===0});
   });
  });
  polygons.sort((a,b)=>a.z-b.z).forEach(({points,light,accent})=>{
   ctx.beginPath();points.forEach((point,i)=>{const [x,y]=project(point);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.closePath();
   if(accent)ctx.fillStyle=`rgb(${Math.round(146+light*86)},${Math.round(150+light*85)},${Math.round(208+light*44)})`;
   else ctx.fillStyle=`rgb(${Math.round(20+light*36)},${Math.round(20+light*36)},${Math.round(120+light*108)})`;
   ctx.fill();ctx.strokeStyle=accent?'rgba(255,255,255,.7)':'rgba(178,178,255,.4)';ctx.lineWidth=.7;ctx.stroke();
  });
 }
 function tick(time){
  frame=0;if(!visible||document.hidden)return;
  const dt=Math.min((time-lastTime)||16,40);lastTime=time;
  if(!reduced.matches){
   clock+=dt*.001;
   // A gentle 18-second cycle: assembled cube, floating sphere, then back.
   const wave=(1-Math.cos(clock*Math.PI/9))/2;
   morph=wave*wave*(3-2*wave);
   spread=.10+.24*morph;
   ry=.65+clock*.13;
   rx=-.35+Math.sin(clock*.3)*.12;
  }
  render();if(!reduced.matches)start();
 }
 function start(){if(!frame&&visible)frame=requestAnimationFrame(tick);}
 function resize(){const bounds=canvas.getBoundingClientRect();width=bounds.width;height=bounds.height;const ratio=Math.min(devicePixelRatio||1,2);canvas.width=width*ratio;canvas.height=height*ratio;ctx.setTransform(ratio,0,0,ratio,0,0);render();}
 new ResizeObserver(resize).observe(canvas);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){lastTime=0;start();}else{cancelAnimationFrame(frame);frame=0;}}).observe(canvas);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){lastTime=0;start();}});reduced.addEventListener('change',start);
})();
