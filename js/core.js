'use strict';
// ===== Пещера простых кристаллов — движок =====
const C=document.getElementById('c'),X=C.getContext('2d');
let W=0,H=0,S=1,OX=0,OY=0,DPR=1,T=0,DT=0.016,shake=0,PX=640,PY=360,fade=1;
function rs(){DPR=Math.min(2,window.devicePixelRatio||1);W=innerWidth;H=innerHeight;C.width=Math.round(W*DPR);C.height=Math.round(H*DPR);S=Math.min(W/1280,H/720);OX=(W-1280*S)/2;OY=(H-720*S)/2}
function vpWH(){const v=window.visualViewport;let w=innerWidth,h=innerHeight;if(v&&v.width>0){w=Math.round(v.width*(v.scale||1));h=Math.round(v.height*(v.scale||1))}const e=document.documentElement;return[w||e.clientWidth,h||e.clientHeight]}
function rs(){DPR=Math.min(2,window.devicePixelRatio||1);[W,H]=vpWH();C.style.width=W+'px';C.style.height=H+'px';C.width=Math.round(W*DPR);C.height=Math.round(H*DPR);S=Math.min(W/1280,H/720);OX=(W-1280*S)/2;OY=(H-720*S)/2}
let _lastW=-1,_lastH=-1,_wasP=null;function relayout(){rs();_lastW=W;_lastH=H;const p=PORTRAIT();if(_wasP!==p){_wasP=p;document.body.classList.toggle('portrait',p);if(!p){last=performance.now();if(AC&&AC.state==='suspended')AC.resume().catch(()=>{})}}}
function onOrient(){relayout();[100,300,600].forEach(t=>setTimeout(relayout,t))}
addEventListener('resize',onOrient);addEventListener('orientationchange',onOrient);addEventListener('pageshow',onOrient);document.addEventListener('visibilitychange',()=>{if(!document.hidden)onOrient()});
if(screen.orientation&&screen.orientation.addEventListener)screen.orientation.addEventListener('change',onOrient);
if(window.visualViewport){visualViewport.addEventListener('resize',onOrient);visualViewport.addEventListener('scroll',onOrient)}
setInterval(()=>{const[w,h]=vpWH();if(w!==_lastW||h!==_lastH||PORTRAIT()!==_wasP)relayout()},500);rs();
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
var AC=null;function ac(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();return AC}
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
function wrap(t,maxW){const ws=t.split(' '),out=[];let cur='';for(const w of ws){const s=cur?cur+' '+w:w;if(X.measureText(s).width>maxW&&cur){out.push(cur);cur=w}else cur=s}if(cur)out.push(cur);return out}
function txt(t,x,y,size,col,o){o=o||{};X.font=(o.b?'bold ':'')+size+'px '+(o.f||FONT);X.textAlign=o.al||'center';X.textBaseline='middle';
 if(o.st!==0){X.lineJoin='round';X.lineWidth=o.lw||Math.max(3,size*.16);X.strokeStyle=o.st||'rgba(30,10,50,.9)';X.strokeText(t,x,y)}X.fillStyle=col||'#fff';X.fillText(t,x,y)}
// кристалл-самоцвет с гранями
// ---- кнопки ----
let UI=[];
// ---- герои: дыхание, речь со squash&stretch, прыжки ----
let cast=[];
const NAMES={granit:['Гранит','#ff9a52'],iskorka:['Искорка-Пи','#c79bff'],shester:['Шестерёнка','#ffd36b'],troll:['Тролль-Дробила','#9be07a'],narrator:['','#fff']};
function cheer(){cast.forEach((c,i)=>{if(c.n!=='troll')c.jump=T+i*.08})}
function oops(n){const c=cast.find(c=>c.n===n);if(c)c.wob=T}
function drawCast(){cast.forEach(drawHero)}
// ---- сцены ----
const SC={};let scene='title',SCN=null;
function go(n,arg){scene=n;SCN=SC[n];fade=1;talk=null;if(skipTalk)skipTalk();SCN.enter&&SCN.enter(arg)}
C.addEventListener('pointerdown',e=>{if(PORTRAIT())return;ac();const x=(e.clientX-OX)/S,y=(e.clientY-OY)/S;PX=x;PY=y;
 for(let i=UI.length-1;i>=0;i--){const b=UI[i];if(Math.abs(x-b.x)<b.w/2+6&&Math.abs(y-b.y)<b.h/2+6){if(b.dis||(G._busy&&!b.always))return;SFX.click();b.fn();return}}
 if(talk&&talk.box&&skipTalk){const[bx,by,bw,bh]=talk.box;if(x>bx&&x<bx+bw&&y>by&&y<by+bh){skipTalk();return}}
 if(SCN&&SCN.tap)SCN.tap(x,y)});
C.addEventListener('pointermove',e=>{PX=(e.clientX-OX)/S;PY=(e.clientY-OY)/S});
let last=performance.now(),fpsA=60;
const TOUCH=(('ontouchstart' in window)||navigator.maxTouchPoints>0)&&matchMedia('(pointer:coarse)').matches;const PORTRAIT=()=>TOUCH&&H>W*1.05;
function loop(now){DT=PORTRAIT()?0:clamp((now-last)/1000,0,.05);last=now;T+=DT;fpsA=fpsA*.95+(1/Math.max(DT,.001))*.05;
 X.setTransform(DPR,0,0,DPR,0,0);X.clearRect(0,0,W,H);
 const sx=(Math.random()-.5)*shake,sy=(Math.random()-.5)*shake;shake*=Math.pow(.004,DT);if(shake<.3)shake=0;
 X.setTransform(DPR*S,0,0,DPR*S,DPR*(OX+sx),DPR*(OY+sy));UI=[];stepParticles();
 try{SCN&&SCN.draw()}catch(e){console.error(e)}
 drawParticles();drawTalk();if(SCN&&SCN.ui)SCN.ui();
 if(fade>0){const v=vis();X.fillStyle=`rgba(8,4,20,${fade})`;X.fillRect(v.x0,v.y0,v.w,v.h);fade=Math.max(0,fade-DT*2.5)}
 if(PORTRAIT())drawRotate();
 requestAnimationFrame(loop)}
// поверни телефон: нарисованный свиток со сказочной надписью, игра на паузе
let rotT=0;function drawRotate(){rotT+=1/60;X.setTransform(DPR,0,0,DPR,0,0);const tb=IM.bg_title;if(tb&&tb.complete&&tb.naturalWidth){const k=Math.max(W/tb.naturalWidth,H/tb.naturalHeight)*1.08,dx=Math.sin(rotT*.3)*W*.02;X.save();X.filter='blur(3px) brightness(.8)';X.drawImage(tb,W/2-tb.naturalWidth*k/2+dx,H/2-tb.naturalHeight*k/2,tb.naturalWidth*k,tb.naturalHeight*k);X.restore()}
 {const g=X.createRadialGradient(W/2,H/2,Math.min(W,H)*.3,W/2,H/2,Math.max(W,H)*.75);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.45)');X.fillStyle=g;X.fillRect(0,0,W,H)}
 const bw=Math.min(W*.92,560),bh=bw*.62,k=1+Math.sin(rotT*2.2)*.03;X.save();X.translate(W/2,H/2);X.rotate(Math.sin(rotT*1.4)*.05);X.scale(k,k);
 win('scroll_banner',-bw/2,-bh/2,bw,bh);const fs=bw*.105;txt('Поверни',0,-fs*.62,fs,'#6a3410',{st:'rgba(255,245,215,.85)',lw:fs*.14});txt('телефон',0,fs*.62,fs,'#6a3410',{st:'rgba(255,245,215,.85)',lw:fs*.14});X.restore()}
// тестовый интерфейс
Object.defineProperty(G,'busy',{get:()=>G._busy>0});Object.defineProperty(G,'scene',{get:()=>scene});
G.go=n=>go(n);G.S=SV;G.pg=(x,y)=>({x:OX+x*S,y:OY+y*S});G.btns=()=>UI.map(b=>({id:b.id,x:b.x,y:b.y}));G.fps=()=>fpsA;
G.math={isP,fac};
