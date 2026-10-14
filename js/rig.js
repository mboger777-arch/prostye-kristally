'use strict';
// ===== Живая анимация персонажей: части спрайта (голова/руки/хвост/крылья/молот), моргание, губы по громкости голоса, взгляд, эмоции =====
// координаты в долях спрайта: e=[x,y,rx,ry] глаза, m=[x,y,w,h] рот, lid=цвет века
const RIG={
 granit:{lid:'#efae86',e:[[.597,.268,.052,.04],[.777,.268,.052,.04]],m:[.69,.345,.075,.03],head:{r:[.22,0,1,.405],p:[.68,.40]},
  parts:[{r:[0,.405,.40,.82],p:[.36,.47],f:(t,c)=>c.fid==='axe'?-Math.sin(c.fidK*Math.PI*2)*.35:Math.sin(t*1.7)*.03}]},
 iskorka:{lid:'#9c84d8',e:[[.255,.37,.06,.05],[.53,.385,.075,.06]],m:[.36,.455,.09,.022],head:{r:[0,.06,.80,.53],p:[.43,.53]},
  parts:[{r:[.62,.66,1,1],p:[.64,.86],f:(t,c)=>Math.sin(t*2.6)*.10+(c.fid==='tail'?Math.sin(c.fidK*Math.PI*6)*.25:0)},
   {r:[.80,.40,1,.66],p:[.80,.52],f:(t,c)=>Math.sin(t*3.2)*.06+(c.fid==='wing'?Math.sin(c.fidK*Math.PI*8)*.35:0)}]},
 shester:{lid:'#c4913d',e:[[.255,.235,.06,.05],[.545,.24,.08,.065]],m:[.41,.385,.08,.02],head:{r:[0,0,1,.405],p:[.42,.41]},
  parts:[{r:[.74,.405,1,.62],p:[.79,.50],sx:(t,c)=>Math.cos(t*(c.fid==='key'?9:2.2))}],gears:[[.12,.09,.10],[.88,.09,.10]]},
 troll:{lid:'#8e8f68',e:[[.672,.170,.026,.024],[.585,.175,.022,.018]],m:[.645,.265,.05,.03],head:{r:[.52,0,.96,.34],p:[.71,.34]},
  parts:[{r:[0,0,.52,.78],p:[.52,.32],f:(t,c)=>c.swing?-Math.sin(clamp((T-c.swing)/.7,0,1)*Math.PI)*.55:Math.sin(t*1.1)*.05}]}};
let AN=null,AMP=0;const _abuf=new Uint8Array(512);
function attachAnalyser(a){try{const ctx=ac();if(!ctx)return;const s=ctx.createMediaElementSource(a),an=ctx.createAnalyser();an.fftSize=512;s.connect(an);an.connect(ctx.destination);AN=an}catch(e){AN=null}}
function ampNow(c){if(!(talk&&talk.who===c.n))return 0;if(AN&&!G.fast){AN.getByteTimeDomainData(_abuf);let s=0;for(let i=0;i<_abuf.length;i++){const v=(_abuf[i]-128)/128;s+=v*v}const r=Math.sqrt(s/_abuf.length);AMP=AMP*.5+clamp(r*5,0,1)*.5;return AMP}
 const t=T-talk.t0;return clamp(.55+.45*Math.sin(t*17)*Math.sin(t*5.3),0,1)}
function clipExcept(w,h,rects){X.beginPath();X.rect(-w*.3,-h*.3,w*1.6,h*1.6);rects.forEach(r=>{X.moveTo(r[0]*w,r[1]*h);X.lineTo(r[0]*w,r[3]*h);X.lineTo(r[2]*w,r[3]*h);X.lineTo(r[2]*w,r[1]*h);X.closePath()});X.clip('evenodd')}
function drawPart(im,w,h,r,p,ang,sx){X.save();X.translate(p[0]*w,p[1]*h);X.rotate(ang||0);if(sx!=null)X.scale(.55+.45*Math.abs(sx),1);X.translate(-p[0]*w,-p[1]*h);
 X.beginPath();X.rect(r[0]*w-1,r[1]*h-1,(r[2]-r[0])*w+2,(r[3]-r[1])*h+2);X.clip();X.drawImage(im,0,0,w,h);X.restore()}
function drawHero(c){const im=IM[c.n],R=RIG[c.n];if(!im||!im.complete||!im.width)return;const ph=c.x*.013;const talking=talk&&talk.who===c.n;
 // idle-фиджеты
 if(!c.fidT)c.fidT=T+rnd(3,7);if(T>c.fidT&&!c.fid){c.fid={granit:'axe',iskorka:Math.random()<.5?'tail':'wing',shester:'key',troll:'stomp'}[c.n];c.fid0=T}
 if(c.fid){c.fidK=(T-c.fid0)/1.2;if(c.fid==='stomp'&&!c.stomped&&c.fidK>.5){c.stomped=1;if(scene==='l5'||scene==='intro'){shake=Math.max(shake,7);SFX.hit();burst(c.x,c.y,14,'shard',35,.5)}}if(c.fidK>=1){c.fid=null;c.stomped=0;c.fidT=T+rnd(4,8)}}
 // блинк
 if(!c.blT||T>c.blT+.16){if(!c.blT||T>c.blT+.16)c.blT=T+rnd(2,5)}const bl=T>c.blT?Math.sin((T-c.blT)/.16*Math.PI):0;
 let sy=1+Math.sin(T*2.2+ph)*.022,sx=1-Math.sin(T*2.2+ph)*.012,dy=0,rot=Math.sin(T*1.3+ph)*.01;
 if(talking){const a=ampNow(c);sy+=a*.025;dy-=a*3}
 if(c.fid==='stomp'){const k=c.fidK;if(k<.5){dy-=Math.sin(k*2*Math.PI)*.5*30;rot-=.04*Math.sin(k*2*Math.PI)}else if(k<.7){sy-=.08*Math.sin((k-.5)/.2*Math.PI);sx+=.05*Math.sin((k-.5)/.2*Math.PI)}}
 if(c.jump&&T>c.jump&&T-c.jump<.75){const u=(T-c.jump)/.75;if(u<.15){sy-=.12*(u/.15);sx+=.08*(u/.15)}else if(u<.85){const k=(u-.15)/.7;dy-=Math.sin(k*Math.PI)*70;sy+=.08*Math.sin(k*Math.PI);sx-=.05*Math.sin(k*Math.PI)}else{const k=(u-.85)/.15;sy-=.1*(1-k);sx+=.07*(1-k)}}
 const puz=c.wob&&T-c.wob<1.6?1-(T-c.wob)/1.6:0;
 const hit=c.hit&&T-c.hit<1?1-(T-c.hit):0;if(hit){sy-=.12*hit*Math.abs(Math.sin((T-c.hit)*14));sx+=.06*hit;rot+=Math.sin((T-c.hit)*16)*.07*hit;dy+=0}
 const h=c.h,w=h*im.width/im.height;
 // взгляд на активный объект
 const lk=G.look||{x:PX,y:PY};const dir=clamp((lk.x-c.x)/600,-1,1)*(c.flip?-1:1);let headA=dir*.07+Math.sin(T*.9+ph)*.025+puz*.22*Math.sin(Math.min(1,(1-puz)*8)*1.57)+(talking?Math.sin((T-talk.t0)*4)*.04:0);
 if(c.mood==='laugh'&&T-c.moodT<1.5)headA+=Math.sin(T*28)*.06;
 X.save();X.translate(c.x,c.y);
 const sg=X.createRadialGradient(0,0,2,0,0,w*.42);sg.addColorStop(0,`rgba(0,0,0,${.42-dy*-.002})`);sg.addColorStop(1,'rgba(0,0,0,0)');X.save();X.scale(1,.16);X.fillStyle=sg;X.beginPath();X.arc(0,0,w*.42*(1+dy/250),0,7);X.fill();X.restore();
 X.translate(0,dy);X.rotate(rot);X.scale(sx*(c.flip?-1:1),sy);X.translate(-w/2,-h);
 const rects=[R.head.r,...R.parts.map(p=>p.r)];
 X.save();clipExcept(w,h,rects);X.drawImage(im,0,0,w,h);X.restore();
 R.parts.forEach(p=>drawPart(im,w,h,p.r,p.p,p.f?p.f(T+ph,c):0,p.sx?p.sx(T+ph,c):null));
 // голова с глазами и ртом
 X.save();const hp=R.head.p;X.translate(hp[0]*w,hp[1]*h);X.rotate(headA);X.translate(-hp[0]*w,-hp[1]*h);
 X.save();X.beginPath();const hr=R.head.r;X.rect(hr[0]*w-1,hr[1]*h-1,(hr[2]-hr[0])*w+2,(hr[3]-hr[1])*h+2);X.clip();X.drawImage(im,0,0,w,h);X.restore();
 if(R.gears)R.gears.forEach(g=>{X.save();X.translate(g[0]*w,g[1]*h);X.rotate(T*1.5);X.strokeStyle='rgba(255,230,160,.55)';X.lineWidth=2;for(let i=0;i<8;i++){X.rotate(Math.PI/4);X.beginPath();X.moveTo(g[2]*w*.25,0);X.lineTo(g[2]*w*.6,0);X.stroke()}X.restore()});
 const a=talking?ampNow(c):0;
 if(a>.04){const m=R.m;X.fillStyle='rgba(70,15,20,.92)';X.beginPath();X.ellipse(m[0]*w,m[1]*h+m[3]*h*a*.5,m[2]*w*(.75+.25*a),m[3]*h*a*1.6+1,0,0,7);X.fill();X.fillStyle='rgba(230,90,110,.85)';X.beginPath();X.ellipse(m[0]*w,m[1]*h+m[3]*h*a*1.3,m[2]*w*.45,m[3]*h*a*.6,0,0,7);X.fill()}
 const lid=Math.max(bl,c.lidF||0,c.mood==='angry'&&T-c.moodT<2?.35:0,hit?.6*hit:0);
 if(lid>0.02)R.e.forEach(e=>{X.save();X.beginPath();X.ellipse(e[0]*w,e[1]*h,e[2]*w*1.02,e[3]*h*1.08,0,0,7);X.clip();const lg=X.createLinearGradient(0,e[1]*h-e[3]*h*1.3,0,e[1]*h+e[3]*h*1.3);lg.addColorStop(0,R.lid);lg.addColorStop(1,'rgba(60,30,30,1)');X.fillStyle=R.lid;X.globalAlpha=.97;X.fillRect(e[0]*w-e[2]*w*1.3,e[1]*h-e[3]*h*1.3,e[2]*w*2.6,e[3]*h*2.6*lid);X.strokeStyle='rgba(40,20,20,.7)';X.lineWidth=2;X.beginPath();X.moveTo(e[0]*w-e[2]*w*1.2,e[1]*h-e[3]*h*1.3+e[3]*h*2.6*lid);X.lineTo(e[0]*w+e[2]*w*1.2,e[1]*h-e[3]*h*1.3+e[3]*h*2.6*lid);X.stroke();X.restore()});
 if(c.mood==='angry'&&T-c.moodT<2){X.strokeStyle='#3a2a10';X.lineWidth=5;X.lineCap='round';R.e.forEach((e,i)=>{X.beginPath();X.moveTo(e[0]*w-e[2]*w*1.3,e[1]*h-e[3]*h*(i?2.2:1.4));X.lineTo(e[0]*w+e[2]*w*1.3,e[1]*h-e[3]*h*(i?1.4:2.2));X.stroke()})}
 X.restore();
 if(hit>.75){X.globalCompositeOperation='source-atop';X.fillStyle='rgba(255,80,80,.3)';X.fillRect(0,0,w,h);X.globalCompositeOperation='source-over'}
 X.restore();
 if(puz>0){const hx=c.x+(c.flip?-1:1)*(R.head.p[0]-.5)*w,hy=c.y-h*1.02+dy;txt('?',hx+Math.sin(T*6)*4,hy-10*Math.sin(puz*3),40*Math.min(1,puz*3),'#ffe066')}
 if(c.mood==='laugh'&&T-c.moodT<1.5)txt('Ха-ха!',c.x,c.y-h*1.05,36,'#c8ff9a')}
function mood(n,m){const c=cast.find(c=>c.n===n);if(c){c.mood=m;c.moodT=T}}
function swing(n){const c=cast.find(c=>c.n===n);if(c)c.swing=T}
