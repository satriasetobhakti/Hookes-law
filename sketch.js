/* Lab Pegas — p5.js. Satuan model: meter, kilogram, sekon, newton. */
const $ = id => document.getElementById(id);
const state = {type:'single',mode:'oscillation',k1:100,k2:100,k3:100,m:1,a:0.4,b:0,x:0.4,v:0,t:0,running:false,drag:false,history:[]};
const specs=[['k1','Konstanta pegas 1',20,500,10,100,'N/m'],['k2','Konstanta pegas 2',20,500,10,100,'N/m'],['k3','Konstanta pegas 3',20,500,10,100,'N/m'],['m','Massa beban',0.2,5,0.1,1,'kg'],['a','Simpangan awal',-0.8,0.8,0.01,0.4,'m'],['b','Koefisien redaman',0,5,0.1,0,'N·s/m']];
const fmt=(x,n=2)=>Number(x).toLocaleString('id-ID',{minimumFractionDigits:n,maximumFractionDigits:n});
function effectiveK(s=state){return s.type==='mixed'?(s.k1+s.k2)*s.k3/(s.k1+s.k2+s.k3):s.type==='series'?s.k1*s.k2/(s.k1+s.k2):s.type==='parallel'?s.k1+s.k2:s.k1;}
function lengthChange(s=state){return s.x+s.m*9.81/effectiveK(s);}
function resetEquilibrium(){running(false);state.drag=false;state.a=0;$('a').value=0;restart();updateControls();}
function elasticEnergy(x,k=effectiveK(),m=state.m){return .5*k*(x+m*9.81/k)**2;}
function restart(){state.x=state.a;state.v=0;state.t=0;state.history=[{t:0,x:state.x}];}
function running(v){state.running=v;$('play').textContent=v?'Ⅱ Jeda':'▶ Mulai';$('status').textContent=state.mode==='static'?'● Statis':v?'● Berjalan':'● Dijeda';}
for(const [id,label,min,max,step,val,unit] of specs){const div=document.createElement('div');div.className='control';div.id='wrap-'+id;div.innerHTML=`<label for="${id}"><span>${label}</span><output id="out-${id}"></output></label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"><div class="ends"><span>${min}</span><span>${max} ${unit}</span></div>`;$('controls').append(div);$(id).addEventListener('input',()=>{state[id]=+$(id).value;restart();updateControls();});}
function updateControls(){for(const [id,,,,,,unit] of specs)$('out-'+id).textContent=fmt(state[id],id.startsWith('k')?0:2)+' '+unit;$('wrap-k2').hidden=state.type==='single';$('wrap-k3').hidden=state.type!=='mixed';$('wrap-b').hidden=state.mode==='static';$('wrap-m').hidden=state.mode==='static';$('wrap-a').querySelector('label span').textContent=state.mode==='static'?'Simpangan yang ditahan':'Simpangan awal';$('keq').textContent=fmt(effectiveK(),1)+' N/m';$('equation').textContent={single:'kₑ = k₁',series:'1/kₑ = 1/k₁ + 1/k₂',parallel:'kₑ = k₁ + k₂',mixed:'kₑ = (k₁ + k₂)k₃ / (k₁ + k₂ + k₃)'}[state.type];$('play').disabled=state.mode==='static';}
document.querySelectorAll('[data-type]').forEach(el=>el.onclick=()=>{state.type=el.dataset.type;document.querySelectorAll('[data-type]').forEach(b=>b.classList.toggle('active',b===el));restart();updateControls();});
$('mode').onchange=()=>{state.mode=$('mode').value;running(false);restart();updateControls();};$('play').onclick=()=>running(!state.running);$('reset').onclick=()=>{running(false);restart();};
$('equilibrium').onclick=resetEquilibrium;
// Explicit Euler: both updates use the OLD x and v, never a new velocity.
// Substeps limit undamped numerical energy growth to about 0.2%/simulated s.
// Euler is not energy-conserving: a smaller step reduces, but cannot remove, drift.
function eulerStepLimit(){return Math.min(0.001,0.002*state.m/effectiveK(),0.01*state.m/Math.max(state.b,1e-12));}
function advance(dt){
 if(!Number.isFinite(dt)||dt<=0)return;
 const omega2=effectiveK()/state.m,damping=state.b/state.m;
 const count=Math.ceil(dt/eulerStepLimit()),h=dt/count;
 for(let i=0;i<count;i++){
  const oldX=state.x,oldV=state.v;
  state.x=oldX+h*oldV;
  state.v=oldV+h*(-omega2*oldX-damping*oldV);
 }
 state.t+=dt;
}
updateControls();restart();
const palette={ink:'#254b44',muted:'#82958b',spring:'#138b7b',second:'#c79a3d',force:'#7358c8',applied:'#db8738'};
new p5(p=>{
 let eq=240,scale=110,massY=0,cx=0;
 p.setup=()=>{const c=p.createCanvas($('simulation').clientWidth,420);c.parent('simulation');c.elt.setAttribute('aria-label','Pegas vertikal; seret massa naik atau turun untuk mengatur simpangan.');p.textFont('Segoe UI');};
 p.windowResized=()=>p.resizeCanvas($('simulation').clientWidth,420);
 function spring(y1,y2,x,color){const lead=Math.min(10,(y2-y1)/5);p.noFill();p.stroke(color);p.strokeWeight(2.8);p.beginShape();p.vertex(x,y1);p.vertex(x,y1+lead);for(let i=0;i<=240;i++){let u=i/240;p.vertex(x+16*Math.sin(u*Math.PI*20),y1+lead+(y2-y1-2*lead)*u);}p.vertex(x,y2);p.endShape();}
 function arrow(x,y1,y2,col){if(Math.abs(y2-y1)<1)return;p.stroke(col);p.strokeWeight(2);p.line(x,y1,x,y2);let d=Math.sign(y2-y1);p.line(x,y2,x-5,y2-d*7);p.line(x,y2,x+5,y2-d*7);}
 p.draw=()=>{
 if(state.running&&!state.drag&&state.mode==='oscillation'){advance(Math.min(p.deltaTime/1000,0.05)*+$('speed').value);state.history.push({t:state.t,x:state.x});while(state.history.length>2&&state.history[0].t<state.t-8)state.history.shift();}
 p.background('#fcfdfb');cx=p.width*.5;massY=eq+state.x*scale;const anchor=68,attach=massY-25;
 p.stroke('#eaf0ea');p.strokeWeight(1);for(let x=20;x<p.width;x+=25)for(let y=25;y<410;y+=25)p.point(x,y);
 p.noStroke();p.fill(palette.muted);p.textSize(10);p.textAlign(p.LEFT);p.text(state.mode==='static'?'TARIK STATIS · massa ditahan':'OSILASI BEBAS · seret massa naik atau turun',18,25);
 if($('showEq').checked){p.stroke('#9eafa4');p.drawingContext.setLineDash([4,5]);p.line(cx-95,eq,cx+95,eq);p.drawingContext.setLineDash([]);p.noStroke();p.fill(palette.muted);p.textAlign(p.LEFT);p.text('x = 0',cx+65,eq-9);}
 p.fill('#d6e0d8');p.noStroke();p.rect(cx-65,54,130,14,4);p.stroke('#afc2b5');for(let x=cx-60;x<cx+60;x+=12)p.line(x,55,x+9,67);
 if(state.type==='mixed'){
  // Schematic lengths are bounded so even very stiff branches remain visible.
  const fraction=Math.max(.22,Math.min(.78,state.k3/(state.k1+state.k2+state.k3)));
  const join=anchor+(attach-anchor)*fraction;
  spring(anchor,join,cx-32,palette.spring);spring(anchor,join,cx+32,palette.second);
  p.stroke(palette.ink);p.strokeWeight(2);p.line(cx-32,join,cx+32,join);
  spring(join,attach,cx,palette.force);
  p.noStroke();p.textSize(11);p.textAlign(p.CENTER);
  p.fill(palette.spring);p.text('k₁',cx-57,(anchor+join)/2);
  p.fill(palette.second);p.text('k₂',cx+57,(anchor+join)/2);
  p.fill(palette.force);p.text('k₃',cx+30,(join+attach)/2);
  p.fill(palette.muted);p.textSize(10);p.text('k₁ ∥ k₂, lalu seri dengan k₃',cx,43);
 }
 else if(state.type==='parallel'){
spring(anchor,attach-10,cx-32,palette.spring);spring(anchor,attach-10,cx+32,palette.second);p.stroke(palette.ink);p.line(cx-32,attach-10,cx+32,attach-10);p.line(cx,attach-10,cx,attach);}
 else if(state.type==='series'){const join=anchor+(attach-anchor)*state.k2/(state.k1+state.k2);spring(anchor,join,cx,palette.spring);spring(join,attach,cx,palette.second);p.fill(palette.ink);p.noStroke();p.circle(cx,join,7);}
 else spring(anchor,attach,cx,palette.spring);
 p.noStroke();p.fill('#087b6f');p.rect(cx-25,massY-25,50,50,9);p.fill('#ffffff');p.textAlign(p.CENTER);p.textSize(11);p.text(fmt(state.m,1),cx,massY-2);p.text('kg',cx,massY+13);
 const f=-effectiveK()*state.x;
 if($('showForce').checked){let len=Math.sign(f)*Math.min(70,Math.abs(f)*.65);arrow(cx-70,massY,massY+len,palette.force);p.noStroke();p.fill(palette.force);p.textAlign(p.LEFT);p.text('F pemulih = '+fmt(f,1)+' N',18,365);if(state.mode==='static'){arrow(cx+70,massY,massY-len,palette.applied);p.noStroke();p.fill(palette.applied);p.text('F luar = '+fmt(-f,1)+' N',18,383);}}
 if($('showX').checked){
  // Plain displacement line; the dashed guide follows the mass center.
  p.stroke(palette.spring);p.strokeWeight(2);
  p.line(cx+100,eq,cx+100,massY);
  p.strokeWeight(1.5);p.drawingContext.setLineDash([5,5]);
  p.line(cx-95,massY,cx-27,massY);
  p.line(cx+27,massY,cx+105,massY);
  p.drawingContext.setLineDash([]);
  p.noStroke();p.fill(palette.spring);p.textAlign(p.RIGHT);
  p.text('x = '+fmt(state.x,3)+' m',p.width-18,365);
 }
 p.noStroke();p.fill(palette.muted);p.textAlign(p.CENTER);p.textSize(10);p.text('↑ x negatif    ·    x positif ↓',p.width/2,407);
 const k=effectiveK(),ep=.5*k*state.x**2,ek=.5*state.m*state.v**2,total=ep+ek,max=Math.max(.5*k*state.a**2,total,1e-9);
 const dl=lengthChange();
 $('numerical-step').textContent='Euler eksplisit · Δt ≤ '+eulerStepLimit().toExponential(2).replace('.',',')+' s';
 $('length-change').textContent=fmt(dl,3)+' m';
 $('length-equilibrium').textContent=fmt(state.m*9.81/k,3)+' m';
 $('length-detail').textContent=state.type==='mixed'?'Campuran: Δℓ₁ = Δℓ₂ = '+fmt(k*dl/(state.k1+state.k2),3)+' m; Δℓ₃ = '+fmt(k*dl/state.k3,3)+' m. Δℓ total = Δℓ₁ + Δℓ₃. Gambar bersifat skematis.':state.type==='series'?'Seri: Δℓ₁ = '+fmt(k*dl/state.k1,3)+' m; Δℓ₂ = '+fmt(k*dl/state.k2,3)+' m. Δℓ total = Δℓ₁ + Δℓ₂.':state.type==='parallel'?'Paralel: Δℓ₁ = Δℓ₂ = '+fmt(dl,3)+' m.':'Δℓ positif: memanjang; Δℓ negatif: memendek.';
 $('rx').textContent=fmt(state.x,3)+' m';$('rf').textContent=fmt(f,2)+' N';$('rv').textContent=fmt(state.v,2)+' m/s';$('rt').textContent=fmt(2*Math.PI*Math.sqrt(state.m/k))+' s';$('clock').textContent='t = '+fmt(state.t)+' s';$('ep').textContent=fmt(ep)+' J';$('ek').textContent=fmt(ek)+' J';$('et').textContent=fmt(total)+' J';$('epbar').value=ep/max;$('ekbar').value=ek/max;
 };
 function drag(){state.x=Math.max(-.8,Math.min(.8,(p.mouseY-eq)/scale));state.a=Math.round(state.x*100)/100;state.v=0;state.t=0;state.history=[{t:0,x:state.x}];$('a').value=state.a;updateControls();}
 p.mousePressed=()=>{if(Math.abs(p.mouseX-cx)<35&&Math.abs(p.mouseY-massY)<35){state.drag=true;running(false);drag();return false;}};
 p.mouseDragged=()=>{if(state.drag){drag();return false;}};
 p.mouseReleased=()=>{if(state.drag){state.drag=false;state.a=state.x;updateControls();if(state.mode==='oscillation')running(true);}};
});
new p5(p=>{
 p.setup=()=>{p.createCanvas($('graphCanvas').clientWidth,330).parent('graphCanvas');p.textFont('Segoe UI');};p.windowResized=()=>p.resizeCanvas($('graphCanvas').clientWidth,330);
 p.draw=()=>{p.background('#ffffff');const mode=$('graph').value,k=effectiveK(),l=62,r=p.width-25,top=35,bot=280;let xmin=-.8,xmax=.8,ymin,ymax,label;if(mode==='time'){xmin=Math.max(0,state.t-8);xmax=xmin+8;ymin=-.8;ymax=.8;label='x (m)';}else if(mode==='force'){ymin=-k*.8;ymax=k*.8;label='F pemulih (N)';}else{ymin=0;ymax=mode==='elastic'?Math.max(elasticEnergy(-.8,k),elasticEnergy(.8,k)):.5*k*.8**2;label=mode==='elastic'?'E pegas (J)':'E efektif (J)';}$('graph-note').textContent=mode==='elastic'?'E pegas = ½kₑ(Δℓ)², dengan Δℓ = x + mg/kₑ. Sumbu x: simpangan dari setimbang (positif ke bawah). Energi saat ini: '+fmt(elasticEnergy(state.x,k))+' J.':mode==='energy'?'E efektif = ½kₑx²: energi elastis + gravitasi relatif terhadap setimbang.':mode==='force'?'F pemulih = −kₑx: jumlah gaya pegas dan berat, tanpa redaman.':'Simpangan dari setimbang terhadap waktu simulasi; ditampilkan hingga 8 detik terakhir.';const X=x=>p.map(x,xmin,xmax,l,r),Y=y=>p.map(y,ymin,ymax,bot,top);
 p.textSize(10);p.textAlign(p.RIGHT,p.CENTER);for(let i=0;i<=4;i++){let y=ymin+(ymax-ymin)*i/4;p.stroke('#edf1ed');p.line(l,Y(y),r,Y(y));p.noStroke();p.fill(palette.muted);p.text(fmt(y,mode==='time'?1:0),l-10,Y(y));}for(let i=0;i<=4;i++){let x=xmin+(xmax-xmin)*i/4;p.stroke('#edf1ed');p.line(X(x),top,X(x),bot);p.noStroke();p.fill(palette.muted);p.textAlign(p.CENTER,p.TOP);p.text(fmt(x,1),X(x),bot+8);}p.stroke('#b8c8be');p.line(l,Y(0),r,Y(0));p.noStroke();p.fill(palette.ink);p.textAlign(p.LEFT);p.text(label,l,12);p.textAlign(p.RIGHT);p.text(mode==='time'?'t (s)':'x (m)',r,315);
 p.noFill();p.stroke(mode==='force'?palette.force:palette.spring);p.strokeWeight(2.3);p.beginShape();if(mode==='time'){for(const v of state.history)if(v.t>=xmin)p.vertex(X(v.t),Y(v.x));}else{for(let i=0;i<=160;i++){let x=-.8+i*.01;p.vertex(X(x),Y(mode==='force'?-k*x:mode==='elastic'?elasticEnergy(x,k):.5*k*x*x));}}p.endShape();p.noStroke();p.fill(palette.applied);p.circle(X(mode==='time'?state.t:state.x),Y(mode==='time'?state.x:mode==='force'?-k*state.x:mode==='elastic'?elasticEnergy(state.x,k):.5*k*state.x**2),8);
 };
});


