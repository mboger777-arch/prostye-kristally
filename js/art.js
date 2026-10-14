'use strict';
// ===== Рисованная графика: всё из нарисованных спрайтов (окна 9-slice, кнопки, самоцветы, частицы, головы-виземы) =====
const UA={};function ua(n){const i=new Image();i.src='assets/ui/'+n+'.png';UA[n]=i;return i}
['btn_purple','btn_teal','btn_round','scroll_banner','star','sign','frame','logo','win_dialog','win_hint','win_victory','win_mistake','bubble','node',
 'gem_purple','gem_teal','gem_amber','gem_broken','cart','pickaxe','heart','heart_grey','tile','tile_water','lock','plank','tex_gold','tex_steel'].forEach(ua);
const SHARDS=[],SPL=[];for(let i=0;i<15;i++)SHARDS.push(ua('p_shards'+i));for(let i=0;i<7;i++)SPL.push(ua('p_splash'+i));
const VIS={};['granit','iskorka','shester','troll'].forEach(w=>{VIS[w]=(w==='troll'?[0,1,2,3,4,5,6]:[0,1,2,3,4,5]).map(i=>ua('v_'+w+i))});
const BODY2={shester:ua('../sprites/shester_body')};
const HF={"granit": [0.3241, -0.0196, 0.6213, 0.4439], "iskorka": [0.0786, 0.146, 0.6717, 0.4247], "shester": [-0.0409, -0.0826, 0.8664, 0.6534], "troll": [0.4677, -0.0177, 0.3096, 0.4668]};
const okI=i=>i&&i.complete&&i.naturalWidth>0;
// серые варианты (заблокировано/не горит) — из той же картинки
const GREY={};function grey(n){if(GREY[n])return GREY[n];const i=UA[n];if(!okI(i))return null;const c=document.createElement('canvas');c.width=i.naturalWidth;c.height=i.naturalHeight;const g=c.getContext('2d');g.drawImage(i,0,0);
 const d=g.getImageData(0,0,c.width,c.height),p=d.data;for(let k=0;k<p.length;k+=4){const l=(p[k]*.3+p[k+1]*.55+p[k+2]*.15)*.62+18;p[k]=l*.92;p[k+1]=l*.9;p[k+2]=l*1.08}g.putImageData(d,0,0);return GREY[n]=c}
function dimg(n,x,y,w,h,o){o=o||{};const i=o.grey?grey(n):UA[n];if(!i||(i.complete===false)||(i.naturalWidth===0))return;X.drawImage(i,x,y,w,h)}
// 9-slice: l,t,r,b — доли исходника; углы масштабируются одинаково, середина тянется
function nine(n,x,y,w,h,l,t,r,b,flip,cap){const i=UA[n];if(!okI(i))return;const iw=i.naturalWidth,ih=i.naturalHeight;const k=Math.min(w/iw,h/ih,cap||1.6);
 const sx=[0,l*iw,iw-r*iw,iw],sy=[0,t*ih,ih-b*ih,ih],dx=[0,l*iw*k,w-r*iw*k,w],dy=[0,t*ih*k,h-b*ih*k,h];
 X.save();X.translate(x,y);if(flip){X.translate(w,0);X.scale(-1,1)}
 for(let a=0;a<3;a++)for(let c=0;c<3;c++){const sw=sx[c+1]-sx[c],sh=sy[a+1]-sy[a],ddw=dx[c+1]-dx[c],ddh=dy[a+1]-dy[a];if(sw>0&&sh>0&&ddw>0&&ddh>0)X.drawImage(i,sx[c],sy[a],sw,sh,dx[c]-.5,dy[a]-.5,ddw+1,ddh+1)}
 X.restore()}
const SL={win_dialog:[.24,.3,.24,.3],win_mistake:[.2,.27,.2,.27],win_victory:[.27,.5,.27,.2],win_hint:[.2,.12,.2,.36],bubble:[.26,.3,.26,.4],frame:[.16,.25,.16,.25,.75],
 btn_purple:[.12,.3,.12,.3],btn_teal:[.12,.3,.12,.3],scroll_banner:[.2,.22,.2,.22],sign:[.16,.3,.16,.3]};
function win(n,x,y,w,h,flip){const s=SL[n];nine(n,x,y,w,h,s[0],s[1],s[2],s[3],flip,s[4])}
// ---- текст: сказочный шрифт, обводка, тень, градиент ----
function hx(c){if(typeof c!=='string'||c[0]!=='#')return null;if(c.length===4)c='#'+c[1]+c[1]+c[2]+c[2]+c[3]+c[3];return[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)]}
function mix(a,b,k){return`rgb(${a.map((v,i)=>Math.round(v+(b[i]-v)*k)).join(',')})`}
function txt(t,x,y,size,col,o){o=o||{};t=String(t);X.font=size+'px '+FONT;X.textAlign=o.al||'center';X.textBaseline='middle';X.lineJoin='round';
 const c=hx(col||'#fff');X.save();
 if(o.st!==0){X.shadowColor='rgba(0,0,0,.55)';X.shadowBlur=size*.18;X.shadowOffsetY=size*.06;X.lineWidth=o.lw||Math.max(3,size*.17);X.strokeStyle=o.st||'#2a1240';X.strokeText(t,x,y);X.shadowColor='transparent'}
 if(c){const g=X.createLinearGradient(0,y-size*.5,0,y+size*.45);g.addColorStop(0,mix(c,[255,255,255],.65));g.addColorStop(.5,mix(c,[255,255,255],.1));g.addColorStop(1,mix(c,[40,20,0],.25));X.fillStyle=g}else X.fillStyle=col;
 X.fillText(t,x,y);X.restore()}
// ---- окна ----
function panel(x,y,w,h,a,kind){win(kind||'win_dialog',x,y,w,h)}
// ---- самоцветы с выгравированными числами ----
function gemName(h){h=((h%360)+360)%360;return h>=235&&h<345?'gem_purple':h>=130&&h<235?'gem_teal':'gem_amber'}
const GSTROKE={gem_purple:'#2a0b4a',gem_teal:'#053a40',gem_amber:'#4a2200',gem_broken:'#2a0b4a'};
function gem(x,y,r,hue,label,o){o=o||{};const n=o.crack?'gem_broken':gemName(hue);X.save();X.translate(x,y);if(o.rot)X.rotate(o.rot);const s=o.sc||1;X.scale(s*(o.sx||1),s*(o.sy||1));X.globalAlpha*=o.alpha==null?1:o.alpha;
 const i=UA[n];if(okI(i)){const k=(o.crack?2.9:2.35)*r/Math.max(i.naturalWidth,i.naturalHeight),w=i.naturalWidth*k,h=i.naturalHeight*k;
  if(o.glow!==0&&!o.grey){const gl=(o.glow||1)*(.75+.25*Math.sin(T*3+x*.1));X.save();X.globalCompositeOperation='lighter';X.globalAlpha*=.22*gl;X.drawImage(i,-w*.62,-h*.62,w*1.24,h*1.24);X.restore()}
  dimg(n,-w/2,-h/2,w,h,{grey:o.grey});
  if(!o.grey&&r>20){const tw=Math.max(0,Math.sin(T*2.3+x*.7+y));if(tw>.7){const k2=(tw-.7)*3.3;X.save();X.globalCompositeOperation='lighter';X.globalAlpha*=k2;const sz=r*.7;dimg('star',-r*.55-sz/2,-r*.6-sz/2,sz,sz);X.restore()}}}
 if(label!=null&&label!==''){const L=String(label),fs=o.fs||r*(L.length>2?.62:.85);
  X.save();X.globalAlpha*=.55;txt(L,1.5,r*.05+2,fs,'#000000',{st:0});X.restore();
  txt(L,0,r*.05,fs,o.grey?'#c8c0d8':'#fffbe8',{st:o.grey?'#3a3448':GSTROKE[n],lw:fs*.2})}
 X.restore()}
// ---- кнопки ----
let UI_PRESS=null;C.addEventListener('pointerdown',()=>{UI_PRESS=T});
function btn(id,x,y,w,h,label,fn,o){o=o||{};UI.push({id,x,y,w,h,fn,always:o.always,dis:o.dis});const hov=Math.abs(PX-x)<w/2&&Math.abs(PY-y)<h/2;const pr=o.pulse?1+Math.sin(T*5)*.04:1;
 X.save();X.translate(x,y);const sc=pr*(hov?1.05:1);X.scale(sc,sc);if(o.dis)X.globalAlpha*=.55;
 const round=w<=h*1.45;const hue=o.hue==null?42:o.hue;
 if(round){const d=Math.max(w,h)*1.18;dimg('btn_round',-d/2,-d/2,d,d,{grey:o.dis});
  if(label==='⌂'){const p=UA.pickaxe;if(okI(p)){const k=d*.5/p.naturalHeight;dimg('pickaxe',-p.naturalWidth*k/2,-p.naturalHeight*k/2,p.naturalWidth*k,p.naturalHeight*k)}}
  else txt(label,0,2,o.fs||d*.42,'#ffe9a0',{st:'#2a0b4a',lw:(o.fs||d*.42)*.22})}
 else{const n=hue>=130&&hue<235?'btn_teal':'btn_purple';const hh=h*1.18,ww=w*1.12;win(n,-ww/2,-hh/2,ww,hh);
  // приглушаем кристалл под надписью нарисованным свитком, чтобы текст читался
  const fs=o.fs||Math.min(h*.5,34);X.save();X.globalAlpha*=.9;win('scroll_banner',-w*.36,-h*.3,w*.72,h*.6);X.restore();
  txt(label,0,1,fs*.9,'#fff2c8',{st:'#3a1a08',lw:fs*.16})}
 X.restore()}
// ---- звёзды, сердца, замок ----
function star(x,y,r,on,sc){const s=(sc||1)*r*2.5;X.save();X.translate(x,y);if(on){X.save();X.globalCompositeOperation='lighter';X.globalAlpha*=.3+.1*Math.sin(T*4+x);dimg('star',-s*.65,-s*.65,s*1.3,s*1.3);X.restore()}
 dimg('star',-s/2,-s/2,s,s,{grey:!on});X.restore()}
function heart(on){dimg(on?'heart':'heart_grey',-26,-30,52,48)}
function lock(x,y){const i=UA.lock;if(!okI(i))return;const h=46,w=h*i.naturalWidth/i.naturalHeight;dimg('lock',x-w/2,y-h/2,w,h)}
// ---- текстурные линии (лоза из золота / сталь рельса) ----
const PAT={};function pat(n){if(PAT[n])return PAT[n];const i=UA[n];if(!okI(i))return null;return PAT[n]=X.createPattern(i,'repeat')}
function vine(pts,lw,lit){X.save();X.lineCap='round';X.lineJoin='round';X.strokeStyle='rgba(30,12,0,.75)';X.lineWidth=lw+3;X.beginPath();pts.forEach((p,i)=>i?X.lineTo(p.x,p.y):X.moveTo(p.x,p.y));X.stroke();
 const p=pat('tex_gold');if(p){X.strokeStyle=p;if(!lit)X.globalAlpha*=.45;X.lineWidth=lw;X.stroke()}X.restore()}
function bezPts(a,b,n){const out=[],mx=(a.x+b.x)/2;for(let i=0;i<=n;i++){const t=i/n,u=1-t;out.push({x:u*u*u*a.x+3*u*u*t*mx+3*u*t*t*mx+t*t*t*b.x,y:u*u*u*a.y+3*u*u*t*a.y+3*u*t*t*b.y+t*t*t*b.y})}return out}
function railPainted(pts,on,scroll){// шпалы — нарисованные доски, рельсы — стальная текстура
 const pl=UA.plank;let acc=(scroll||0)%34;for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],d=Math.hypot(b.x-a.x,b.y-a.y),ang=Math.atan2(b.y-a.y,b.x-a.x);let s=34-acc;while(s<d){const x=a.x+(b.x-a.x)*s/d,y=a.y+(b.y-a.y)*s/d;if(okI(pl)){X.save();X.translate(x,y);X.rotate(ang+Math.PI/2);X.drawImage(pl,-22,-6,44,12);X.restore()}s+=34}acc=(acc+d)%34}
 const p=pat('tex_steel');[-10,10].forEach(o=>{X.save();X.lineCap='round';X.strokeStyle='rgba(20,10,5,.85)';X.lineWidth=9;X.beginPath();pts.forEach((q,i)=>i?X.lineTo(q.x,q.y+o):X.moveTo(q.x,q.y+o));X.stroke();if(p){X.strokeStyle=p;X.lineWidth=5;X.stroke()}
  if(on){X.globalCompositeOperation='lighter';X.globalAlpha=.35+.2*Math.sin(T*6);X.lineWidth=5;X.strokeStyle=pat('tex_gold')||'#000';X.stroke()}X.restore()})}
function cart(x,y,a,sc){X.save();X.translate(x,y);X.rotate(a);
 const im=IM.granit;if(okI(im)){const h=200,w=h*im.width/im.height;X.save();X.beginPath();X.rect(-90,-240,180,200);X.clip();X.drawImage(im,-w/2,-190+Math.abs(Math.sin(T*8))*3,w,h);
  const v=VIS.granit[visFor({n:'granit'})];const f=HF.granit;if(okI(v))X.drawImage(v,-w/2+f[0]*w,-190+Math.abs(Math.sin(T*8))*3+f[1]*h,f[2]*w,f[3]*h);X.restore()}
 const c=UA.cart;if(okI(c)){const w=170,h=w*c.naturalHeight/c.naturalWidth;X.drawImage(c,-w/2,-h+18+Math.sin(sc*.8)*1.5,w,h)}X.restore()}
// ---- частицы: нарисованные осколки, брызги, искры-звёздочки ----
function drawParticles(){for(const p of PS){X.save();X.globalAlpha=Math.min(1,p.life*1.5);X.translate(p.x,p.y);X.rotate(p.rot);
 if(p.kind==='shard'){if(p.im==null)p.im=Math.floor(Math.random()*SHARDS.length);const i=SHARDS[p.im];if(okI(i)){const s=p.s*2.6/Math.max(i.naturalWidth,i.naturalHeight);X.drawImage(i,-i.naturalWidth*s/2,-i.naturalHeight*s/2,i.naturalWidth*s,i.naturalHeight*s)}}
 else if(p.kind==='drop'){if(p.im==null)p.im=Math.floor(Math.random()*SPL.length);const i=SPL[p.im];if(okI(i)){const s=p.s*4/Math.max(i.naturalWidth,i.naturalHeight);X.drawImage(i,-i.naturalWidth*s/2,-i.naturalHeight*s/2,i.naturalWidth*s,i.naturalHeight*s)}}
 else{X.globalCompositeOperation='lighter';const s=p.s*(p.kind==='mote'?3.2:4.5);dimg('star',-s/2,-s/2,s,s)}
 X.restore()}}
// ---- облачко речи: хрустальный пузырь ----
function drawTalk(){if(!talk)return;const c=cast.find(c=>c.n===talk.who);const fs=26,lh=32;X.font=fs+'px '+FONT;const side=scene==='l3';const maxW=side?220:c?420:860;const L=wrap(talk.text,maxW);
 const tw=Math.max(...L.map(l=>X.measureText(l).width),c?X.measureText(NAMES[c.n][0]).width:0);const padX=side?40:58,padT=44,padB=74;const bw=side?312:Math.max(240,tw+padX*2),bh=L.length*lh+(c?34:0)+padT+padB;
 const age=T-talk.t0,pop=age<.18?.7+.3*ease(age/.18):1;let bx,by,flip=false;
 if(side){bx=962;by=86;flip=c&&c.x>640}else if(c){const hx2=c.x,hy=c.y-c.h*1.0-(c.jump&&T-c.jump<.75?50:0);flip=c.x>640;bx=flip?hx2-bw+40:hx2-40;bx=clamp(bx,4,1276-bw);by=Math.max(4,hy-bh+30)}else{bx=640-bw/2;by=8}
 X.save();const ox=flip?bx+bw*.85:bx+bw*.15;X.translate(ox,by+bh);X.scale(pop,pop);X.translate(-ox,-by-bh);
 win('bubble',bx,by,bw,bh,flip);
 let y0=by+padT;if(c){txt(NAMES[c.n][0],bx+padX,y0,24,NAMES[c.n][1],{al:'left',st:'#2a1240',lw:5});y0+=34}
 L.forEach((l,i)=>txt(l,bx+padX,y0+i*lh+4,fs,'#3a1468',{al:'left',st:'rgba(255,255,255,.85)',lw:5}));X.restore();
 talk.box=[bx,by,bw,bh]}
// ================= живые герои: нарисованные головы-виземы =================
// 0 закрыт · 1 приоткрыт · 2 широко · 3 «О» · 4 улыбка/смех
function visFor(c){if(c.forceV!=null)return c.forceV;const talking=talk&&talk.who===c.n;
 if(talking){if(!c.vs)c.vs={f:0,t:0,env:0,gap:0};const v=c.vs;let a;
  if(AN&&!G.fast){a=ampNow(c)}else{const t=T-talk.t0;const syl=Math.sin(t*11.5)*.5+.5,word=Math.sin(t*2.1+1)>-.55?1:0;a=word*(.15+.85*syl)}
  v.env=v.env*.6+a*.4;let tgt=v.env<.1?0:v.env<.28?1:v.env<.55?(Math.floor(T*4.3+c.x)%3===0?3:1):2;
  if(c.n==='troll'&&tgt===2&&Math.floor(T*3)%2)tgt=4;
  if(T-v.t>.085&&tgt!==v.f){v.f=tgt;v.t=T}return v.f}
 if(c.n==='troll'){if(c.mood==='laugh'&&T-c.moodT<1.6)return Math.floor(T*7)%2?4:2;if(c.wob&&T-c.wob<1)return 3;if(c.hit&&T-c.hit<1)return 3;if(c.mood==='angry'&&T-c.moodT<2)return 6;return 0}
 if(c.wob&&T-c.wob<1.2)return 3;if(c.jump&&T-c.jump<1.2)return 4;if(c.mood==='happy'&&T-c.moodT<2)return 4;return 0}
function blinkOn(c){if(c.forceV!=null)return false;if(!c.blN){c.blN=T+rnd(1,4);c.bl2=0}if(T>c.blN+.12){if(!c.bl2&&Math.random()<.25){c.bl2=1;c.blN=T+.12}else{c.bl2=0;c.blN=T+rnd(2.5,5)}}return T>=c.blN&&T<c.blN+.12}
function drawHero(c){const im=IM[c.n],R=RIG[c.n];if(!okI(im))return;const ph=c.x*.013;const talking=talk&&talk.who===c.n;
 if(!c.fidT)c.fidT=T+rnd(3,7);if(T>c.fidT&&!c.fid){c.fid={granit:'axe',iskorka:Math.random()<.5?'tail':'wing',shester:'key',troll:'stomp'}[c.n];c.fid0=T}
 if(c.fid){c.fidK=(T-c.fid0)/1.2;if(c.fid==='stomp'&&!c.stomped&&c.fidK>.5){c.stomped=1;if(scene==='l5'||scene==='intro'){shake=Math.max(shake,7);SFX.hit();burst(c.x,c.y,14,'shard',35,.5)}}if(c.fidK>=1){c.fid=null;c.stomped=0;c.fidT=T+rnd(4,8)}}
 let sy=1+Math.sin(T*2.2+ph)*.022,sx=1-Math.sin(T*2.2+ph)*.012,dy=0,rot=Math.sin(T*1.3+ph)*.01;
 if(talking){sy+=.012*Math.sin(T*9)}
 if(c.fid==='stomp'){const k=c.fidK;if(k<.5){dy-=Math.sin(k*2*Math.PI)*15;rot-=.04*Math.sin(k*2*Math.PI)}else if(k<.7){sy-=.08*Math.sin((k-.5)/.2*Math.PI);sx+=.05*Math.sin((k-.5)/.2*Math.PI)}}
 if(c.jump&&T>c.jump&&T-c.jump<.75){const u=(T-c.jump)/.75;if(u<.15){sy-=.12*(u/.15);sx+=.08*(u/.15)}else if(u<.85){const k=(u-.15)/.7;dy-=Math.sin(k*Math.PI)*70;sy+=.08*Math.sin(k*Math.PI);sx-=.05*Math.sin(k*Math.PI)}else{const k=(u-.85)/.15;sy-=.1*(1-k);sx+=.07*(1-k)}}
 const puz=c.wob&&T-c.wob<1.6?1-(T-c.wob)/1.6:0;
 const hit=c.hit&&T-c.hit<1?1-(T-c.hit):0;if(hit){sy-=.12*hit*Math.abs(Math.sin((T-c.hit)*14));sx+=.06*hit;rot+=Math.sin((T-c.hit)*16)*.07*hit}
 const h=c.h,w=h*im.width/im.height;
 const lk=G.look||{x:PX,y:PY};const dir=clamp((lk.x-c.x)/600,-1,1)*(c.flip?-1:1);let headA=dir*.05+Math.sin(T*.9+ph)*.02+puz*.15*Math.sin(Math.min(1,(1-puz)*8)*1.57)+(talking?Math.sin((T-talk.t0)*4)*.03:0);
 if(c.mood==='laugh'&&T-c.moodT<1.5)headA+=Math.sin(T*28)*.05;
 X.save();X.translate(c.x,c.y);
 const sg=X.createRadialGradient(0,0,2,0,0,w*.42);sg.addColorStop(0,'rgba(0,0,0,.42)');sg.addColorStop(1,'rgba(0,0,0,0)');X.save();X.scale(1,.16);X.fillStyle=sg;X.beginPath();X.arc(0,0,w*.42*(1+dy/250),0,7);X.fill();X.restore();
 X.translate(0,dy);X.rotate(rot);X.scale(sx*(c.flip?-1:1),sy);X.translate(-w/2,-h);
 const body=BODY2[c.n]&&okI(BODY2[c.n])?BODY2[c.n]:im;
 const rects=[R.head.r,...R.parts.map(p=>p.r)];
 X.save();clipExcept(w,h,rects);X.drawImage(body,0,0,w,h);X.restore();
 R.parts.forEach(p=>drawPart(body,w,h,p.r,p.p,p.f?p.f(T+ph,c):0,p.sx?p.sx(T+ph,c):null));
 X.save();const hp=R.head.p;X.translate(hp[0]*w,hp[1]*h);X.rotate(headA);X.translate(-hp[0]*w,-hp[1]*h);
 X.save();X.beginPath();const hr=R.head.r;X.rect(hr[0]*w-1,hr[1]*h-1,(hr[2]-hr[0])*w+2,(hr[3]-hr[1])*h+2);X.clip();X.drawImage(body,0,0,w,h);X.restore();
 let vf=visFor(c);if(blinkOn(c)&&vf===0)vf=5;const f=HF[c.n],v=VIS[c.n][vf];if(okI(v))X.drawImage(v,f[0]*w,f[1]*h,f[2]*w,f[3]*h);
 X.restore();X.restore();
 if(puz>0&&c.n!=='troll'){const hx2=c.x+(c.flip?-1:1)*(R.head.p[0]-.5)*w,hy=c.y-h*1.02+dy;txt('?',hx2+Math.sin(T*6)*4,hy-10*Math.sin(puz*3),44*Math.min(1,puz*3),'#ffe066')}
 if(c.mood==='laugh'&&T-c.moodT<1.5)txt('Ха-ха!',c.x,c.y-h*1.05,40,'#c8ff9a')}
G.vis=n=>{const c=cast.find(c=>c.n===n);return c?visFor(c):-1};
go('title');requestAnimationFrame(loop);
