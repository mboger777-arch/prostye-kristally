// Раскладка без наложений: запоминаем, что нарисовано в кадре, и ставим облачка/окна туда, где свободно.
let KEEP=[],KN=[],LSKIP=0;
function lrect(x,y,w,h){const m=X.getTransform(),k=DPR*S,ox=DPR*OX,oy=DPR*OY;const a=[(m.a*x+m.c*y+m.e-ox)/k,(m.b*x+m.d*y+m.f-oy)/k],b=[(m.a*(x+w)+m.c*(y+h)+m.e-ox)/k,(m.b*(x+w)+m.d*(y+h)+m.f-oy)/k];return[Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1])]}
function rint(a,b){return Math.max(0,Math.min(a[2],b[2])-Math.max(a[0],b[0]))*Math.max(0,Math.min(a[3],b[3])-Math.max(a[1],b[1]))}
(function(){
 const _t=txt;txt=function(t,x,y,size,col,o){if(!LSKIP&&!(o&&o.st===0)&&X.globalAlpha>.3){X.save();X.font=size+'px '+FONT;if(o&&o.maxW){const mw=X.measureText(String(t)).width;if(mw>o.maxW){size=size*o.maxW/mw;X.font=size+'px '+FONT}}X.textAlign=(o&&o.al)||'center';X.textBaseline='middle';const m=X.measureText(String(t));X.restore();KN.push({w:3,r:lrect(x-m.actualBoundingBoxLeft-4,y-m.actualBoundingBoxAscent-4,m.actualBoundingBoxLeft+m.actualBoundingBoxRight+8,m.actualBoundingBoxAscent+m.actualBoundingBoxDescent+8)})}return _t.apply(this,arguments)};
 const _w=win;win=function(n,x,y,w,h){if(!LSKIP&&n!=='frame'&&X.globalAlpha>.3)KN.push({w:1,r:lrect(x,y,w,h)});return _w.apply(this,arguments)};
 const _b=btn;btn=function(id,x,y,w,h){if(!LSKIP)KN.push({w:4,r:lrect(x-w*.6,y-h*.6,w*1.2,h*1.2)});LSKIP++;try{return _b.apply(this,arguments)}finally{LSKIP--}};
 const _g=gem;gem=function(x,y,r){if(!LSKIP)KN.push({w:2,r:lrect(x-r*1.2,y-r*1.2,r*2.4,r*2.4)});LSKIP++;try{return _g.apply(this,arguments)}finally{LSKIP--}};
 const _h=drawHero;drawHero=function(c){const im=IM[c.n];if(!LSKIP&&im&&im.naturalWidth){const w=c.h*im.naturalWidth/im.naturalHeight;KN.push({w:.25,r:lrect(c.x-w*.4,c.y-c.h,w*.8,c.h)})}LSKIP++;try{return _h.apply(this,arguments)}finally{LSKIP--}};
})();
function spotCost(r,extra){let s=0;for(const k of KEEP)s+=rint(r,k.r)*k.w;for(const e of (extra||[]))s+=rint(r,e)*5;return s}
function bestSpot(anchors,w,h,extra){const v=vis(),X0=v.x0+4,X1=v.x0+v.w-w-4,Y0=Math.max(v.y0,0)+4,Y1=Math.min(v.y0+v.h,720)-h-4;let best=null;
 const tryAt=(x,y,pen)=>{x=clamp(x,X0,Math.max(X0,X1));y=clamp(y,Y0,Math.max(Y0,Y1));const s=spotCost([x,y,x+w,y+h],extra)+pen;if(!best||s<best[2])best=[x,y,s]};
 anchors.forEach(([c,p])=>tryAt(c[0],c[1],p||0));const a0=anchors[0][0];
 for(let y=Y0;y<=Y1;y+=24)for(let x=X0;x<=X1;x+=32)tryAt(x,y,1500+Math.hypot(x-a0[0],y-a0[1])*2);
 return best}
function placeBanner(w,h,pref){const b=LV.banner;if(b&&b.pos&&b.pos[2]===w&&b.pos[3]===h)return b.pos;
 const ex=talk&&talk.box?[[talk.box[0],talk.box[1],talk.box[0]+talk.box[2],talk.box[1]+talk.box[3]]]:[];
 const p=bestSpot([[[640-w/2,pref||96],0],[[640-w/2,96],300]],w,h,ex);const r=[p[0],p[1],w,h];if(b)b.pos=r;return r}
function talkDims(text,c,maxW,side){let fs=26,lh=32;X.font=fs+'px '+FONT;let L=wrap(text,maxW);if(L.length>5){fs=22;lh=27;X.font=fs+'px '+FONT;L=wrap(text,maxW)}
 const nameW=c?(X.font='24px '+FONT,X.measureText(NAMES[c.n][0]).width):0;X.font=fs+'px '+FONT;const tw=Math.max(...L.map(l=>X.measureText(l).width),nameW);
 const padX=side?40:56,padT=44,padB=74;const bw=side?280:Math.max(240,tw+padX*2),bh=L.length*lh+(c?34:0)+padT+padB;return{fs,lh,L,padX,padT,bw,bh}}
drawTalk=function(){KEEP=KN;KN=[];if(!talk)return;LSKIP++;try{
 const c=cast.find(c=>c.n===talk.who);const side=scene==='l3';
 if(!talk.pos){let best=null;
  if(side){const d=talkDims(talk.text,c,200,true);best=[996,70,0,200]}
  else for(const mw of (c?[400,320,240,180]:[820,600,400])){const d=talkDims(talk.text,c,mw,false);let anchors;
   if(c){const hx2=c.x,hy=c.y-c.h,fl=c.x>640;anchors=[[[fl?hx2-d.bw+40:hx2-40,hy-d.bh+30],0],[[fl?hx2-d.bw-c.h*.25:hx2+c.h*.25,hy],400],[[640-d.bw/2,8],600]]}
   else anchors=[[[640-d.bw/2,8],0]];
   const p=bestSpot(anchors,d.bw,d.bh);p[2]+=d.L.length*60;if(!best||p[2]<best[2])best=[p[0],p[1],p[2],mw]}
  talk.pos=best}
 const d=talkDims(talk.text,c,talk.pos[3],side);const bx=talk.pos[0],by=talk.pos[1],bw=d.bw,bh=d.bh;const flip=c?(side?c.x>640:bx+bw/2<c.x):false;
 const age=T-talk.t0,pop=age<.18?.7+.3*ease(age/.18):1;
 X.save();const ox=flip?bx+bw*.85:bx+bw*.15;X.translate(ox,by+bh);X.scale(pop,pop);X.translate(-ox,-by-bh);
 win('bubble',bx,by,bw,bh,flip);
 let y0=by+d.padT;if(c){txt(NAMES[c.n][0],bx+d.padX,y0,24,NAMES[c.n][1],{al:'left',st:'#2a1240',lw:5});y0+=34}
 d.L.forEach((l,i)=>txt(l,bx+d.padX,y0+i*d.lh+4,d.fs,'#3a1468',{al:'left',st:'rgba(255,255,255,.85)',lw:5}));X.restore();
 talk.box=[bx,by,bw,bh]}finally{LSKIP--}};
// Фон: картина видна целиком (вписана), поля заполняет размытое продолжение той же картины с мягким краем.
const FEATH={},BLUR={};
function blurC(img,key){if(BLUR[key])return BLUR[key];const c=document.createElement('canvas');c.width=320;c.height=180;const g=c.getContext('2d');g.filter='blur(5px) brightness(.92)';g.drawImage(img,-12,-8,344,196);return BLUR[key]=c}
function feather(img,key){if(FEATH[key])return FEATH[key];const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;const g=c.getContext('2d');g.drawImage(img,0,0);
 g.globalCompositeOperation='destination-in';const e=Math.round(c.width*.045);
 let gr=g.createLinearGradient(0,0,c.width,0);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(e/c.width,'#000');gr.addColorStop(1-e/c.width,'#000');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,c.width,c.height);
 gr=g.createLinearGradient(0,0,0,c.height);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(e/c.height,'#000');gr.addColorStop(1-e/c.height,'#000');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,c.width,c.height);
 return FEATH[key]=c}
bgDraw=function(n,dim,scroll){const v=vis(),k=Math.max(v.w/1280,v.h/720);const mx=(PX-640)/640,my=(PY-360)/360;
 const b=IM['bg_'+n],f=IM['fg_'+n];const wide=k>1.03;
 if(b&&b.complete&&b.naturalWidth){const ox=-mx*10+Math.sin(T*.21)*4,oy=-my*6+Math.cos(T*.17)*3;
  if(wide){const s=k*1.06;X.drawImage(blurC(b,'b'+n),640-640*s,360-360*s,1280*s,720*s);
   const s2=1.025;X.drawImage(feather(b,'b'+n),640-640*s2+ox,360-360*s2+oy,1280*s2,720*s2)}
  else{const s=k*1.06;X.drawImage(b,640-640*s+ox,360-360*s+oy,1280*s,720*s)}}
 if(f&&f.complete&&f.naturalWidth){const s=(wide?1.04:k)*1.10,ox=-mx*30+Math.sin(T*.21)*9,oy=-my*12;X.drawImage(f,640-640*s+ox,360-360*s+oy+8,1280*s,720*s)}
 if(dim){X.fillStyle=`rgba(8,4,24,${dim})`;X.fillRect(v.x0,v.y0,v.w,v.h)}
 const g=X.createRadialGradient(640,360,300,640,360,900);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(5,0,20,.55)');X.fillStyle=g;X.fillRect(v.x0,v.y0,v.w,v.h)};
