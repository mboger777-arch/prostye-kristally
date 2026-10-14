'use strict';
// ===== Пещера простых кристаллов — движок =====
const C=document.getElementById('c'),X=C.getContext('2d');
let W=0,H=0,S=1,OX=0,OY=0,DPR=1,T=0,DT=0.016,shake=0,PX=640,PY=360,fade=1;
function rs(){DPR=Math.min(2,window.devicePixelRatio||1);W=innerWidth;H=innerHeight;C.width=Math.round(W*DPR);C.height=Math.round(H*DPR);S=Math.min(W/1280,H/720);OX=(W-1280*S)/2;OY=(H-720*S)/2}
addEventListener('resize',rs);rs();
const IM={};function img(n,src){const i=new Image();i.src=src;IM[n]=i}
['title','l1','l2','l3','l4','l5'].forEach(n=>{img('bg_'+n,'assets/bg_'+n+'.jpg');img('fg_'+n,'assets/fg_'+n+'.png')});
['granit','iskorka','shester','troll'].forEach(n=>img(n,'assets/sprites/'+n+'.png'));
const FONT='FairyLogo, Georgia, serif',BODY='Pangolin, "Comic Sans MS", sans-serif';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rnd=(a,b)=>a+Math.random()*(b-a),ease=t=>t<0?0:t>1?1:1-Math.pow(1-t,3);
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
// ---- точная математика ----
function isP(n){if(n<2)return false;for(let d=2;d*d<=n;d++)if(n%d===0)return false;return true}
function fac(n){const f=[];for(let d=2;d*d<=n;d++)while(n%d===0){f.push(d);n/=d}if(n>1)f.push(n);return f}
function expl(n){if(LINES['n'+n])return LINES['n'+n].t;if(isP(n))return n+' — простое: делится только на 1 и на '+n+'.';const f=fac(n);return n+' = '+f[0]+' × '+(n/f[0])+(f.length>2?' = '+f.join(' × '):'')+' — составное.'}
// ---- сохранение ----
let SV;try{SV=JSON.parse(localStorage.getItem('prostye1'))}catch(e){}
if(!SV)SV={stars:[0,0,0,0,0],secret:[0,0,0,0],open:1};
function save(){try{localStorage.setItem('prostye1',JSON.stringify(SV))}catch(e){}}
// ---- звук (синтез WebAudio) ----
let AC=null;function ac(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();return AC}
function tone(f,d,type,v,when,slide){const a=ac();if(!a)return;const t=a.currentTime+(when||0),o=a.createOscillator(),g=a.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+d);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v||.1,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(a.destination);o.start(t);o.stop(t+d+.05)}
function noise(d,v,fq,when){const a=ac();if(!a)return;const b=a.createBuffer(1,Math.floor(a.sampleRate*d),a.sampleRate),ch=b.getChannelData(0);for(let i=0;i<ch.length;i++)ch[i]=(Math.random()*2-1)*(1-i/ch.length);const s=a.createBufferSource();s.buffer=b;const f=a.createBiquadFilter();f.type='bandpass';f.frequency.value=fq;const g=a.createGain();g.gain.value=v;s.connect(f).connect(g).connect(a.destination);s.start(a.currentTime+(when||0))}
const SFX={ok(){[1046,1318,1568,2093].forEach((f,i)=>tone(f,.5,'sine',.08,i*.07))},bad(){tone(240,.25,'triangle',.1,0,160);tone(190,.3,'triangle',.08,.12,130)},
 click(){tone(1300,.05,'square',.035)},hit(){noise(.3,.6,350);tone(95,.3,'square',.1,0,40)},shatter(){noise(.5,.35,3200);[2400,3100,2700,3600].forEach((f,i)=>tone(f,.3,'sine',.05,i*.04))},
 clang(){tone(1800,.45,'triangle',.09);tone(2650,.6,'sine',.05,.02)},splash(){noise(.35,.18,1100)},star(){[1568,2093,2637].forEach((f,i)=>tone(f,.6,'sine',.08,i*.13))},
 tick(){tone(2200,.03,'square',.03)},whoosh(){noise(.5,.2,600)}};
// ---- голос и реплики ----
const G={_busy:0,fast:false,mute:false};let talk=null,skipTalk=null;
function wait(ms){return new Promise(r=>setTimeout(r,G.fast?Math.min(ms,40):ms))}
async function say(k){const l=LINES[k];if(!l)return;talk={who:l.who,text:l.t,k,t0:T};
 if(G.fast){await wait(60);talk=null;return}
 const v=typeof VOICE!=='undefined'&&VOICE[k];const dur=Math.max(1800,l.t.length*70);
 await new Promise(async res=>{let done=false;const fin=()=>{if(!done){done=true;skipTalk=null;res()}};skipTalk=()=>{if(a)a.pause();fin()};let a=null;
  if(v&&!G.mute){a=new Audio('assets/voice/'+v[0]);attachAnalyser(a);a.onended=()=>setTimeout(fin,250);a.onerror=()=>setTimeout(fin,dur);let ok=true;try{await a.play()}catch(e){ok=false}
   if(ok)setTimeout(fin,(v[1]+2)*1000);else setTimeout(fin,dur)}else setTimeout(fin,dur)});
 talk=null}
async function run(fn){G._busy++;try{await fn()}catch(e){console.error(e)}finally{G._busy--}}
// ---- частицы ----
const PS=[];
function burst(x,y,n,kind,hue,sp){sp=sp||1;for(let i=0;i<n;i++){const a=Math.random()*6.283,v=rnd(80,420)*sp;PS.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(kind==='shard'?180:0),life:1,dec:rnd(.6,1.3),kind,hue:hue+rnd(-15,15),s:kind==='shard'?rnd(6,16):rnd(2,6),rot:rnd(0,6),vr:rnd(-10,10)})}}
function drops(x,y,n){for(let i=0;i<n;i++)PS.push({x:x+rnd(-14,14),y:y+rnd(-30,0),vx:rnd(-60,60),vy:rnd(-160,40),life:1,dec:rnd(1.2,2),kind:'drop',hue:195,s:rnd(2,4.5),rot:0,vr:0})}
function motes(hue){if(PS.length<260&&Math.random()<.35){const v=vis();PS.push({x:rnd(v.x0,v.x0+v.w),y:v.y0+v.h+5,vx:rnd(-8,8),vy:rnd(-30,-12),life:1,dec:rnd(.08,.16),kind:'mote',hue:hue+rnd(-20,20),s:rnd(1.5,3.5),rot:rnd(0,6),vr:0})}}
function stepParticles(){for(let i=PS.length-1;i>=0;i--){const p=PS[i];p.life-=p.dec*DT;if(p.life<=0){PS.splice(i,1);continue}
 if(p.kind==='shard'||p.kind==='drop')p.vy+=900*DT;else if(p.kind==='spark'){p.vx*=.96;p.vy*=.96}else if(p.kind==='mote')p.vx+=Math.sin(T+p.rot)*4*DT;p.x+=p.vx*DT;p.y+=p.vy*DT;p.rot+=p.vr*DT}}
function drawParticles(){for(const p of PS){X.globalAlpha=Math.min(1,p.life*1.5);
 if(p.kind==='shard'){X.save();X.translate(p.x,p.y);X.rotate(p.rot);X.fillStyle=`hsl(${p.hue},90%,70%)`;X.beginPath();X.moveTo(0,-p.s);X.lineTo(p.s*.6,p.s*.5);X.lineTo(-p.s*.5,p.s*.4);X.closePath();X.fill();X.fillStyle='rgba(255,255,255,.6)';X.beginPath();X.moveTo(0,-p.s);X.lineTo(p.s*.15,0);X.lineTo(-p.s*.5,p.s*.4);X.fill();X.restore()}
 else if(p.kind==='drop'){X.fillStyle='rgba(170,235,255,.85)';X.beginPath();X.ellipse(p.x,p.y,p.s*.7,p.s*1.3,Math.atan2(p.vy,p.vx)-1.57,0,7);X.fill()}
 else{X.globalCompositeOperation='lighter';const r=p.s*(p.kind==='mote'?3:4);const g=X.createRadialGradient(p.x,p.y,0,p.x,p.y,r);g.addColorStop(0,`hsla(${p.hue},100%,85%,.9)`);g.addColorStop(1,`hsla(${p.hue},100%,60%,0)`);X.fillStyle=g;X.fillRect(p.x-r,p.y-r,r*2,r*2);X.globalCompositeOperation='source-over'}}
 X.globalAlpha=1}
// ---- фон с параллаксом ----
function vis(){return{x0:-OX/S,y0:-OY/S,w:W/S,h:H/S}}
function bgDraw(n,dim,scroll){const v=vis(),k=Math.max(v.w/1280,v.h/720);const mx=(PX-640)/640,my=(PY-360)/360;scroll=scroll||0;
 const b=IM['bg_'+n],f=IM['fg_'+n];
 if(b&&b.complete){const s=k*1.06,ox=-mx*10+Math.sin(T*.21)*4,oy=-my*6+Math.cos(T*.17)*3;X.drawImage(b,640-640*s+ox,360-360*s+oy,1280*s,720*s)}
 if(f&&f.complete){const s=k*1.10,ox=-mx*30+Math.sin(T*.21)*9,oy=-my*12;X.drawImage(f,640-640*s+ox,360-360*s+oy+8,1280*s,720*s)}
 if(dim){X.fillStyle=`rgba(8,4,24,${dim})`;X.fillRect(v.x0,v.y0,v.w,v.h)}
 // виньетка
 const g=X.createRadialGradient(640,360,300,640,360,900);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(5,0,20,.55)');X.fillStyle=g;X.fillRect(v.x0,v.y0,v.w,v.h)}
// ---- рисование ----
function rr(x,y,w,h,r){X.beginPath();X.moveTo(x+r,y);X.arcTo(x+w,y,x+w,y+h,r);X.arcTo(x+w,y+h,x,y+h,r);X.arcTo(x,y+h,x,y,r);X.arcTo(x,y,x+w,y,r);X.closePath()}
function wrap(t,maxW){const ws=t.split(' '),out=[];let cur='';for(const w of ws){const s=cur?cur+' '+w:w;if(X.measureText(s).width>maxW&&cur){out.push(cur);cur=w}else cur=s}if(cur)out.push(cur);return out}
function txt(t,x,y,size,col,o){o=o||{};X.font=(o.b?'bold ':'')+size+'px '+(o.f||FONT);X.textAlign=o.al||'center';X.textBaseline='middle';
 if(o.st!==0){X.lineJoin='round';X.lineWidth=o.lw||Math.max(3,size*.16);X.strokeStyle=o.st||'rgba(30,10,50,.9)';X.strokeText(t,x,y)}X.fillStyle=col||'#fff';X.fillText(t,x,y)}
function panel(x,y,w,h,a){X.save();X.shadowColor='rgba(0,0,0,.5)';X.shadowBlur=24;rr(x,y,w,h,22);const g=X.createLinearGradient(0,y,0,y+h);g.addColorStop(0,`rgba(46,28,92,${a||.86})`);g.addColorStop(1,`rgba(20,12,48,${a||.86})`);X.fillStyle=g;X.fill();X.restore();rr(x,y,w,h,22);X.lineWidth=3;X.strokeStyle='rgba(255,215,120,.75)';X.stroke();rr(x+6,y+6,w-12,h-12,17);X.lineWidth=1;X.strokeStyle='rgba(255,240,200,.25)';X.stroke()}
// кристалл-самоцвет с гранями
function gem(x,y,r,hue,label,o){o=o||{};X.save();X.translate(x,y);if(o.rot)X.rotate(o.rot);const s=o.sc||1;X.scale(s*(o.sx||1),s*(o.sy||1));X.globalAlpha=o.alpha==null?1:o.alpha;
 const sat=o.grey?8:90;
 if(o.glow!==0){const gl=(o.glow||1)*(.8+.2*Math.sin(T*3+x));const g=X.createRadialGradient(0,0,r*.3,0,0,r*1.9);g.addColorStop(0,`hsla(${hue},100%,70%,${.5*gl})`);g.addColorStop(1,`hsla(${hue},100%,60%,0)`);X.fillStyle=g;X.beginPath();X.arc(0,0,r*1.9,0,7);X.fill()}
 const P=[[0,-r*1.15],[r*.8,-r*.45],[r*.8,r*.45],[0,r*1.15],[-r*.8,r*.45],[-r*.8,-r*.45]],cx=-r*.1,cy=-r*.15,Ls=[78,60,40,30,46,66];
 for(let i=0;i<6;i++){const a=P[i],b=P[(i+1)%6];X.beginPath();X.moveTo(a[0],a[1]);X.lineTo(b[0],b[1]);X.lineTo(cx,cy);X.closePath();X.fillStyle=`hsl(${hue},${sat}%,${Ls[i]}%)`;X.fill()}
 // столовая грань
 X.beginPath();for(let i=0;i<6;i++){const a=P[i];X.lineTo(cx+(a[0]-cx)*.42,cy+(a[1]-cy)*.42)}X.closePath();X.fillStyle=`hsla(${hue},${sat}%,86%,.55)`;X.fill();
 X.lineWidth=1.2;X.strokeStyle=`hsla(${hue},80%,95%,.55)`;for(let i=0;i<6;i++){X.beginPath();X.moveTo(P[i][0],P[i][1]);X.lineTo(cx,cy);X.stroke()}
 X.beginPath();P.forEach(p=>X.lineTo(p[0],p[1]));X.closePath();X.lineWidth=2.5;X.strokeStyle=`hsla(${hue},70%,92%,.95)`;X.stroke();
 X.fillStyle='rgba(255,255,255,.55)';X.beginPath();X.moveTo(-r*.55,-r*.5);X.lineTo(-r*.15,-r*.95);X.lineTo(-r*.05,-r*.8);X.lineTo(-r*.45,-r*.35);X.fill();
 if(!o.grey){const tw=Math.max(0,Math.sin(T*2.3+x*.7+y));if(tw>.6){const k=(tw-.6)*2.5*r*.5;X.strokeStyle='rgba(255,255,255,.95)';X.lineWidth=2;X.beginPath();X.moveTo(-r*.5-k,-r*.6);X.lineTo(-r*.5+k,-r*.6);X.moveTo(-r*.5,-r*.6-k);X.lineTo(-r*.5,-r*.6+k);X.stroke()}}
 if(o.crack){X.strokeStyle='rgba(255,255,255,.9)';X.lineWidth=2;X.beginPath();X.moveTo(r*.1,-r*1.1);X.lineTo(-r*.15,-r*.4);X.lineTo(r*.2,0);X.lineTo(-r*.1,r*.5);X.stroke()}
 if(label!=null&&label!==''){const fs=o.fs||r*(String(label).length>2?.62:.85);txt(String(label),0,r*.05,fs,'#fff',{st:`hsl(${hue},70%,${o.grey?25:18}%)`,lw:fs*.2})}
 X.restore()}
// ---- кнопки ----
let UI=[];
function btn(id,x,y,w,h,label,fn,o){o=o||{};UI.push({id,x,y,w,h,fn,always:o.always,dis:o.dis});const hov=Math.abs(PX-x)<w/2&&Math.abs(PY-y)<h/2;const pr=o.pulse?1+Math.sin(T*5)*.04:1;
 X.save();X.translate(x,y);X.scale(pr*(hov?1.04:1),pr*(hov?1.04:1));const hue=o.hue==null?42:o.hue;
 X.shadowColor='rgba(0,0,0,.45)';X.shadowBlur=14;X.shadowOffsetY=5;rr(-w/2,-h/2,w,h,h/2);const g=X.createLinearGradient(0,-h/2,0,h/2);g.addColorStop(0,`hsl(${hue},95%,${o.dis?45:68}%)`);g.addColorStop(1,`hsl(${hue},85%,${o.dis?30:42}%)`);X.fillStyle=g;X.fill();X.shadowColor='transparent';
 X.lineWidth=3;X.strokeStyle=`hsl(${hue},100%,88%)`;X.stroke();rr(-w/2+6,-h/2+4,w-12,h*.42,h/3);X.fillStyle='rgba(255,255,255,.25)';X.fill();
 txt(label,0,1,o.fs||Math.min(h*.5,34),'#fff',{st:`hsl(${hue},70%,20%)`});X.restore()}
// ---- герои: дыхание, речь со squash&stretch, прыжки ----
let cast=[];
const NAMES={granit:['Гранит','#ff9a52'],iskorka:['Искорка-Пи','#c79bff'],shester:['Шестерёнка','#ffd36b'],troll:['Тролль-Дробила','#9be07a'],narrator:['','#fff']};
function cheer(){cast.forEach((c,i)=>{if(c.n!=='troll')c.jump=T+i*.08})}
function oops(n){const c=cast.find(c=>c.n===n);if(c)c.wob=T}
function drawCast(){cast.forEach(drawHero)}
function drawTalk(){if(!talk)return;const c=cast.find(c=>c.n===talk.who);X.font='25px '+BODY;const maxW=c?430:880;const L=wrap(talk.text,maxW);const lh=31;const tw=Math.max(...L.map(l=>X.measureText(l).width));const bw=tw+40,bh=L.length*lh+(c?44:28);
 const age=T-talk.t0,pop=age<.18?.7+.3*ease(age/.18):1;let bx,by,tx=0,ty=0;
 if(c){tx=c.x+(c.flip?-1:1)*c.h*.05;ty=c.y-c.h*.9-(c.jump&&T-c.jump<.75?50:0);bx=clamp(tx-bw*.35,8,1272-bw);by=Math.max(8,ty-bh-30);if(by+bh>ty-12)ty=by+bh+12}else{bx=640-bw/2;by=12}
 X.save();X.translate(bx+bw/2,by+bh);X.scale(pop,pop);X.translate(-bx-bw/2,-by-bh);
 X.shadowColor='rgba(0,0,0,.35)';X.shadowBlur=16;X.shadowOffsetY=4;X.fillStyle=c?'#fffdf6':'rgba(255,250,235,.96)';rr(bx,by,bw,bh,20);X.fill();
 if(c){X.beginPath();const ax=clamp(tx,bx+30,bx+bw-30);X.moveTo(ax-16,by+bh-2);X.lineTo(ax+14,by+bh-2);X.lineTo(tx,ty);X.closePath();X.fill()}
 X.shadowColor='transparent';rr(bx,by,bw,bh,20);X.lineWidth=2.5;X.strokeStyle=c?NAMES[c.n][1]:'#d9b45a';X.stroke();
 let y0=by+20;if(c){txt(NAMES[c.n][0],bx+20,by+18,22,NAMES[c.n][1],{al:'left',st:'rgba(40,20,60,.85)',lw:4});y0=by+40}
 X.font='25px '+BODY;X.fillStyle='#2b1d3a';X.textAlign='left';X.textBaseline='middle';L.forEach((l,i)=>X.fillText(l,bx+20,y0+i*lh+lh/2-4));X.restore();
 talk.box=[bx,by,bw,bh]}
// ---- сцены ----
const SC={};let scene='title',SCN=null;
function go(n,arg){scene=n;SCN=SC[n];fade=1;talk=null;if(skipTalk)skipTalk();SCN.enter&&SCN.enter(arg)}
C.addEventListener('pointerdown',e=>{ac();const x=(e.clientX-OX)/S,y=(e.clientY-OY)/S;PX=x;PY=y;
 for(let i=UI.length-1;i>=0;i--){const b=UI[i];if(Math.abs(x-b.x)<b.w/2+6&&Math.abs(y-b.y)<b.h/2+6){if(b.dis||(G._busy&&!b.always))return;SFX.click();b.fn();return}}
 if(talk&&talk.box&&skipTalk){const[bx,by,bw,bh]=talk.box;if(x>bx&&x<bx+bw&&y>by&&y<by+bh){skipTalk();return}}
 if(SCN&&SCN.tap)SCN.tap(x,y)});
C.addEventListener('pointermove',e=>{PX=(e.clientX-OX)/S;PY=(e.clientY-OY)/S});
let last=performance.now(),fpsA=60;
function loop(now){DT=clamp((now-last)/1000,0,.05);last=now;T+=DT;fpsA=fpsA*.95+(1/Math.max(DT,.001))*.05;
 X.setTransform(DPR,0,0,DPR,0,0);X.fillStyle='#0b0718';X.fillRect(0,0,W,H);
 const sx=(Math.random()-.5)*shake,sy=(Math.random()-.5)*shake;shake*=Math.pow(.004,DT);if(shake<.3)shake=0;
 X.setTransform(DPR*S,0,0,DPR*S,DPR*(OX+sx),DPR*(OY+sy));UI=[];stepParticles();
 try{SCN&&SCN.draw()}catch(e){console.error(e)}
 drawParticles();drawTalk();if(SCN&&SCN.ui)SCN.ui();
 if(fade>0){const v=vis();X.fillStyle=`rgba(8,4,20,${fade})`;X.fillRect(v.x0,v.y0,v.w,v.h);fade=Math.max(0,fade-DT*2.5)}
 requestAnimationFrame(loop)}
// тестовый интерфейс
Object.defineProperty(G,'busy',{get:()=>G._busy>0});Object.defineProperty(G,'scene',{get:()=>scene});
G.go=n=>go(n);G.S=SV;G.pg=(x,y)=>({x:OX+x*S,y:OY+y*S});G.btns=()=>UI.map(b=>({id:b.id,x:b.x,y:b.y}));G.fps=()=>fpsA;
G.math={isP,fac};
