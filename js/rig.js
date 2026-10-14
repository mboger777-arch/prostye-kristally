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
function mood(n,m){const c=cast.find(c=>c.n===n);if(c){c.mood=m;c.moodT=T}}
function swing(n){const c=cast.find(c=>c.n===n);if(c)c.swing=T}
