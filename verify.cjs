const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements=new Map();
function element(){return {value:1,style:{},classList:{toggle(){}},querySelector(){return element();},append(){},addEventListener(){}};}
const ctx={document:{getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id);},createElement:element,querySelectorAll:()=>[]},p5:function(){},console};vm.createContext(ctx);vm.runInContext(fs.readFileSync('sketch.js','utf8'),ctx);
vm.runInContext(`
for(const type of ['single','series','parallel','mixed']){state.type=type;state.k1=200;state.k2=200;state.k3=200;const expected={single:200,series:100,parallel:400,mixed:400/3}[type];if(effectiveK()!==expected)throw Error('k ekuivalen');}
// Mixed topology: compliance, component force, and elastic energy identities.
for(const values of [[100,100,100],[20,500,20],[500,20,500]])for(const x of [-.8,0,.8]){
 const [k1,k2,k3]=values;Object.assign(state,{type:'mixed',k1,k2,k3,m:1,x});
 const k=effectiveK(),dl=lengthChange(),parallel=k*dl/(k1+k2),series=k*dl/k3;
 if(Math.abs(1/k-(1/(k1+k2)+1/k3))>1e-12)throw Error('Compliance campuran');
 if(Math.abs(parallel+series-dl)>1e-10)throw Error('Panjang campuran');
 if(Math.abs((k1+k2)*parallel-k3*series)>1e-9)throw Error('Gaya sambungan');
 const E=.5*(k1+k2)*parallel**2+.5*k3*series**2;
 if(Math.abs(E-elasticEnergy(x,k))>1e-8)throw Error('Energi campuran');
}
state.type='mixed';updateControls();if($('wrap-k3').hidden)throw Error('Kontrol k3 hilang');
state.type='single';updateControls();if(!$('wrap-k3').hidden)throw Error('Kontrol k3 salah mode');
// A single step must use the old velocity (distinguishes explicit Euler from Cromer).
state.type='single';state.k1=100;state.m=1;state.b=0;state.a=.4;restart();let h=eulerStepLimit();advance(h);if(Math.abs(state.x-.4)>1e-14||Math.abs(state.v+40*h)>1e-14)throw Error('Bukan Euler eksplisit');
// Compare with independent analytical undamped motion across parameter extremes.
for(const type of ['single','series','parallel','mixed'])for(const m of [.2,1,5])for(const stiffness of [20,500]){
 state.type=type;state.k1=stiffness;state.k2=stiffness;state.k3=stiffness;state.m=m;state.b=0;state.a=.4;restart();
 const k=effectiveK(),w=Math.sqrt(k/m),E0=.5*k*.4**2;
 for(let i=0;i<100;i++)advance(.02);
 const error=Math.hypot((state.x-.4*Math.cos(w*2))/.4,(state.v+.4*w*Math.sin(w*2))/(.4*w));
 const ratio=(.5*k*state.x**2+.5*m*state.v**2)/E0;
 if(error>.0021||ratio<1||ratio>Math.exp(.002*2)+1e-8)throw Error('Galat Euler terlalu besar');
}
// Halving an already-small step should halve first-order global error.
state.type='single';state.k1=100;state.m=1;state.b=0;state.a=.4;
function errorAtStep(h){restart();const count=Math.round(.1/h);for(let i=0;i<count;i++)advance(h);return Math.hypot(state.x-.4*Math.cos(1),(state.v+4*Math.sin(1))/10);}
const coarse=errorAtStep(.00002),fine=errorAtStep(.00001);if(fine/coarse<.48||fine/coarse>.52)throw Error('Konvergensi orde satu gagal');
// Total interval and result are independent of animation frame partition within tolerance.
restart();advance(.1);const directX=state.x,directV=state.v;restart();for(let i=0;i<10;i++)advance(.01);if(Math.abs(state.t-.1)>1e-12||Math.abs(state.x-directX)>1e-7||Math.abs(state.v-directV)>1e-6)throw Error('Substep waktu gagal');
for(const b of [1,Math.sqrt(8),5]){state.type='series';state.k1=20;state.k2=20;state.m=.2;state.b=b;restart();let last=Infinity;for(let i=0;i<1000;i++){advance(.01);let energy=.5*effectiveK()*state.x**2+.5*state.m*state.v**2;if(!Number.isFinite(energy)||energy>last+1e-5)throw Error('Redaman');last=energy;}}
for(const type of ['single','series','parallel','mixed']){state.type=type;state.k1=100;state.k2=200;state.m=1;state.x=.4;state.a=.4;state.v=2;state.t=3;state.running=true;state.drag=true;resetEquilibrium();if(state.x!==0||state.v!==0||state.a!==0||state.t!==0||state.running||state.drag||state.history.length!==1||state.history[0].x!==0)throw Error('Reset setimbang');if(Math.abs(lengthChange()-9.81/effectiveK())>1e-10)throw Error('Regangan setimbang');advance(.1);if(state.x!==0||state.v!==0)throw Error('Setimbang tidak tetap');state.x=-.5;if(Math.abs(lengthChange()-(-.5+9.81/effectiveK()))>1e-10)throw Error('Perubahan panjang');}
`,ctx);console.log('LULUS: konstanta ekuivalen; Euler eksplisit; akurasi terhadap solusi analitik; konvergensi orde satu; galat energi; redaman; reset.');

vm.runInContext(`
Object.assign(state,{type:'single',k1:100,m:1,a:.4,mode:'oscillation'});
for(const [b,kind] of [[0,'Tanpa redaman'],[2,'Redaman kurang'],[20,'Redaman kritis'],[30,'Redaman lebih']]){
 state.b=b;if(timeEquation().kind!==kind)throw Error('Jenis solusi redaman salah');
 updateGraphEquations();if(!$('eq-time-info').textContent.includes(kind))throw Error('Keterangan persamaan tidak diperbarui');
}
state.mode='static';updateGraphEquations();if(!$('eq-time').innerHTML.includes('konstan'))throw Error('Persamaan statik salah');
state.type='mixed';state.k1=100;state.k2=100;state.k3=200;updateGraphEquations();
if(!$('eq-force').textContent.includes(fmt(100,2)))throw Error('Koefisien gaya campuran salah');
if(!$('eq-energy').innerHTML.includes(fmt(50,2)))throw Error('Koefisien energi campuran salah');
`,ctx);
console.log('LULUS: informasi grafik, seluruh jenis redaman, statik, dan koefisien campuran.');
