'use strict';
// ===== сцены и уровни =====
const LNAMES=['Кодовый замок','Кристальная шахта','Решето у водопада','Вагонетка','Логово Тролля'];
const ROUNDS=[3,6,5,6,3];
let LV=null;
// ---------- заставка ----------
SC.title={enter(){cast=[{n:'granit',x:170,y:700,h:300},{n:'iskorka',x:330,y:700,h:270},{n:'shester',x:1110,y:700,h:290}]},
 draw(){bgDraw('title');motes(190);drawCast();
  const tl='Пещера простых кристаллов';X.save();X.translate(640,150+Math.sin(T*1.5)*5);X.font='92px '+FONT;X.textAlign='center';X.textBaseline='middle';
  X.lineJoin='round';X.lineWidth=16;X.strokeStyle='rgba(30,8,60,.9)';X.strokeText(tl,0,0);
  const g=X.createLinearGradient(-520,0,520,0);const sh=(T*.15)%1;['#7ff6ff','#b88bff','#ff8ad8','#ffd36b','#7ff6ff'].forEach((c,i)=>g.addColorStop(((i/4)+sh)%1,c));
  X.shadowColor='rgba(150,220,255,.9)';X.shadowBlur=26;X.fillStyle=g;X.fillText(tl,0,0);X.shadowBlur=0;X.lineWidth=2;X.strokeStyle='rgba(255,255,255,.8)';X.strokeText(tl,0,0);X.restore();
  txt('Урок 310 · Перебор и простые числа',640,232,34,'#fff4d0');
  for(let i=0;i<5;i++)gem(470+i*85,320+Math.sin(T*2+i)*8,26,[190,280,320,45,150][i],[2,3,5,7,11][i]);},
 ui(){btn('play',640,470,300,96,'Играть!',()=>{go('intro')},{pulse:1,hue:35,fs:46})}};
// ---------- вступление ----------
SC.intro={enter(){cast=[{n:'granit',x:230,y:690,h:330},{n:'iskorka',x:430,y:690,h:300},{n:'shester',x:620,y:690,h:310},{n:'troll',x:1050,y:700,h:470,flip:1}];
 run(async()=>{for(const k of['p1','p2','p3','p4','p5','p6']){if(scene!=='intro')return;if(k==='p5'){swing('troll');setTimeout(()=>{shake=16;SFX.hit()},350);mood('troll','laugh')}if(k==='p6')cheer();await say(k)}if(scene==='intro')go('map')})},
 draw(){bgDraw('l5',.15);motes(280);drawCast()},
 ui(){btn('skip',1180,50,170,60,'Дальше ›',()=>go('map'),{always:1,hue:200,fs:28})}};
// ---------- карта ----------
const MP=[[220,470],[440,360],[650,470],[860,360],[1070,450]];
SC.map={enter(){cast=[{n:'iskorka',x:110,y:715,h:200}];if(!SV.seenMap){SV.seenMap=1;save();run(()=>say('map'))}},
 draw(){bgDraw('title',.35);motes(220);
  X.setLineDash([4,14]);X.lineCap='round';X.lineWidth=8;X.strokeStyle='rgba(255,230,150,.7)';X.beginPath();MP.forEach((p,i)=>i?X.lineTo(p[0],p[1]):X.moveTo(p[0],p[1]));X.stroke();X.setLineDash([]);
  txt('Карта пещеры',640,70,64,'#ffe9a8');
  MP.forEach((p,i)=>{const open=i<SV.open,hue=[190,300,170,40,120][i];gem(p[0],p[1]+Math.sin(T*1.6+i)*6,54,hue,i+1,{grey:!open,glow:open?1.2:0,fs:56});
   if(!open)lock(p[0]+38,p[1]+40);txt(LNAMES[i],p[0],p[1]+92,30,open?'#fff':'#aaa');
   for(let s=0;s<3;s++)star(p[0]-36+s*36,p[1]+128,14,s<SV.stars[i]);
   if(open&&i===SV.open-1&&SV.stars[i]===0){X.globalAlpha=.5+.5*Math.sin(T*5);txt('▼',p[0],p[1]-92,36,'#fff');X.globalAlpha=1}});
  const sc=SV.secret.reduce((a,b)=>a+b,0);gem(1060,90,18,320,'',{glow:1});txt('Редкие кристаллы: '+sc+' из 4',920,92,28,'#ffd6f5');drawCast()},
 tap(x,y){MP.forEach((p,i)=>{if(Math.hypot(x-p[0],y-p[1])<70){if(i<SV.open){SFX.click();go('l'+(i+1))}else{SFX.bad();oops('iskorka')}}})}};
function lock(x,y){X.save();X.translate(x,y);X.strokeStyle='#e8c25a';X.lineWidth=6;X.beginPath();X.arc(0,-10,12,Math.PI,0);X.stroke();const g=X.createLinearGradient(0,-10,0,18);g.addColorStop(0,'#ffe08a');g.addColorStop(1,'#b8860b');X.fillStyle=g;rr(-17,-10,34,28,6);X.fill();X.fillStyle='#5a3a08';X.beginPath();X.arc(0,2,4,0,7);X.fill();X.fillRect(-1.5,2,3,9);X.restore()}
function star(x,y,r,on,sc){X.save();X.translate(x,y);if(sc)X.scale(sc,sc);X.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr2=i%2?r*.45:r;X.lineTo(Math.cos(a)*rr2,Math.sin(a)*rr2)}X.closePath();
 if(on){const g=X.createRadialGradient(0,-r*.3,1,0,0,r);g.addColorStop(0,'#fff6b0');g.addColorStop(1,'#f0a800');X.fillStyle=g;X.shadowColor='#ffd34d';X.shadowBlur=12}else X.fillStyle='rgba(60,50,80,.8)';X.fill();X.shadowBlur=0;X.lineWidth=2;X.strokeStyle=on?'#fff3c0':'rgba(200,190,220,.5)';X.stroke();X.restore()}
// ---------- общая рамка уровня ----------
const SECRET_POS=[[1215,250],[95,215],[1200,560],[70,330]];
const DEF={};
function levelScene(n){SC['l'+n]={enter(){if(LV&&LV.n===n&&LV.resume){LV.resume=false;cast=LV.cast;return}
  LV={n,r:0,mist:0,streak:0,done:false,banner:null,msg:null,def:DEF[n]};DEF[n].init(LV);cast=LV.cast;run(()=>DEF[n].start(LV))},
 draw(){bgDraw('l'+n,0,LV.scroll);motes([190,300,180,40,110][n-1]);DEF[n].draw(LV);drawCast();if(DEF[n].over)DEF[n].over(LV);
  if(n<5&&!SV.secret[n-1]&&!LV.done){const[sx,sy]=SECRET_POS[n-1];gem(sx,sy,11,320,'',{alpha:.45+.35*Math.sin(T*3),glow:.8+.4*Math.sin(T*3)})}
  if(LV.banner){const b=LV.banner;X.font='28px '+BODY;const L=wrap(b.t,760),w=Math.max(...L.map(l=>X.measureText(l).width))+50,h=L.length*36+26,y=b.y||96;
   X.globalAlpha=ease((T-b.t0)*4);panel(640-w/2,y,w,h,.92);L.forEach((l,i)=>txt(l,640,y+31+i*36,28,b.col||'#fff',{f:BODY,lw:4}));X.globalAlpha=1}},
 ui(){txt(LNAMES[n-1],640,34,38,'#ffe9a8');for(let i=0;i<ROUNDS[n-1];i++)gem(640-(ROUNDS[n-1]-1)*14+i*28,68,8,i<LV.r?45:250,'',{grey:i>=LV.r,glow:i<LV.r?1:0});
  btn('home',60,46,84,60,'⌂',()=>{go('map')},{always:1,hue:260,fs:36});if(!LV.done)btn('hint',1220,46,84,60,'?',()=>{if(!G.busy)run(()=>DEF[n].hint(LV))},{hue:50,fs:38});
  if(LV.done)endPanel(n)},
 tap(x,y){if(G.busy||LV.done)return;if(n<5&&!SV.secret[n-1]){const[sx,sy]=SECRET_POS[n-1];if(Math.hypot(x-sx,y-sy)<40){LV.resume=true;go('secret',n);return}}DEF[n].tap(LV,x,y)}}}
function banner(t,col,y){LV.banner={t,col,t0:T,y}}
async function roundDone(){LV.r++;LV.banner=null;if(LV.r>=ROUNDS[LV.n-1]){LV.done=true;LV.doneT=T;const st=LV.mist===0?3:LV.mist<=2?2:1;LV.stars=st;SV.stars[LV.n-1]=Math.max(SV.stars[LV.n-1],st);SV.open=Math.max(SV.open,Math.min(5,LV.n+1));save();cheer();for(let i=0;i<3;i++)setTimeout(()=>{if(i<st){SFX.star();burst(560+i*80,330,24,'spark',48)}},500+i*350);if(LV.n<5)await say('win');return true}return false}
function endPanel(n){const v=vis();X.fillStyle='rgba(5,2,15,.45)';X.fillRect(v.x0,v.y0,v.w,v.h);panel(390,200,500,340);txt(n<5?'Пещера пройдена!':'Тролль побеждён!',640,250,50,'#ffe9a8');
 for(let i=0;i<3;i++){const k=ease((T-LV.doneT-.5-i*.35)*3);if(k>0)star(560+i*80,335,34,i<LV.stars,.4+.6*k+Math.sin(T*4+i)*.03);else star(560+i*80,335,34,false)}
 txt(LV.mist===0?'Без единой ошибки!':'Ошибок: '+LV.mist,640,405,28,'#fff',{f:BODY});
 btn('map',530,480,180,64,'Карта',()=>go('map'),{always:1,hue:260});
 if(n<5)btn('next',750,480,200,64,'Дальше ›',()=>go('l'+(n+1)),{always:1,hue:130,pulse:1});else btn('fin',750,480,200,64,'Финал ›',()=>go('fin'),{always:1,hue:130,pulse:1})}
// ---------- УРОВЕНЬ 1: кодовый замок (перебор) ----------
function perms(ds,len,rep){const out=[];(function rec(p){if(p.length===len){out.push(p.join(''));return}for(const d of ds){if(!rep&&p.includes(d))continue;rec(p.concat(d))}})([]);return out}
const R1=[{ds:[1,2,3],len:3,rep:false,k:'l1i',dk:'l1d0'},{ds:[1,2,3],len:2,rep:true,k:'l1q1',dk:'l1d1'},{ds:[1,2,3,4],len:2,rep:false,k:'l1q2',dk:'l1d2',quiz:[7,12,16]}];
DEF[1]={init(L){L.cast=[{n:'shester',x:110,y:712,h:230},{n:'iskorka',x:240,y:712,h:200}];setR1(L)},
 async start(L){await say(R1[0].k)},
 draw(L){const R=L.R;panel(300,120,330,470);txt('Замок '+(L.r+1),465,155,36,'#ffe9a8');
  const n=R.len,sw=70;for(let i=0;i<n;i++){const x=465-(n-1)*sw/2+i*sw,y=225;rr(x-28,y-36,56,72,10);X.fillStyle='#120a26';X.fill();X.lineWidth=3;X.strokeStyle=L.err&&T-L.err<.5?'#ff6b6b':'#c9a24a';X.stroke();
   const d=R.quiz?'?':L.cur[i];if(d!=null)txt(String(d),x,y+2,48,R.quiz?'#9ad':'#7ff6ff',{f:FONT})}
  if(!R.quiz)txt('Найдено: '+L.found.length+' из '+L.all.length,465,290,28,'#fff',{f:BODY});
  if(L.msg){X.font='22px '+BODY;const ml=wrap(L.msg.t,300);ml.forEach((l,i)=>txt(l,465,(R.quiz?296:530)+i*26-(R.quiz?0:(ml.length-1)*13),22,L.msg.col,{f:BODY,lw:4}))}
  // дерево вариантов
  const tr=L.tree;const grow=R.quiz?(L.qDone?ease((T-L.qDone)*.8):0):1;
  if(!R.quiz||L.qDone){X.lineCap='round';for(const nd of tr.nodes){if(!nd.par)continue;const lit=L.found.some(c=>c.startsWith(nd.code))||L.qDone;const a=R.quiz?clamp(grow*R.len-nd.d+1,0,1):1;if(a<=0)continue;
    X.globalAlpha=a;X.strokeStyle=lit?'rgba(255,220,120,.9)':'rgba(180,170,220,.25)';X.lineWidth=lit?4:2;X.beginPath();X.moveTo(nd.par.x+14,nd.par.y);X.bezierCurveTo((nd.par.x+nd.x)/2,nd.par.y,(nd.par.x+nd.x)/2,nd.y,nd.x-12,nd.y);X.stroke();X.globalAlpha=1}
   for(const nd of tr.nodes){const a=R.quiz?clamp(grow*R.len-nd.d+1,0,1):1;if(a<=0)continue;const lit=nd.d===0||L.found.some(c=>c.startsWith(nd.code))||L.qDone;const hl=L.hint&&L.hint.startsWith(nd.code)&&nd.d>0&&T-L.hintT<6;
    if(nd.d===0){gem(nd.x,nd.y,22,45,'',{alpha:a});lock(nd.x,nd.y+2);continue}
    gem(nd.x,nd.y,nd.leaf?13:16,lit?48:250,nd.leaf?'':nd.code.slice(-1),{grey:!lit&&!hl,alpha:a*(lit||hl?1:.55),glow:lit?1:hl?1.5:0,sc:hl?1+.15*Math.sin(T*8):1,fs:20});
    if(nd.leaf)txt(nd.code,nd.x+24,nd.y+1,24,lit?'#fff3b0':hl?'#7ff6ff':'rgba(220,210,255,.35)',{al:'left',f:FONT,lw:4})}}
  else{txt('?',920,360,160,'rgba(255,255,255,.25)',{f:FONT})}},
 over(L){const R=L.R;if(L.done)return;if(R.quiz&&!L.qDone){R.quiz.forEach((v,i)=>btn('q'+v,465,370+i*72,150,58,String(v),()=>quiz1(L,v),{hue:200+i*40,fs:36}))}
  else if(!R.quiz){R.ds.forEach((d,i)=>{const x=465-(R.ds.length-1)*40+i*80;btn('d'+d,x,370,68,68,String(d),()=>dig1(L,d),{hue:185,fs:40})});btn('del',465,450,150,52,'Стереть',()=>{L.cur=[]},{hue:0,fs:26})}},
 tap(){},
 async hint(L){if(L.R.quiz){await say('l1w2');return}L.hint=L.all.find(c=>!L.found.includes(c));L.hintT=T;await say('l1h')},
 wrong(L){const R=L.R;if(R.quiz){quiz1(L,R.quiz[0]);return}const ws=R.rep?(L.found[0]||null):String(R.ds[0]).repeat(2)+R.ds[1];
  if(R.rep&&!ws){const c=L.all[0];run(async()=>{await check1(L,c);await check1(L,c)});return}String(ws).slice(0,R.len).split('').forEach(d=>dig1(L,+d))},
 info(L){return{r:L.r,quiz:!!L.R.quiz,missing:L.all.filter(c=>!L.found.includes(c)),total:L.all.length,ans:L.R.quiz?L.all.length:null}}};
function setR1(L){const R=R1[L.r];L.R=R;L.cur=[];L.found=[];L.msg=null;L.qDone=0;L.hint=null;L.all=perms(R.ds,R.len,R.rep);
 const nodes=[],leaves=L.all.length,x0=690,x1=1150,y0=150,y1=600;const root={code:'',d:0,x:x0,y:(y0+y1)/2};nodes.push(root);
 L.all.forEach((c,i)=>{let par=root;for(let d=1;d<=R.len;d++){const code=c.slice(0,d);let nd=nodes.find(z=>z.code===code);if(!nd){nd={code,d,par,leaf:d===R.len,x:x0+(x1-x0)*d/R.len-(d===R.len?40:0),ys:[]};nodes.push(nd)}nd.ys.push(y0+(y1-y0)*(leaves===1?.5:i/(leaves-1)));par=nd}});
 nodes.forEach(n=>{if(n.ys)n.y=n.ys.reduce((a,b)=>a+b,0)/n.ys.length});L.tree={nodes}}
function dig1(L,d){if(G.busy||L.done)return;const R=L.R;if(L.cur.length>=R.len)return;L.cur.push(d);SFX.tick();if(L.cur.length===R.len){const c=L.cur.join('');run(async()=>{await wait(250);await check1(L,c)})}}
async function check1(L,c){const R=L.R;L.cur=[];
 if(!R.rep&&new Set(c).size<c.length){L.mist++;L.err=T;SFX.bad();shake=6;oops('shester');const d=[...c].find((x,i)=>c.indexOf(x)!==i);L.msg={t:'В коде '+c+' цифра '+d+' повторяется — так нельзя!',col:'#ffb0b0'};await say('l1rep');return}
 if(L.found.includes(c)){L.mist++;L.err=T;SFX.bad();oops('shester');L.msg={t:'Код '+c+' уже найден. Ищи новый!',col:'#ffb0b0'};await say('l1dup');return}
 L.found.push(c);SFX.ok();L.msg={t:'Новый код '+c+'!',col:'#b0ffc8'};const nd=L.tree.nodes.find(z=>z.code===c);burst(nd.x,nd.y,22,'spark',48);
 if(L.found.length===L.all.length){cheer();shake=8;burst(465,225,40,'shard',48);await say(R.dk);if(!await roundDone()){setR1(L);await say(L.R.k)}}}
function quiz1(L,v){if(G.busy||L.done)return;run(async()=>{if(v!==L.all.length){L.mist++;SFX.bad();shake=5;oops('iskorka');L.msg={t:v+' — не так. 4 способа для первой цифры и 3 для второй.',col:'#ffb0b0'};await say('l1w2');return}
 L.qDone=T;L.found=L.all.slice();SFX.ok();cheer();L.msg={t:'4 × 3 = 12',col:'#b0ffc8'};await say(L.R.dk);await wait(600);await roundDone()})}
levelScene(1);
// ---------- УРОВЕНЬ 2: раскол кристаллов ----------
const EASY2=[9,7,15,11,21,13,25,17];
DEF[2]={init(L){L.cast=[{n:'granit',x:330,y:705,h:330},{n:'iskorka',x:120,y:712,h:220}];L.used=[];L.lastWrong=false;L.gallery=[];next2(L)},
 async start(L){await say('l2i')},
 draw(L){const gx=720,gy=360;
  if(L.pieces){const k=ease((T-L.pieces.t0)*2.2);const[p,q]=L.pieces.f;gem(gx-170*k,gy+30*k,62,L.hue,p,{rot:-.3*k,glow:1});gem(gx+170*k,gy+30*k,62,L.hue+30,q,{rot:.3*k,glow:1});
   if(k>.6)txt(L.num+' = '+p+' × '+q,gx,gy+150,52,'#fff3b0')}
  else{const wob=L.wob&&T-L.wob<.6?Math.sin((T-L.wob)*40)*.1*(1-(T-L.wob)/.6):0;const fl=L.flash&&T-L.flash<.8?1.8:1;gem(gx,gy+Math.sin(T*1.8)*6,96,L.hue,L.num,{rot:wob,glow:fl,fs:84})}
  // кирка
  if(L.axe!=null){const t=T-L.axe;let a=t<.35?-1.2+ease(t/.35)*1.6:L.prime?.4-Math.sin(clamp((t-.35)*6,0,3.14))*.9:.4;X.save();X.translate(900,260);X.rotate(a);
   X.fillStyle='#7b4a22';rr(-8,-10,16,190,6);X.fill();X.fillStyle='#a8a8b8';X.beginPath();X.moveTo(-95,-6);X.quadraticCurveTo(0,-40,95,-6);X.lineTo(80,6);X.quadraticCurveTo(0,-18,-80,10);X.closePath();X.fill();X.strokeStyle='#e0e0f0';X.lineWidth=2;X.stroke();X.restore()}
  L.gallery.forEach((g,i)=>gem(470+i*50,630,14,g.p?48:200,g.n,{fs:14,glow:g.p?1:.3}))},
 over(L){if(L.phase==='ask'&&!L.done){btn('prime',560,560,240,74,'Простое',()=>ans2(L,true),{hue:45,fs:38});btn('comp',880,560,260,74,'Составное',()=>ans2(L,false),{hue:205,fs:38})}},
 tap(){},
 async hint(L){await say('l2h')},
 wrong(L){ans2(L,!isP(L.num))},
 info(L){return{r:L.r,n:L.num,prime:isP(L.num)}}};
function next2(L){const hard=POOL.filter(x=>!EASY2.includes(x));let src=(L.streak>=2&&!L.lastWrong)||L.r>=4?hard:EASY2;let c=src.filter(x=>!L.used.includes(x));if(!c.length)c=POOL.filter(x=>!L.used.includes(x));
 const lastP=L.used.length?isP(L.used[L.used.length-1]):null;const alt=c.filter(x=>isP(x)!==lastP);if(alt.length&&Math.random()<.65)c=alt;
 L.num=c[Math.floor(Math.random()*c.length)];L.used.push(L.num);L.hue=[190,280,320,160,40][L.used.length%5];L.phase='ask';L.pieces=null;L.axe=null;L.banner=null}
function ans2(L,guess){if(G.busy||L.done||L.phase!=='ask')return;const pr=isP(L.num);run(async()=>{
 if(guess!==pr){L.mist++;L.streak=0;L.lastWrong=true;SFX.bad();L.wob=T;oops('granit');banner('Не так! '+expl(L.num),'#ffd0d0');await say('l2w');await say('n'+L.num);return}
 L.streak++;L.lastWrong=false;L.phase='anim';L.axe=T;oops('granit');await wait(350);
 if(pr){SFX.clang();L.flash=T;burst(760,300,30,'spark',50);shake=6}else{SFX.shatter();shake=18;burst(720,360,46,'shard',L.hue);const f=fac(L.num);L.pieces={t0:T,f:[f[0],L.num/f[0]]}}
 SFX.ok();banner(expl(L.num),'#e8fff0');await wait(500);await say('n'+L.num);await wait(500);L.gallery.push({n:L.num,p:pr});
 if(!await roundDone())next2(L)})}
levelScene(2);
// ---------- УРОВЕНЬ 3: решето Эратосфена ----------
const STEPS3=[1,2,3,5,7],SK3=['l3s1','l3s2','l3s3','l3s5','l3s7'],CX3=430,CY3=84,CW3=46,CH3=38;
function cell3(n){const i=n-1;return{x:CX3+(i%10)*CW3+CW3/2,y:CY3+Math.floor(i/10)*CH3+CH3/2}}
DEF[3]={init(L){L.cast=[{n:'iskorka',x:150,y:712,h:250},{n:'granit',x:1150,y:712,h:250,flip:1}];L.st=new Array(101).fill(0);L.wt={};L.bad={};L.cnt=0},
 async start(L){await say('l3i');await say(SK3[0])},
 draw(L){X.fillStyle='rgba(40,25,10,.18)';rr(CX3-12,CY3-10,CW3*10+24,CH3*10+20,14);X.fill();
  for(let n=1;n<=100;n++){const{x,y}=cell3(n),s=L.st[n];const hl=L.hintN===n&&T-L.hintT<5;
   if(s===2){gem(x,y,15,[45,190,300,150,20][n%5],n,{fs:n>9?15:18,glow:1.1});continue}
   let a=1,col='#4a2c12',dy=0;if(s===3){const k=clamp((T-(L.wt[n]||0))*2.5,0,1);a=1-.72*k;dy=k*4;col='#2a6c90'}if(s===1)col='#777';
   if(L.bad[n]&&T-L.bad[n]<.6){col='#d02020';x+Math.sin(T*50)*3}
   X.globalAlpha=a;txt(String(n),x+(L.bad[n]&&T-L.bad[n]<.6?Math.sin(T*60)*3:0),y+dy,26,hl?'#fff':col,{st:hl?'#e09020':'rgba(255,240,210,.55)',lw:hl?6:3});X.globalAlpha=1;
   if(s===3&&T-(L.wt[n]||0)>.4){X.strokeStyle='rgba(40,110,160,.55)';X.lineWidth=2;X.beginPath();X.moveTo(x-12,y+6);X.lineTo(x+12,y-6);X.stroke()}
   if(s===1){X.strokeStyle='#888';X.lineWidth=2;X.beginPath();X.arc(x,y,15,0,7);X.stroke()}}
  if(L.wash){txt('Смываем числа, кратные '+L.wash,655,500,34,'#bff4ff')}
  if(L.cnt)txt('Простых чисел: '+L.cnt,655,540,44,'#fff3b0')},
 tap(L,x,y){const c=Math.floor((x-CX3)/CW3),r=Math.floor((y-CY3)/CH3);if(c<0||c>9||r<0||r>9)return;tap3(L,r*10+c+1)},
 async hint(L){L.hintN=STEPS3[L.r];L.hintT=T;await say(SK3[L.r])},
 wrong(L){tap3(L,4)},
 info(L){return{r:L.r,expect:STEPS3[L.r],primes:L.st.filter(s=>s===2).length}}};
G.cellXY=n=>cell3(n);
function tap3(L,n){if(G.busy||L.done)return;const ex=STEPS3[L.r];run(async()=>{
 if(n!==ex){L.mist++;L.bad[n]=T;SFX.bad();oops('iskorka');const s=L.st[n],f=fac(n);let m;
  if(ex===1)m='Сначала нажми на число 1.';else if(s===3)m=n+' уже смыто: '+n+' = '+f[0]+' × '+(n/f[0])+'.';else if(s===2)m=n+' уже обведено — оно простое.';else if(n===1)m='1 — ни простое, ни составное.';
  else if(!isP(n))m=n+' = '+f[0]+' × '+(n/f[0])+' — составное, его смоет вода.';else m=n+' простое, но сначала самое маленькое: '+ex+'.';
  banner(m,'#ffd0d0',560);await say('l3w');return}
 L.banner=null;SFX.ok();const{x,y}=cell3(n);burst(x,y,26,'spark',50);
 if(n===1){L.st[1]=1;await say('l3one')}else{L.st[n]=2;L.wash=n;await wait(300);let i=0;
  for(let m=2*n;m<=100;m+=n){if(L.st[m]===0){L.st[m]=3;L.wt[m]=T;const c=cell3(m);drops(c.x,c.y,7);if(i++%3===0)SFX.splash();await wait(G.fast?0:80)}}
  shake=4;await wait(400);L.wash=0}
 const done=L.r===STEPS3.length-1;
 if(done){for(let m=2;m<=100;m++){if(L.st[m]===0){L.st[m]=2;const c=cell3(m);burst(c.x,c.y,8,'spark',48);SFX.tick();await wait(G.fast?0:90)}L.cnt=L.st.filter(s=>s===2).length}cheer();SFX.star();await say('l3d');await roundDone()}
 else{await roundDone();await say(SK3[L.r])}})}
levelScene(3);
// ---------- УРОВЕНЬ 4: вагонетка ----------
const PR4=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97],CO4=[9,15,21,25,27,33,35,39,49,51,57,91];
function bez(t,y){const a=[600,560],c=[820,560],b=[1170,y];const u=1-t;return{x:u*u*a[0]+2*u*t*c[0]+t*t*b[0],y:u*u*a[1]+2*u*t*c[1]+t*t*b[1]}}
DEF[4]={init(L){L.cast=[{n:'shester',x:90,y:712,h:180},{n:'iskorka',x:250,y:330,h:150}];L.tl=9;L.scroll=0;L.usedP=[];L.usedC=[];setF4(L)},
 async start(L){await say('l4i');L.phase='go';L.t0=T},
 draw(L){const moving=L.phase==='go'||L.phase==='ride'||L.phase==='back';
  if(L.phase==='go'){const k=(T-L.t0)/L.tl;L.cx=140+460*Math.min(1,k);if(k>=1){L.phase='wait';run(async()=>{SFX.bad();await say('l4slow');await say('l4h')});L.tl=Math.min(14,L.tl+2)}}
  if(moving)L.scroll+=DT*(L.phase==='go'?460/L.tl:300);
  // рельсы
  const rail=(pts,on)=>{X.strokeStyle='rgba(30,18,10,.9)';X.lineWidth=14;X.beginPath();pts.forEach((p,i)=>i?X.lineTo(p.x,p.y):X.moveTo(p.x,p.y));X.stroke();X.strokeStyle=on?'#ffd88a':'#b9a088';X.lineWidth=4;
   [-9,9].forEach(o=>{X.beginPath();pts.forEach((p,i)=>i?X.lineTo(p.x,p.y+o):X.moveTo(p.x,p.y+o));X.stroke()})};
  X.fillStyle='#5a3a1e';for(let x=-((L.scroll)%40)-40;x<600;x+=40){rr(x,548,10,26,3);X.fill()}
  rail([{x:-60,y:560},{x:600,y:560}]);
  L.opts.forEach((o,i)=>{const pts=[];for(let t=0;t<=1.001;t+=.05)pts.push(bez(t,o.y));rail(pts,L.sel===i);const e=bez(1,o.y);X.fillStyle='#8b2b1e';rr(e.x-6,e.y-26,16,52,4);X.fill();
   const g=bez(.82,o.y);o.gx=g.x;o.gy=g.y-58;const bad=o.dead&&T-o.dead<3;gem(o.gx,o.gy,40,bad?0:o.hue,o.n,{fs:36,glow:bad?.5:1.1,grey:o.tried});X.strokeStyle='#6b4a2a';X.lineWidth=5;X.beginPath();X.moveTo(g.x,g.y-14);X.lineTo(g.x,g.y-6);X.stroke()});
  // вагонетка
  let p={x:L.cx,y:560},ang=0;if(L.ride!=null){const t=L.ride;p=bez(t,L.opts[L.sel].y);const q=bez(Math.min(1,t+.02),L.opts[L.sel].y);ang=Math.atan2(q.y-p.y,q.x-p.x)}
  cart(p.x,p.y,ang,L.scroll)},
 tap(L,x,y){if(L.done||!(L.phase==='go'||L.phase==='wait'))return;L.opts.forEach((o,i)=>{if(!o.tried&&Math.hypot(x-o.gx,y-o.gy)<62)pick4(L,i)})},
 async hint(L){L.opts.forEach(o=>{});await say('l4h')},
 wrong(L){const i=L.opts.findIndex(o=>!o.prime&&!o.tried);if(i>=0)pick4(L,i)},
 info(L){return{r:L.r,phase:L.phase,opts:L.opts.map(o=>({n:o.n,prime:o.prime,x:o.gx,y:o.gy,tried:!!o.tried}))}}};
function cart(x,y,a,sc){X.save();X.translate(x,y);X.rotate(a);
 const lg=X.createRadialGradient(150,-30,10,150,-30,260);lg.addColorStop(0,'rgba(255,230,150,.35)');lg.addColorStop(1,'rgba(255,230,150,0)');X.fillStyle=lg;X.beginPath();X.moveTo(40,-50);X.lineTo(420,-170);X.lineTo(420,110);X.closePath();X.fill();
 const im=IM.granit;if(im.complete&&im.width){const h=200,w=h*im.width/im.height;X.save();X.beginPath();X.rect(-80,-230,160,190);X.clip();X.drawImage(im,-w/2,-190+Math.abs(Math.sin(T*8))*3,w,h);X.restore()}
 const g=X.createLinearGradient(0,-60,0,-10);g.addColorStop(0,'#8a5a32');g.addColorStop(1,'#4a2c14');X.fillStyle=g;X.beginPath();X.moveTo(-70,-62);X.lineTo(70,-62);X.lineTo(56,-14);X.lineTo(-56,-14);X.closePath();X.fill();
 X.strokeStyle='#c9a24a';X.lineWidth=4;X.stroke();X.fillStyle='#d8b060';[-50,0,50].forEach(px=>{X.beginPath();X.arc(px,-38,4,0,7);X.fill()});
 [-38,38].forEach(wx=>{X.save();X.translate(wx,-10);X.rotate(sc/14);X.fillStyle='#2a2030';X.beginPath();X.arc(0,0,14,0,7);X.fill();X.strokeStyle='#b8b0c8';X.lineWidth=3;X.beginPath();X.arc(0,0,10,0,7);X.moveTo(-10,0);X.lineTo(10,0);X.moveTo(0,-10);X.lineTo(0,10);X.stroke();X.restore()});
 X.fillStyle='#ffd36b';X.beginPath();X.arc(64,-50,7,0,7);X.fill();X.restore()}
function setF4(L){const k=L.r<3?2:3;const smallP=L.tl>10||L.r<2;let pc=PR4.filter(p=>(smallP?p<=31:p>=11)&&!L.usedP.includes(p));const p=pc[Math.floor(Math.random()*pc.length)];L.usedP.push(p);
 let cc=shuffle(CO4.filter(c=>!L.usedC.includes(c))).slice(0,k-1);if(cc.length<k-1)cc=shuffle(CO4.slice()).slice(0,k-1);L.usedC.push(...cc);
 const ns=shuffle([p,...cc]);const ys=k===2?[400,660]:[300,470,665];L.opts=ns.map((n,i)=>({n,prime:isP(n),y:ys[i],hue:[190,300,45][i]}));L.sel=null;L.ride=null;L.cx=140;L.phase='go';L.t0=T}
function pick4(L,i){if(G.busy||L.done)return;const o=L.opts[i];L.sel=i;const prev=L.phase;L.phase='ride';run(async()=>{
 const dur=G.fast?.05:.9;let t0=T;const to=o.prime?1:.78;while(T-t0<dur){L.ride=ease((T-t0)/dur)*to;await new Promise(r=>requestAnimationFrame(r))}L.ride=to;
 if(o.prime){SFX.ok();burst(bez(1,o.y).x-60,o.y-60,40,'spark',48);cheer();L.streak++;if(L.streak>=2)L.tl=Math.max(5,L.tl-1.2);await say('l4ok');fade=.9;if(!await roundDone()){await wait(200);setF4(L)}else L.phase='end'}
 else{L.mist++;L.streak=0;L.tl=Math.min(14,L.tl+2);o.dead=T;o.tried=1;SFX.hit();shake=16;burst(bez(.78,o.y).x+40,o.y,26,'shard',20);oops('granit');banner('Тупик! '+expl(o.n),'#ffd0d0',90);
  await say(LINES['n'+o.n]?'l4w':'l4w');if(LINES['n'+o.n])await say('n'+o.n);t0=T;while(T-t0<dur){L.ride=to*(1-ease((T-t0)/dur));await new Promise(r=>requestAnimationFrame(r))}L.ride=null;L.sel=null;L.cx=600;L.phase='wait'}})}
levelScene(4);
// ---------- УРОВЕНЬ 5: босс — дерево множителей ----------
DEF[5]={init(L){L.cast=[{n:'granit',x:100,y:712,h:220},{n:'iskorka',x:235,y:712,h:200},{n:'troll',x:1110,y:712,h:400,flip:1}];L.hearts=3;L.nums=[12,30,84];setB(L)},
 async start(L){await say('l5i');await smash(L)},
 draw(L){for(let i=0;i<3;i++){X.save();X.translate(1030+i*48,140);X.scale(1+(i===L.hearts&&T-(L.hitT||0)<.6?.5:0),1);heart(i<L.hearts);X.restore()}
  X.lineCap='round';for(const nd of L.nodes){if(nd.par){X.strokeStyle='rgba(255,230,160,.8)';X.lineWidth=4;X.beginPath();X.moveTo(nd.par.x,nd.par.y+40);X.lineTo(nd.x,nd.y-40);X.stroke()}}
  for(const nd of L.nodes){const k=ease((T-nd.t0)*3);if(L.rebuild&&nd.prime)continue;const cur=nd===L.cur;
   gem(nd.x,nd.y,nd.d===0?54:40,nd.prime?48:cur?280:250,nd.v,{sc:.3+.7*k,crack:!nd.prime&&nd.split,glow:nd.prime?1.3:cur?1+.3*Math.sin(T*6):.4,grey:nd.split&&!nd.prime,alpha:nd.split&&!nd.prime?.6:1,fs:nd.d===0?46:34,rot:cur&&L.wob&&T-L.wob<.5?Math.sin((T-L.wob)*40)*.1:0})}
  if(L.rebuild){const ps=L.nodes.filter(n=>n.prime);const k=ease((T-L.rebuild)*1.5);const n=ps.length,x0=640-(n-1)*70;
   ps.forEach((p,i)=>{const tx=x0+i*140,ty=560;gem(p.x+(tx-p.x)*k,p.y+(ty-p.y)*k,34,48,p.v,{fs:30,glow:1.3});if(i&&k>.9)txt('×',tx-70,ty,40,'#fff')});
   if(k>.95)txt('= '+L.N,x0+(n-1)*140+100,560,50,'#fff3b0',{al:'left'})}},
 over(L){if(L.done||!L.cur)return;[2,3,5,7].forEach((p,i)=>btn('p'+p,440+i*110,650,90,70,String(p),()=>pickB(L,p),{hue:[45,190,300,150][i],fs:40}))},
 tap(){},
 async hint(L){await say('l5h')},
 wrong(L){if(!L.cur)return;const p=[2,3,5,7].find(p=>L.cur.v%p!==0);pickB(L,p)},
 info(L){return{r:L.r,v:L.cur?L.cur.v:null,N:L.N}}};
function heart(on){X.beginPath();X.moveTo(0,8);X.bezierCurveTo(-22,-6,-12,-24,0,-12);X.bezierCurveTo(12,-24,22,-6,0,8);X.fillStyle=on?'#ff4d7a':'rgba(60,40,70,.8)';X.fill();X.strokeStyle='#fff';X.lineWidth=2;X.stroke()}
function setB(L){L.N=L.nums[L.r];const root={v:L.N,d:0,x:560,y:150,t0:T,prime:false};L.nodes=[root];L.cur=null;L.rebuild=0}
async function smash(L){swing('troll');mood('troll','laugh');await wait(380);shake=22;SFX.hit();burst(560,150,30,'shard',280);L.cur=L.nodes[0];await say('b'+L.N)}
function pickB(L,p){if(G.busy||L.done||!L.cur)return;run(async()=>{const nd=L.cur,v=nd.v;
 if(v%p!==0){L.mist++;L.wob=T;SFX.bad();oops('iskorka');banner(v+' не делится на '+p+' нацело'+(p===2?' — оно нечётное.':p===5?' — оно не оканчивается на 0 или 5.':'.'),'#ffd0d0',470);mood('troll','laugh');await say('l5no');return}
 L.banner=null;SFX.shatter();shake=8;burst(nd.x,nd.y,24,'shard',280);nd.split=true;const q=v/p;
 const a={v:p,d:nd.d+1,x:nd.x-85,y:nd.y+105,t0:T,prime:true,par:nd},b={v:q,d:nd.d+1,x:nd.x+85,y:nd.y+105,t0:T,prime:isP(q),par:nd};L.nodes.push(a,b);
 if(!b.prime){L.cur=b;return}
 L.cur=null;await wait(700);L.rebuild=T;SFX.star();await wait(1100);burst(640,560,40,'spark',48);cheer();await say('b'+L.N+'d');
 const tr=L.cast[2];L.hearts--;L.hitT=T;tr.hit=T;mood('troll','angry');shake=20;SFX.hit();
 const last=L.r===2;if(!last)await say('l5hit');else await say('l5end');
 if(L.r===1&&L.mist>2)L.nums[2]=18;
 if(!await roundDone()){setB(L);await wait(300);await smash(L)}})}
levelScene(5);
// ---------- тайные комнаты ----------
const SECRETS=[{k:'s1',q:'Сколько трёхзначных кодов из цифр 5 и 7, если цифры можно повторять?',o:['6','8','9'],a:1,why:'2 × 2 × 2 = 8: каждую из трёх цифр выбираем двумя способами.'},
 {k:'s2',q:'Какое из этих чисел простое?',o:['51','57','59'],a:2,why:'51 = 3 × 17 и 57 = 3 × 19 — составные. А 59 делится только на 1 и на 59.'},
 {k:'s3',q:'Простые близнецы отличаются на 2. Найди пару близнецов!',o:['11 и 13','13 и 15','23 и 25'],a:0,why:'15 = 3 × 5 и 25 = 5 × 5 — составные. А 11 и 13 — оба простые.'},
 {k:'s4',q:'Какое единственное чётное простое число?',o:['2','4','6'],a:0,why:'Все остальные чётные числа делятся на 2: 4 = 2 × 2, 6 = 2 × 3.'}];
let SEC=null;
SC.secret={enter(n){SEC={n,i:n-1,why:null};cast=[{n:'shester',x:150,y:712,h:240}];run(async()=>{await say('sec');await say(SECRETS[n-1].k)})},
 draw(){bgDraw('l'+SEC.n,.55);motes(320);const s=SECRETS[SEC.i];panel(300,90,680,400);txt('Тайная комната',640,135,46,'#ffd6f5');
  X.font='30px '+BODY;wrap(s.q,600).forEach((l,i)=>txt(l,640,200+i*38,30,'#fff',{f:BODY,lw:4}));
  if(SEC.why){X.font='24px '+BODY;wrap(SEC.why,600).forEach((l,i)=>txt(l,640,420+i*30,24,SEC.ok?'#b0ffc8':'#ffd0d0',{f:BODY,lw:4}))}
  if(SEC.ok)gem(640,330,60,320,'★',{sc:1+.1*Math.sin(T*5),glow:1.6,fs:50});drawCast()},
 ui(){const s=SECRETS[SEC.i];if(!SEC.ok)s.o.forEach((o,i)=>btn('o'+i,440+i*200,330,170,72,o,()=>ansS(i),{hue:[190,300,45][i],fs:o.length>3?28:40}));
  btn('back',1180,50,170,60,'‹ Назад',()=>go('l'+SEC.n),{always:1,hue:260,fs:28})}};
function ansS(i){if(G.busy)return;const s=SECRETS[SEC.i];run(async()=>{if(i!==s.a){SFX.bad();oops('shester');SEC.why=s.why;await say('secw');return}
 SEC.ok=1;SEC.why=s.why;SV.secret[SEC.i]=1;save();SFX.star();burst(640,330,50,'spark',320);burst(640,330,30,'shard',320);cheer();await say('secok');await wait(600);go('l'+SEC.n)})}
// ---------- финал ----------
SC.fin={enter(){cast=[{n:'granit',x:260,y:705,h:300},{n:'iskorka',x:450,y:705,h:280},{n:'shester',x:640,y:705,h:290},{n:'troll',x:980,y:712,h:420,flip:1}];
 run(async()=>{cheer();await say('fin');await say('l5end')})},
 draw(){bgDraw('title',.1);motes(48);if(Math.random()<.2)burst(rnd(100,1180),rnd(80,300),10,Math.random()<.5?'spark':'shard',rnd(0,360),.6);if(Math.random()<.01)cheer();
  txt('Пещера спасена!',640,110,88,'#ffe9a8');const st=SV.stars.reduce((a,b)=>a+b,0);for(let i=0;i<5;i++)star(520+i*60,200,22,true);txt('Звёзд: '+st+' из 15 · редких кристаллов: '+SV.secret.reduce((a,b)=>a+b,0)+' из 4',640,250,30,'#fff',{f:BODY});drawCast()},
 ui(){btn('map',1150,60,160,60,'Карта',()=>go('map'),{always:1,hue:260,fs:28})}};
// ---------- API для тестов ----------
G.info=()=>LV&&scene[0]==='l'?LV.def.info(LV):scene==='secret'?{r:0,sec:SEC.i,a:SECRETS[SEC.i].a}:{};
G.wrong=()=>{if(scene==='secret'){const s=SECRETS[SEC.i];ansS((s.a+1)%3)}else if(LV)LV.def.wrong(LV)};
G.secretXY=()=>{const p=SECRET_POS[LV.n-1];return{x:p[0],y:p[1]}};
G.LV=()=>LV;G.cast=()=>cast;G.T=()=>T;G.setTalk=(who,t)=>{talk=who?{who,text:t,t0:T}:null};
go('title');requestAnimationFrame(loop);
