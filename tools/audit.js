// injected by tools/audit.py: records painted containers, texts and heroes for one frame, returns flags
(function(){
const R=[];let ON=false,seq=0,DEP=0;
function scr(x,y){const m=X.getTransform();return[(m.a*x+m.c*y+m.e)/DPR,(m.b*x+m.d*y+m.f)/DPR]}
function boxOf(x,y,w,h){const a=scr(x,y),b=scr(x+w,y+h);return[Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1])]}
const _txt=txt;window.txt=txt=function(t,x,y,size,col,o){
 if(ON&&!(o&&o.st===0)&&String(t).trim()&&X.globalAlpha>.3){X.save();X.font=size+'px '+FONT;if(o&&o.maxW){const mw=X.measureText(String(t)).width;if(mw>o.maxW){size=size*o.maxW/mw;X.font=size+'px '+FONT}}X.textAlign=(o&&o.al)||'center';X.textBaseline='middle';const m=X.measureText(String(t));X.restore();
  const bb=boxOf(x-m.actualBoundingBoxLeft,y-m.actualBoundingBoxAscent,m.actualBoundingBoxLeft+m.actualBoundingBoxRight,m.actualBoundingBoxAscent+m.actualBoundingBoxDescent);
  const dg=/\d/.test(String(t))?(()=>{X.save();X.font=size+'px '+FONT;const d=X.measureText('0');X.restore();return (d.actualBoundingBoxAscent+d.actualBoundingBoxDescent)*X.getTransform().d/DPR})():0;
  R.push({k:'t',t:String(t),b:bb,i:seq++,dg,top:!!window.EXTOP})}
 return _txt.apply(this,arguments)};
const _win=win;window.win=win=function(n,x,y,w,h){if(ON&&!DEP&&X.globalAlpha>.3)R.push({k:'c',n,b:boxOf(x,y,w,h),i:seq++,top:!!window.EXTOP});return _win.apply(this,arguments)};
const _gem=gem;window.gem=gem=function(x,y,r,hue,label,o){const sc=(o&&o.sc)||1;if(ON&&label!=null&&label!==''&&!(o&&o.alpha<.3))R.push({k:'c',n:'gem',r,b:boxOf(x-r*1.12*sc,y-r*1.12*sc,r*2.24*sc,r*2.24*sc),i:seq++});DEP++;try{return _gem.apply(this,arguments)}finally{DEP--}};
const _btn=btn;window.btn=btn=function(id,x,y,w,h,label){if(ON){const round=w<=h*1.45;const d=Math.max(w,h)*1.18;R.push({k:'c',n:'btn:'+id,b:round?boxOf(x-d*.42,y-d*.42,d*.84,d*.84):boxOf(x-w*.36,y-h*.3,w*.72,h*.6),i:seq++,btn:1})}DEP++;try{return _btn.apply(this,arguments)}finally{DEP--}};
const _dh=drawHero;window.drawHero=drawHero=function(c){const im=IM[c.n];if(ON&&im&&im.naturalWidth){const h=c.h,w=h*im.naturalWidth/im.naturalHeight;R.push({k:'h',n:c.n,b:boxOf(c.x-w*.38,c.y-h*.95,w*.76,h*.93),i:seq++})}return _dh.apply(this,arguments)};
const _dimg=dimg;window.dimg=dimg=function(n,x,y,w,h,o){if(ON&&(n==='tile'||n==='tile_water'))R.push({k:'c',n,b:boxOf(x,y,w,h),i:seq++,top:!!window.EXTOP});return _dimg.apply(this,arguments)};
function inter(a,b){return Math.max(0,Math.min(a[2],b[2])-Math.max(a[0],b[0]))*Math.max(0,Math.min(a[3],b[3])-Math.max(a[1],b[1]))}
function inside(a,c,p){return a[0]>=c[0]+p&&a[1]>=c[1]+p&&a[2]<=c[2]-p&&a[3]<=c[3]-p}
function area(a){return(a[2]-a[0])*(a[3]-a[1])}
window.AUDIT=function(){return new Promise(res=>{R.length=0;seq=0;ON=true;requestAnimationFrame(()=>{R.length=0;seq=0;requestAnimationFrame(()=>{ON=false;const F=[];
 const MOD=Math.max(-1,...R.filter(r=>r.n==='win_victory').map(r=>r.i));const T_=R.filter(r=>r.k==='t'&&r.i>MOD),C=R.filter(r=>r.k==='c'),Hh=R.filter(r=>r.k==='h'&&r.i>MOD);const vw=innerWidth,vh=innerHeight;
 for(const t of T_){const cx=(t.b[0]+t.b[2])/2,cy=(t.b[1]+t.b[3])/2;
  const own=C.filter(c=>c.i<t.i&&cx>c.b[0]&&cx<c.b[2]&&cy>c.b[1]&&cy<c.b[3]).sort((a,b)=>b.i-a.i)[0];t.own=own;
  if(own){const p=own.btn?0:Math.max(2,Math.min(own.b[2]-own.b[0],own.b[3]-own.b[1])*(own.n==='gem'||own.n.startsWith('tile')?0.02:own.btn?0:.05));if(!inside(t.b,own.b,p)&&own.n!=='frame')F.push(['overflow',t.t,own.n,t.b.map(Math.round),own.b.map(Math.round)])}
  if(t.b[0]<0||t.b[1]<0||t.b[2]>vw||t.b[3]>vh)F.push(['offscreen',t.t,t.b.map(Math.round)]);
  if(t.dg&&vh<500&&/^[\d?×=+ ]+$/.test(t.t.trim())&&t.dg<(own&&(own.btn||(own.n==='gem'&&own.r>=40)||own.n.startsWith('tile'))?28:16)*Math.min(1,vh/390)) F.push(['small_digits',t.t,Math.round(t.dg*10)/10]);
  for(const h of Hh)if(inter(t.b,t.top?[h.b[0],h.b[1],h.b[2],h.b[1]+(h.b[3]-h.b[1])*.42]:h.b)>area(t.b)*.04&&!(own&&own.i>h.i&&!t.top))F.push(['text_hero',t.t,h.n]);
  for(const c of C)if(c.i>t.i&&c!==own&&!(c.top&&!t.top&&!(own&&own.btn))&&inter(t.b,c.b)>area(t.b)*.04&&!(own&&own.i<c.i&&inside(c.b,own.b,0)))F.push(['covered',t.t,c.n])}
 for(let a=0;a<T_.length;a++)for(let b=a+1;b<T_.length;b++){const A=T_[a],B=T_[b];if(A.t===B.t&&inter(A.b,B.b)>area(A.b)*.5)continue;if(A.top!==B.top&&!((A.top?B:A).own&&(A.top?B:A).own.btn))continue;if(inter(A.b,B.b)>Math.min(area(A.b),area(B.b))*.03)F.push(['text_text',A.t,B.t])}
 for(const c of C.filter(c=>c.btn))for(const h of Hh)if(inter(c.b,h.b)>area(c.b)*.1)F.push(['btn_hero',c.n,h.n]);
 res({flags:F,n:T_.length})})})})};
})();
