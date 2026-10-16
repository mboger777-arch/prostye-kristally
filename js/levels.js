'use strict';
// ===== сцены и уровни =====
const LNAMES=['Кодовый замок','Кристальная шахта','Решето у водопада','Вагонетка','Логово Тролля'];
const ROUNDS=[3,6,5,6,3];
let LV=null;
// ---------- заставка ----------
SC.title={enter(){cast=[{n:'granit',x:165,y:725,h:410},{n:'iskorka',x:375,y:725,h:370},{n:'shester',x:1120,y:725,h:400}]},
 draw(){bgDraw('title');motes(190);drawCast();
  {const lg=UA.logo;if(okI(lg)){const w=760,h=w*lg.naturalHeight/lg.naturalWidth;X.save();X.translate(640,150+Math.sin(T*1.5)*5);X.drawImage(lg,-w/2,-h/2,w,h);X.restore()}}
  win('scroll_banner',400,236,480,74);
  txt('Урок 310 · Перебор и простые числа',640,273,28,'#5a2e0c',{st:'rgba(255,245,215,.8)',lw:4});
  for(let i=0;i<5;i++)gem(448+i*96,350+Math.sin(T*2+i)*8,32,[190,280,320,45,150][i],[2,3,5,7,11][i],{fs:44});},
 ui(){btn('play',640,470,300,96,'Играть!',()=>{go('intro')},{pulse:1,hue:35,fs:46})}};
// ---------- вступление ----------
SC.intro={enter(){cast=[{n:'granit',x:190,y:730,h:440},{n:'iskorka',x:405,y:730,h:400},{n:'shester',x:610,y:730,h:400},{n:'troll',x:1080,y:745,h:600,flip:1}];
 run(async()=>{for(const k of['p1','p2','p3','p4','p5','p6']){if(scene!=='intro')return;if(k==='p5'){swing('troll');setTimeout(()=>{shake=16;SFX.hit()},350);mood('troll','laugh')}if(k==='p6')cheer();await say(k)}if(scene==='intro')go('map')})},
 draw(){bgDraw('l5',.15);motes(280);drawCast()},
 ui(){btn('skip',1180,50,170,60,'Дальше ›',()=>go('map'),{always:1,hue:200,fs:28})}};
// ---------- карта ----------
const MP=[[220,470],[440,360],[650,470],[860,360],[1070,450]];
SC.map={enter(){cast=[{n:'iskorka',x:72,y:712,h:160}];if(!SV.seenMap){SV.seenMap=1;save();run(()=>say('map'))}},
 draw(){bgDraw('title',.35);motes(220);
  for(let i=1;i<MP.length;i++){const a={x:MP[i-1][0],y:MP[i-1][1]},b={x:MP[i][0],y:MP[i][1]};vine(bezPts(a,b,16),7,i<SV.open)}
  win('scroll_banner',430,22,420,96);txt('Карта пещеры',640,70,50,'#6a3410',{st:'rgba(255,245,215,.85)',lw:5});
  MP.forEach((p,i)=>{const open=i<SV.open,hue=[190,300,170,40,120][i];const bob=Math.sin(T*1.6+i)*6;dimg('node',p[0]-70,p[1]-72+bob,140,143,{grey:!open});gem(p[0],p[1]+bob,38,hue,i+1,{grey:!open,glow:open?1.2:0,fs:52});
   if(!open)lock(p[0]+40,p[1]+42);win('sign',p[0]-98,p[1]+70,196,48,false);txt(LNAMES[i],p[0],p[1]+94,22,open?'#ffe9b8':'#bbb0a0',{st:'#2a1406',lw:4,maxW:160});
   for(let s=0;s<3;s++)star(p[0]-36+s*36,p[1]+136,15,s<SV.stars[i]);
   if(open&&i===SV.open-1&&SV.stars[i]===0){star(p[0],p[1]-100+Math.sin(T*5)*8,20,true,1+.1*Math.sin(T*5))}});
  const sc=SV.secret.reduce((a,b)=>a+b,0);win('sign',900,150,330,62);gem(1195,181,17,300,'',{glow:1});txt('Редкие кристаллы: '+sc+' из 4',1040,182,24,'#ffe9b8',{st:'#2a1406',lw:4});drawCast()},
 tap(x,y){MP.forEach((p,i)=>{if(Math.hypot(x-p[0],y-p[1])<70){if(i<SV.open){SFX.click();go('l'+(i+1))}else{SFX.bad();oops('iskorka')}}})}};
// ---------- общая рамка уровня ----------
const SECRET_POS=[[1215,250],[95,215],[1240,560],[70,330]];
const DEF={};
function levelScene(n){SC['l'+n]={enter(){if(LV&&LV.n===n&&LV.resume){LV.resume=false;cast=LV.cast;return}
  LV={n,r:0,mist:0,streak:0,done:false,banner:null,msg:null,def:DEF[n]};DEF[n].init(LV);cast=LV.cast;run(()=>DEF[n].start(LV))},
 draw(){bgDraw('l'+n,0,LV.scroll);motes([190,300,180,40,110][n-1]);if(!LV.done||T-LV.doneT<1.2)DEF[n].draw(LV);drawCast();if(DEF[n].over)DEF[n].over(LV);
  if(n<5&&!SV.secret[n-1]&&!LV.done){const[sx,sy]=SECRET_POS[n-1];gem(sx,sy,11,320,'',{alpha:.45+.35*Math.sin(T*3),glow:.8+.4*Math.sin(T*3)})}
  if(LV.banner&&n===3){const b=LV.banner;X.font='24px '+FONT;const L=wrap(b.t,200),h=L.length*30+80,y=Math.min(530-h,Math.max(70,talk&&talk.box?talk.box[1]+talk.box[3]+6:0));X.globalAlpha=ease((T-b.t0)*4);win('win_mistake',996,y,280,h);L.forEach((l,i)=>txt(l,1136,y+h/2-(L.length-1)*15+i*30,24,'#ffe0d8',{lw:4}));X.globalAlpha=1}
  else if(LV.banner){const b=LV.banner;X.font='27px '+FONT;const bad=/ffd0d0|ffb0b0/.test(b.col||'');const L=wrap(b.t,700),w=Math.max(...L.map(l=>X.measureText(l).width))+(bad?120:150),h=L.length*36+(bad?84:70),PB=placeBanner(w,h,Math.min(b.y||96,712-h)),y=PB[1],bx0=PB[0],bcx=bx0+w/2;
   X.globalAlpha=ease((T-b.t0)*4);if(bad){win('win_mistake',bx0,y,w,h);L.forEach((l,i)=>txt(l,bcx,y+h/2-(L.length-1)*18+i*36,27,'#ffe0d8',{lw:5}))}else{win('scroll_banner',bx0,y,w,h);L.forEach((l,i)=>txt(l,bcx,y+h/2-(L.length-1)*18+i*36,27,'#4a2208',{st:'rgba(255,245,215,.8)',lw:4}))}X.globalAlpha=1}},
 ui(){win('scroll_banner',470,0,340,62);txt(LNAMES[n-1],640,30,30,'#6a3410',{st:'rgba(255,245,215,.85)',lw:4});for(let i=0;i<ROUNDS[n-1];i++)gem(640-(ROUNDS[n-1]-1)*16+i*32,78,11,i<LV.r?45:250,'',{grey:i>=LV.r,glow:i<LV.r?1:0});
  btn('home',60,46,84,60,'⌂',()=>{go('map')},{always:1,hue:260,fs:36});if(!LV.done)btn('hint',1220,46,84,60,'?',()=>{if(!(talk&&/h$/.test(talk.k||'')))run(()=>DEF[n].hint(LV))},{hue:50,fs:38});
  if(LV.done)endPanel(n)},
 tap(x,y){if(LV.lock||LV.done)return;if(n<5&&!SV.secret[n-1]){const[sx,sy]=SECRET_POS[n-1];if(Math.hypot(x-sx,y-sy)<Math.max(40,30/S)){LV.resume=true;go('secret',n);return}}DEF[n].tap(LV,x,y)}}}
function banner(t,col,y){LV.banner={t,col,t0:T,y}}
async function roundDone(){LV.r++;LV.banner=null;if(LV.r>=ROUNDS[LV.n-1]){LV.done=true;LV.doneT=T;const st=LV.mist===0?3:LV.mist<=2?2:1;LV.stars=st;SV.stars[LV.n-1]=Math.max(SV.stars[LV.n-1],st);SV.open=Math.max(SV.open,Math.min(5,LV.n+1));save();cheer();const cx_=ctxNow();for(let i=0;i<3;i++)setTimeout(()=>{if(i<st&&alive(cx_)){SFX.star();burst(560+i*80,368,24,'spark',48)}},500+i*350);if(LV.n<5)await say('win');return true}return false}
function endPanel(n){const v=vis();X.fillStyle='rgba(5,2,15,.45)';X.fillRect(v.x0,v.y0,v.w,v.h);win('win_victory',350,110,580,420);txt(n<5?'Пещера пройдена!':'Тролль побеждён!',640,275,34,'#8a4a08',{st:'rgba(255,246,220,.9)',lw:5});
 for(let i=0;i<3;i++){const k=ease((T-LV.doneT-.5-i*.35)*3);if(k>0)star(560+i*80,368,30,i<LV.stars,.4+.6*k+Math.sin(T*4+i)*.03);else star(560+i*80,368,30,false)}
 txt(LV.mist===0?'Без единой ошибки!':'Ошибок: '+LV.mist,640,438,28,'#5a2e0c',{st:'rgba(255,246,220,.9)',lw:4});
 btn('map',525,575,200,70,'Карта',()=>go('map'),{always:1,hue:260});
 if(n<5)btn('next',760,575,220,70,'Дальше ›',()=>go('l'+(n+1)),{always:1,hue:130,pulse:1});else btn('fin',760,575,220,70,'Финал ›',()=>go('fin'),{always:1,hue:130,pulse:1})}
// ---------- УРОВЕНЬ 1: кодовый замок (перебор) ----------
function perms(ds,len,rep){const out=[];(function rec(p){if(p.length===len){out.push(p.join(''));return}for(const d of ds){if(!rep&&p.includes(d))continue;rec(p.concat(d))}})([]);return out}
const R1=[{ds:[1,2,3],len:3,rep:false,k:'l1i',dk:'l1d0'},{ds:[1,2,3],len:2,rep:true,k:'l1q1',dk:'l1d1'},{ds:[1,2,3,4],len:2,rep:false,k:'l1q2',dk:'l1d2',quiz:[7,12,16]}];
DEF[1]={init(L){L.cast=[{n:'shester',x:100,y:735,h:320},{n:'iskorka',x:228,y:745,h:265}];setR1(L)},
 async start(L){await say(R1[0].k)},
 draw(L){const R=L.R;panel(290,105,350,500);txt('Замок '+(L.r+1),465,160,40,'#ffe9a8');
  const n=R.len,sw=106;for(let i=0;i<n;i++){const x=465-(n-1)*sw/2+i*sw,y=225;const ew=L.err&&T-L.err<.5?Math.sin(T*60)*4:0;dimg('tile',x-50+ew,y-52,100,100);
   const d=R.quiz?'?':L.cur[i];if(d!=null)txt(String(d),x,y-2,80,R.quiz?'#c8e0f0':'#fff3c0',{st:'#2a1406',lw:9})}
  if(!R.quiz)txt('Найдено: '+L.found.length+' из '+L.all.length,465,318,40,'#fff',{st:'#2a1406',lw:7});
  if(L.msg){X.font='22px '+BODY;X.font='22px '+FONT;const ml=wrap(L.msg.t,270);ml.forEach((l,i)=>txt(l,465,(R.quiz?296:525)+i*26-(R.quiz?0:(ml.length-1)*13),22,L.msg.col,{lw:4}))}
  // дерево вариантов
  const tr=L.tree;const grow=R.quiz?(L.qDone?ease((T-L.qDone)*.8):0):1;
  if(!R.quiz||L.qDone){X.lineCap='round';for(const nd of tr.nodes){if(!nd.par)continue;const lit=L.found.some(c=>c.startsWith(nd.code))||L.qDone;const a=R.quiz?clamp(grow*R.len-nd.d+1,0,1):1;if(a<=0)continue;
    X.globalAlpha=a;vine(bezPts({x:nd.par.x+14,y:nd.par.y},{x:nd.x-12,y:nd.y},14),lit?5:3,lit);X.globalAlpha=1}
   for(const nd of tr.nodes){const a=R.quiz?clamp(grow*R.len-nd.d+1,0,1):1;if(a<=0)continue;const lit=nd.d===0||L.found.some(c=>c.startsWith(nd.code))||L.qDone;const hl=L.hint&&L.hint.startsWith(nd.code)&&nd.d>0&&T-L.hintT<6;
    if(nd.d===0){gem(nd.x,nd.y,22,45,'',{alpha:a});lock(nd.x,nd.y+2);continue}
    gem(nd.x,nd.y,nd.leaf?13:24,lit?48:250,nd.leaf?'':nd.code.slice(-1),{grey:!lit&&!hl,alpha:a*(lit||hl?1:.8),glow:lit?1:hl?1.5:0,sc:hl?1+.15*Math.sin(T*8):1,fs:42});
    if(nd.leaf)txt(nd.code,nd.x+20,nd.y+1,42,lit?'#fff3b0':hl?'#7ff6ff':'#9a90b8',{al:'left',f:FONT,lw:6,st:'#1a0c04'})}}
  else{txt('?',920,360,160,'rgba(255,255,255,.25)',{f:FONT})}},
 over(L){const R=L.R;if(L.done)return;if(R.quiz&&!L.qDone){R.quiz.forEach((v,i)=>btn('q'+v,465,370+i*74,150,64,String(v),()=>quiz1(L,v),{hue:200+i*40,fs:52,dis:!!(L.qTried&&L.qTried[v])}))}
  else if(!R.quiz){R.ds.forEach((d,i)=>{const x=465-(R.ds.length-1)*43+i*86;btn('d'+d,x,398,80,80,String(d),()=>dig1(L,d),{hue:185,fs:70})});btn('del',465,478,150,52,'Стереть',()=>{L.cur.pop()},{hue:0,fs:26})}},
 tap(L,x,y){const R=L.R;if(R.quiz)return;const n=R.len,sw=106;for(let i=0;i<L.cur.length;i++){const tx=465-(n-1)*sw/2+i*sw;if(Math.abs(x-tx)<53&&Math.abs(y-225)<55){L.cur=L.cur.slice(0,i);SFX.tick();return}}},
 async hint(L){if(L.R.quiz){await say('l1w2');return}L.hint=L.all.find(c=>!L.found.includes(c));L.hintT=T;await say('l1h')},
 wrong(L){const R=L.R;if(R.quiz){quiz1(L,R.quiz[0]);return}const ws=R.rep?(L.found[0]||null):String(R.ds[0]).repeat(2)+R.ds[1];
  if(R.rep&&!ws){const c=L.all[0];run(async()=>{await check1(L,c);await check1(L,c)});return}String(ws).slice(0,R.len).split('').forEach(d=>dig1(L,+d))},
 info(L){return{r:L.r,quiz:!!L.R.quiz,missing:L.all.filter(c=>!L.found.includes(c)),total:L.all.length,ans:L.R.quiz?L.all.length:null}}};
function setR1(L){const R=R1[L.r];L.R=R;L.cur=[];L.found=[];L.msg=null;L.qDone=0;L.hint=null;L.all=perms(R.ds,R.len,R.rep);
 const nodes=[],leaves=L.all.length,x0=690,x1=1150,y0=150,y1=600;const root={code:'',d:0,x:x0,y:(y0+y1)/2};nodes.push(root);
 L.all.forEach((c,i)=>{let par=root;for(let d=1;d<=R.len;d++){const code=c.slice(0,d);let nd=nodes.find(z=>z.code===code);if(!nd){nd={code,d,par,leaf:d===R.len,x:x0+(x1-x0)*d/R.len-(d===R.len?40:0),ys:[]};nodes.push(nd)}nd.ys.push(y0+(y1-y0)*(leaves===1?.5:i/(leaves-1)));par=nd}});
 nodes.forEach(n=>{if(n.ys)n.y=n.ys.reduce((a,b)=>a+b,0)/n.ys.length});L.tree={nodes}}
function dig1(L,d){if(L.lock||L.done)return;const R=L.R;if(L.cur.length>=R.len)return;if(!L.cur.length){L.msg=null;L.banner=null}L.cur.push(d);SFX.tick();if(L.cur.length===R.len){const c=L.cur.join('');run(async()=>{await wait(250);await check1(L,c)})}}
async function check1(L,c){const R=L.R;L.cur=[];
 if(!R.rep&&new Set(c).size<c.length){L.mist++;L.err=T;SFX.bad();shake=6;oops('shester');const d=[...c].find((x,i)=>c.indexOf(x)!==i);L.msg={t:'В коде '+c+' цифра '+d+' повторяется — так нельзя!',col:'#ffb0b0'};stopTalk();await say('l1rep');return}
 if(L.found.includes(c)){L.mist++;L.err=T;SFX.bad();oops('shester');L.msg={t:'Код '+c+' уже найден. Ищи новый!',col:'#ffb0b0'};stopTalk();await say('l1dup');return}
 L.found.push(c);SFX.ok();L.msg={t:'Новый код '+c+'!',col:'#b0ffc8'};const nd=L.tree.nodes.find(z=>z.code===c);burst(nd.x,nd.y,22,'spark',48);
 if(L.found.length===L.all.length){L.lock=true;cheer();shake=8;burst(465,225,40,'shard',48);await say(R.dk);if(!await roundDone()){setR1(L);L.lock=false;await say(L.R.k)}}}
function quiz1(L,v){if(L.lock||L.done||(L.qTried&&L.qTried[v]))return;run(async()=>{if(v!==L.all.length){L.mist++;SFX.bad();shake=5;oops('iskorka');(L.qTried=L.qTried||{})[v]=1;L.msg={t:v+' — не так. 4 способа для первой цифры и 3 для второй.',col:'#ffb0b0'};stopTalk();await say('l1w2');return}
 L.lock=true;L.qDone=T;L.found=L.all.slice();SFX.ok();cheer();L.msg={t:'4 × 3 = 12',col:'#b0ffc8'};await say(L.R.dk);await wait(600);await roundDone()})}
levelScene(1);
// ---------- УРОВЕНЬ 2: раскол кристаллов ----------
const EASY2=[9,7,15,11,21,13,25,17];
DEF[2]={init(L){L.cast=[{n:'granit',x:290,y:735,h:440},{n:'iskorka',x:105,y:735,h:300}];L.used=[];L.lastWrong=false;L.gallery=[];next2(L)},
 async start(L){await say('l2i')},
 draw(L){const gx=720,gy=360;
  if(L.pieces){const k=ease((T-L.pieces.t0)*2.2);const[p,q]=L.pieces.f;gem(gx-170*k,gy+30*k,62,L.hue,p,{rot:-.3*k,glow:1});gem(gx+170*k,gy+30*k,62,L.hue+30,q,{rot:.3*k,glow:1});
   if(k>.6)txt(L.num+' = '+p+' × '+q,gx,gy+150,60,'#fff3b0',{st:'#1a0c04',lw:9})}
  else{const wob=L.wob&&T-L.wob<.6?Math.sin((T-L.wob)*40)*.1*(1-(T-L.wob)/.6):0;const fl=L.flash&&T-L.flash<.8?1.8:1;gem(gx,gy+Math.sin(T*1.8)*6,96,L.hue,L.num,{rot:wob,glow:fl,fs:84})}
  // кирка
  if(L.axe!=null){const t=T-L.axe;let a=t<.35?-1.2+ease(t/.35)*1.6:L.prime?.4-Math.sin(clamp((t-.35)*6,0,3.14))*.9:.4;X.save();X.translate(900,260);X.rotate(a);
   X.rotate(-.65);dimg('pickaxe',-60,-35,200,210);X.restore()}
  L.gallery.forEach((g,i)=>gem(470+i*62,630,24,g.p?48:200,g.n,{fs:34,glow:g.p?1:.3}))},
 over(L){if(L.phase==='ask'&&!L.done){btn('prime',560,560,240,74,'Простое',()=>ans2(L,true),{hue:45,fs:38});btn('comp',880,560,260,74,'Составное',()=>ans2(L,false),{hue:205,fs:38})}},
 tap(){},
 async hint(L){await say('l2h')},
 wrong(L){ans2(L,!isP(L.num))},
 info(L){return{r:L.r,n:L.num,prime:isP(L.num)}}};
function next2(L){const hard=POOL.filter(x=>!EASY2.includes(x));let src=(L.streak>=2&&!L.lastWrong)||L.r>=4?hard:EASY2;let c=src.filter(x=>!L.used.includes(x));if(!c.length)c=POOL.filter(x=>!L.used.includes(x));
 const lastP=L.used.length?isP(L.used[L.used.length-1]):null;const alt=c.filter(x=>isP(x)!==lastP);if(alt.length&&Math.random()<.65)c=alt;
 L.num=c[Math.floor(Math.random()*c.length)];L.used.push(L.num);L.hue=[190,280,320,160,40][L.used.length%5];L.phase='ask';L.pieces=null;L.axe=null;L.banner=null}
function ans2(L,guess){if(L.lock||L.done||L.phase!=='ask')return;const pr=isP(L.num);L.banner=null;run(async()=>{
 if(guess!==pr){L.mist++;L.streak=0;L.lastWrong=true;SFX.bad();L.wob=T;oops('granit');banner('Не так! '+expl(L.num),'#ffd0d0');stopTalk();await say('l2w');await say('n'+L.num);return}
 L.streak++;L.lastWrong=false;L.phase='anim';L.axe=T;oops('granit');await wait(350);
 if(pr){SFX.clang();L.flash=T;burst(760,300,30,'spark',50);shake=6}else{SFX.shatter();shake=18;burst(720,360,46,'shard',L.hue);const f=fac(L.num);L.pieces={t0:T,f:[f[0],L.num/f[0]]}}
 SFX.ok();banner(expl(L.num),'#e8fff0');await wait(500);await say('n'+L.num);await wait(500);L.gallery.push({n:L.num,p:pr});
 if(!await roundDone())next2(L)})}
levelScene(2);
// ---------- УРОВЕНЬ 3: решето Эратосфена ----------
const STEPS3=[1,2,3,5,7],SK3=['l3s1','l3s2','l3s3','l3s5','l3s7'],CX3=100,CY3=112,CW3=86,CH3=108,N3=50;
function cell3(n){const i=n-1;return{x:CX3+(i%10)*CW3+CW3/2,y:CY3+Math.floor(i/10)*CH3+CH3/2}}
DEF[3]={init(L){L.cast=[{n:'iskorka',x:1062,y:760,h:225,flip:1},{n:'granit',x:1212,y:765,h:245,flip:1}];L.st=new Array(101).fill(0);L.wt={};L.bad={};L.cnt=0},
 async start(L){await say('l3i');await say(SK3[0])},
 draw(L){win('frame',CX3-32,CY3-28,CW3*10+64,CH3*5+56);
  for(let n=1;n<=N3;n++){const{x,y}=cell3(n),s=L.st[n];const hl=L.hintN===n&&T-L.hintT<5;
   if(s!==2){const sh=L.bad[n]&&T-L.bad[n]<.6?Math.sin(T*60)*3:0;if(s===3){const k=clamp((T-(L.wt[n]||0))*2.5,0,1);dimg('tile',x-CW3/2+sh,y-CH3/2-1,CW3,CH3+2);X.save();X.globalAlpha=k;dimg('tile_water',x-CW3/2,y-CH3/2-1,CW3,CH3+2);X.restore()}else dimg('tile',x-CW3/2+sh,y-CH3/2-1,CW3,CH3+2,{grey:s===1})}
   if(s===2){gem(x,y,40,[45,190,300,150,20][n%5],n,{fs:70,glow:1.1});continue}
   let a=1,col='#4a2c12',dy=0;if(s===3){const k=clamp((T-(L.wt[n]||0))*2.5,0,1);a=1-.45*k;dy=k*2;col='#2a6c90'}if(s===1)col='#777';
   if(L.bad[n]&&T-L.bad[n]<.6){col='#d02020';x+Math.sin(T*50)*3}
   X.globalAlpha=s===3?a+.15:1;const bd=L.bad[n]&&T-L.bad[n]<.6;txt(String(n),x+(bd?Math.sin(T*60)*3:0),y+dy,68,hl?'#fff6b0':bd?'#ff9a9a':s===3?'#d8f4ff':s===1?'#b8b8c0':'#fff1d0',{st:hl?'#a05a00':s===3?'#0a3a5a':'#2a1406',lw:hl?10:9});X.globalAlpha=1}
  if(L.wash){win('scroll_banner',996,430,280,92);txt('Смываем кратные '+L.wash,1136,476,24,'#0a3a5a',{st:'rgba(230,250,255,.85)',lw:4})}
  if(L.cnt&&!L.wash){win('sign',996,440,280,80);txt('Простых чисел: '+L.cnt,1136,480,30,'#fff3b0',{st:'#2a1406',lw:5})}},
 tap(L,x,y){const c=Math.floor((x-CX3)/CW3),r=Math.floor((y-CY3)/CH3);if(c<0||c>9||r<0||r>4)return;tap3(L,r*10+c+1)},
 async hint(L){L.hintN=STEPS3[L.r];L.hintT=T;await say(SK3[L.r])},
 wrong(L){tap3(L,4)},
 info(L){return{r:L.r,expect:STEPS3[L.r],primes:L.st.filter(s=>s===2).length}}};
G.cellXY=n=>cell3(n);
function tap3(L,n){if(L.lock||L.done)return;const ex=STEPS3[L.r];L.banner=null;run(async()=>{
 if(n!==ex){L.mist++;L.bad[n]=T;SFX.bad();oops('iskorka');const s=L.st[n],f=fac(n);let m;
  if(ex===1)m='Сначала нажми на число 1.';else if(s===3)m=n+' уже смыто: '+n+' = '+f[0]+' × '+(n/f[0])+'.';else if(s===2)m=n+' уже обведено — оно простое.';else if(n===1)m='1 — ни простое, ни составное.';
  else if(!isP(n))m=n+' = '+f[0]+' × '+(n/f[0])+' — составное, его смоет вода.';else m=n+' простое, но сначала самое маленькое: '+ex+'.';
  banner(m,'#ffd0d0',600);stopTalk();await say('l3w');return}
 L.lock=true;L.banner=null;SFX.ok();const{x,y}=cell3(n);burst(x,y,26,'spark',50);
 if(n===1){L.st[1]=1;await say('l3one')}else{L.st[n]=2;L.wash=n;await wait(300);let i=0;
  for(let m=2*n;m<=N3;m+=n){if(L.st[m]===0){L.st[m]=3;L.wt[m]=T;const c=cell3(m);drops(c.x,c.y,7);if(i++%3===0)SFX.splash();await wait(G.fast?0:80)}}
  shake=4;await wait(400);L.wash=0}
 const done=L.r===STEPS3.length-1;
 if(done){for(let m=2;m<=N3;m++){if(L.st[m]===0){L.st[m]=2;const c=cell3(m);burst(c.x,c.y,8,'spark',48);SFX.tick();await wait(G.fast?0:90)}L.cnt=L.st.filter(s=>s===2).length}cheer();SFX.star();await say('l3d');await roundDone()}
 else{await roundDone();L.lock=false;await say(SK3[L.r])}})}
levelScene(3);
// ---------- УРОВЕНЬ 4: вагонетка ----------
const PR4=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97],CO4=[9,15,21,25,27,33,35,39,49,51,57,91];
function bez(t,y){const a=[600,560],c=[820,560],b=[1170,y];const u=1-t;return{x:u*u*a[0]+2*u*t*c[0]+t*t*b[0],y:u*u*a[1]+2*u*t*c[1]+t*t*b[1]}}
DEF[4]={init(L){L.cast=[{n:'shester',x:90,y:740,h:250},{n:'iskorka',x:250,y:712,h:210}];L.tl=9;L.scroll=0;L.usedP=[];L.usedC=[];setF4(L)},
 async start(L){L.phase='wait';await say('l4i');if(L.phase==='wait'&&L.sel==null&&!L.opts.some(o=>o.tried)){L.phase='go';L.t0=T}},
 draw(L){const moving=L.phase==='go'||L.phase==='ride'||L.phase==='back';
  if(L.phase==='go'){const k=(T-L.t0)/L.tl;L.cx=140+460*Math.min(1,k);if(k>=1){L.phase='wait';run(async()=>{SFX.bad();await say('l4slow');await say('l4h')});L.tl=Math.min(14,L.tl+2)}}
  if(moving)L.scroll+=DT*(L.phase==='go'?460/L.tl:300);
  // рельсы
  const rail=(pts,on)=>railPainted(pts,on,0);
  railPainted([{x:-60,y:560},{x:600,y:560}],false,-L.scroll);
  L.opts.forEach((o,i)=>{const pts=[];for(let t=0;t<=1.001;t+=.05)pts.push(bez(t,o.y));rail(pts,L.sel===i);const e=bez(1,o.y);X.save();X.translate(e.x,e.y);X.rotate(Math.PI/2);dimg('plank',-34,-9,68,18);X.restore();
   const g=bez(.82,o.y);o.gx=g.x;o.gy=g.y-72;const bad=o.dead&&T-o.dead<3;if(bad)gem(o.gx,o.gy,54,0,o.n,{fs:70,crack:1,glow:0});else gem(o.gx,o.gy,54,o.hue,o.n,{fs:72,glow:1.1,grey:o.tried})});
  // вагонетка
  let p={x:L.cx,y:560},ang=0;if(L.ride!=null){const t=L.ride;p=bez(t,L.opts[L.sel].y);const q=bez(Math.min(1,t+.02),L.opts[L.sel].y);ang=Math.atan2(q.y-p.y,q.x-p.x)}
  cart(p.x,p.y,ang,L.scroll)},
 tap(L,x,y){if(L.done||!(L.phase==='go'||L.phase==='wait'))return;L.opts.forEach((o,i)=>{if(!o.tried&&Math.hypot(x-o.gx,y-o.gy)<62)pick4(L,i)})},
 async hint(L){L.opts.forEach(o=>{});await say('l4h')},
 wrong(L){const i=L.opts.findIndex(o=>!o.prime&&!o.tried);if(i>=0)pick4(L,i)},
 info(L){return{r:L.r,phase:L.phase,opts:L.opts.map(o=>({n:o.n,prime:o.prime,x:o.gx,y:o.gy,tried:!!o.tried}))}}};
function setF4(L){const k=L.r<3?2:3;const smallP=L.tl>10||L.r<2;let pc=PR4.filter(p=>(smallP?p<=31:p>=11)&&!L.usedP.includes(p));const p=pc[Math.floor(Math.random()*pc.length)];L.usedP.push(p);
 let cc=shuffle(CO4.filter(c=>!L.usedC.includes(c))).slice(0,k-1);if(cc.length<k-1)cc=shuffle(CO4.slice()).slice(0,k-1);L.usedC.push(...cc);
 const ns=shuffle([p,...cc]);const ys=k===2?[400,660]:[300,470,665];L.opts=ns.map((n,i)=>({n,prime:isP(n),y:ys[i],hue:[190,300,45][i]}));L.sel=null;L.ride=null;L.cx=140;L.phase='go';L.t0=T}
function pick4(L,i){if(L.lock||L.done)return;const o=L.opts[i];L.sel=i;L.banner=null;const prev=L.phase;L.phase='ride';run(async()=>{
 const dur=G.fast?.05:.9;let t0=T;const to=o.prime?1:.78;while(T-t0<dur){L.ride=ease((T-t0)/dur)*to;await new Promise(r=>requestAnimationFrame(r))}L.ride=to;
 if(o.prime){L.lock=true;SFX.ok();burst(bez(1,o.y).x-60,o.y-60,40,'spark',48);cheer();L.streak++;if(L.streak>=2)L.tl=Math.max(5,L.tl-1.2);await say('l4ok');fade=.9;if(!await roundDone()){await wait(200);setF4(L);L.lock=false}else L.phase='end'}
 else{L.mist++;L.streak=0;L.tl=Math.min(14,L.tl+2);o.dead=T;o.tried=1;SFX.hit();shake=16;burst(bez(.78,o.y).x+40,o.y,26,'shard',20);oops('granit');banner('Тупик! '+expl(o.n),'#ffd0d0',90);stopTalk();say('l4w').then(()=>LINES['n'+o.n]&&say('n'+o.n)).catch(()=>{});
  const bd=G.fast?.05:.3;t0=T;while(T-t0<bd){L.ride=to*(1-ease((T-t0)/bd));await new Promise(r=>requestAnimationFrame(r))}L.ride=null;L.sel=null;L.cx=600;L.phase='wait'}})}
levelScene(4);
// ---------- УРОВЕНЬ 5: босс — дерево множителей ----------
DEF[5]={init(L){L.cast=[{n:'granit',x:95,y:735,h:300},{n:'iskorka',x:250,y:740,h:270},{n:'troll',x:1125,y:745,h:550,flip:1}];L.hearts=3;L.nums=[12,30,84];setB(L)},
 async start(L){say('l5i').catch(()=>{});await smash(L)},
 draw(L){for(let i=0;i<3;i++){X.save();X.translate(1030+i*48,140);X.scale(1+(i===L.hearts&&T-(L.hitT||0)<.6?.5:0),1);heart(i<L.hearts);X.restore()}
  const rbk=L.rebuild?Math.max(0,1-(T-L.rebuild)*2.5):1;// при сборке ответа старое дерево гаснет — не висят числа
  if(rbk>0){X.save();X.globalAlpha*=rbk;for(const nd of L.nodes){if(nd.par)vine([{x:nd.par.x,y:nd.par.y+40},{x:nd.x,y:nd.y-40}],6,true)}
  for(const nd of L.nodes){const k=ease((T-nd.t0)*3);if(L.rebuild&&nd.prime)continue;const cur=nd===L.cur;
   gem(nd.x,nd.y,nd.d===0?62:48,nd.prime?48:cur?280:250,nd.v,{sc:.3+.7*k,crack:!nd.prime&&nd.split?1:0,glow:nd.prime?1.3:cur?1+.3*Math.sin(T*6):.4,grey:nd.split&&!nd.prime,alpha:nd.split&&!nd.prime?.6:1,fs:nd.d===0?70:56,rot:cur&&L.wob&&T-L.wob<.5?Math.sin((T-L.wob)*40)*.1:0})}X.restore()}
  if(L.rebuild){const ps=L.nodes.filter(n=>n.prime);const k=ease((T-L.rebuild)*1.5);const n=ps.length,x0=510-(n-1)*55;// ряд ответа — над полем, где он не уходит под тролля и героев
   ps.forEach((p,i)=>{const tx=x0+i*110,ty=215;gem(p.x+(tx-p.x)*k,p.y+(ty-p.y)*k,44,48,p.v,{fs:56,glow:1.3});if(i&&k>.9)txt('×',tx-55,ty,60,'#fff',{st:'#1a0c04',lw:8})});
   if(k>.95)txt('= '+L.N,x0+(n-1)*110+62,215,66,'#fff3b0',{al:'left',st:'#1a0c04',lw:9})}},
 over(L){if(L.done||!L.cur)return;[2,3,5,7].forEach((p,i)=>btn('p'+p,440+i*110,650,90,70,String(p),()=>pickB(L,p),{hue:[45,190,300,150][i],fs:70}))},
 tap(){},
 async hint(L){await say('l5h')},
 wrong(L){if(!L.cur)return;const p=[2,3,5,7].find(p=>L.cur.v%p!==0);pickB(L,p)},
 info(L){return{r:L.r,v:L.cur?L.cur.v:null,N:L.N}}};
function setB(L){L.N=L.nums[L.r];const root={v:L.N,d:0,x:560,y:150,t0:T,prime:false};L.nodes=[root];L.cur=null;L.rebuild=0}
async function smash(L){swing('troll');mood('troll','laugh');await wait(380);shake=22;SFX.hit();burst(560,150,30,'shard',280);L.cur=L.nodes[0];await say('b'+L.N)}
function pickB(L,p){if(L.lock||L.done||!L.cur)return;L.banner=null;run(async()=>{const nd=L.cur,v=nd.v;
 if(v%p!==0){L.mist++;L.wob=T;SFX.bad();oops('iskorka');banner(v+' не делится на '+p+' нацело'+(p===2?' — оно нечётное.':p===5?' — оно не оканчивается на 0 или 5.':'.'),'#ffd0d0',470);mood('troll','laugh');stopTalk();await say('l5no');return}
 L.banner=null;SFX.shatter();shake=8;burst(nd.x,nd.y,24,'shard',280);nd.split=true;const q=v/p;
 const a={v:p,d:nd.d+1,x:nd.x-85,y:nd.y+105,t0:T,prime:true,par:nd},b={v:q,d:nd.d+1,x:nd.x+85,y:nd.y+105,t0:T,prime:isP(q),par:nd};L.nodes.push(a,b);
 if(!b.prime){L.cur=b;return}
 L.lock=true;L.cur=null;await wait(700);L.rebuild=T;SFX.star();await wait(1100);burst(640,560,40,'spark',48);cheer();await say('b'+L.N+'d');
 const tr=L.cast[2];L.hearts--;L.hitT=T;tr.hit=T;mood('troll','angry');shake=20;SFX.hit();
 const last=L.r===2;if(!last)await say('l5hit');else await say('l5end');
 if(L.r===1&&L.mist>2)L.nums[2]=18;
 if(!await roundDone()){setB(L);await wait(300);L.lock=false;await smash(L)}})}
levelScene(5);
// ---------- тайные комнаты ----------
const SECRETS=[{k:'s1',q:'Сколько трёхзначных кодов из цифр 5 и 7, если цифры можно повторять?',o:['6','8','9'],a:1,why:'2 × 2 × 2 = 8: каждую из трёх цифр выбираем двумя способами.'},
 {k:'s2',q:'Какое из этих чисел простое?',o:['51','57','59'],a:2,why:'51 = 3 × 17 и 57 = 3 × 19 — составные. А 59 делится только на 1 и на 59.'},
 {k:'s3',q:'Простые близнецы отличаются на 2. Найди пару близнецов!',o:['11 и 13','13 и 15','23 и 25'],a:0,why:'15 = 3 × 5 и 25 = 5 × 5 — составные. А 11 и 13 — оба простые.'},
 {k:'s4',q:'Какое единственное чётное простое число?',o:['2','4','6'],a:0,why:'Все остальные чётные числа делятся на 2: 4 = 2 × 2, 6 = 2 × 3.'}];
let SEC=null;
SC.secret={enter(n){SEC={n,i:n-1,why:null};cast=[{n:'shester',x:140,y:735,h:330}];run(async()=>{await say('sec');await say(SECRETS[n-1].k)})},
 draw(){bgDraw('l'+SEC.n,.55);motes(320);const s=SECRETS[SEC.i];panel(270,60,740,470);txt('Тайная комната',640,140,44,'#ffd6f5');
  X.font='28px '+FONT;wrap(s.q,560).forEach((l,i)=>txt(l,640,200+i*36,28,'#fff'));
  if(SEC.why){X.font='23px '+FONT;wrap(SEC.why,560).forEach((l,i)=>txt(l,640,410+i*29,23,SEC.ok?'#b0ffc8':'#ffd0d0',{lw:4}))}
  if(SEC.ok)gem(640,330,60,320,'★',{sc:1+.1*Math.sin(T*5),glow:1.6,fs:50});drawCast()},
 ui(){const s=SECRETS[SEC.i];if(!SEC.ok)s.o.forEach((o,i)=>btn('o'+i,440+i*200,330,170,124,o,()=>ansS(i),{hue:[190,300,45][i],fs:o.length>3?32:76}));
  btn('back',1180,50,170,60,'‹ Назад',()=>go('l'+SEC.n),{always:1,hue:260,fs:28})}};
function ansS(i){if(SEC.lock)return;const s=SECRETS[SEC.i];run(async()=>{if(i!==s.a){SFX.bad();oops('shester');SEC.why=s.why;sayNow('secw');return}
 SEC.lock=1;SEC.ok=1;SEC.why=s.why;SV.secret[SEC.i]=1;save();SFX.star();burst(640,330,50,'spark',320);burst(640,330,30,'shard',320);cheer();await say('secok');await wait(600);go('l'+SEC.n)})}
// ---------- финал ----------
SC.fin={enter(){cast=[{n:'granit',x:230,y:730,h:410},{n:'iskorka',x:450,y:730,h:380},{n:'shester',x:640,y:730,h:390},{n:'troll',x:1135,y:750,h:400,flip:1}];
 run(async()=>{cheer();await say('fin');await say('l5end')})},
 draw(){bgDraw('title',.1);motes(48);if(Math.random()<.2)burst(rnd(100,1180),rnd(80,300),10,Math.random()<.5?'spark':'shard',rnd(0,360),.6);if(Math.random()<.01)cheer();
  win('scroll_banner',330,40,620,140);txt('Пещера спасена!',640,110,70,'#7a3a0a',{st:'rgba(255,245,215,.9)',lw:6});const st=SV.stars.reduce((a,b)=>a+b,0);for(let i=0;i<5;i++)star(520+i*60,205,22,true);win('sign',330,232,620,66);txt('Звёзд: '+st+' из 15 · редких кристаллов: '+SV.secret.reduce((a,b)=>a+b,0)+' из 4',640,266,26,'#ffe9b8',{st:'#2a1406',lw:4});drawCast()},
 ui(){btn('map',1150,60,160,60,'Карта',()=>go('map'),{always:1,hue:260,fs:28})}};
// ---------- API для тестов ----------
G.info=()=>LV&&scene[0]==='l'?LV.def.info(LV):scene==='secret'?{r:0,sec:SEC.i,a:SECRETS[SEC.i].a}:{};
G.wrong=()=>{if(scene==='secret'){const s=SECRETS[SEC.i];ansS((s.a+1)%3)}else if(LV)LV.def.wrong(LV)};
G.secretXY=()=>{const p=SECRET_POS[LV.n-1];return{x:p[0],y:p[1]}};
G.LV=()=>LV;G.cast=()=>cast;G.T=()=>T;G.setTalk=(who,t)=>{talk=who?{who,text:t,t0:T}:null};
