# Аудит «ноги на земле / без растяжения»: на каждом экране и 5 размерах — ступни героя на видимом полу (нижняя полоса
# экрана, не ниже края и не выше 70 px логики от него), пропорции = родные (±1%), герои не налезают друг на друга.
# python tools/ground_audit.py   (сервер на порту 18591)
import asyncio,os
from playwright.async_api import async_playwright
URL='http://127.0.0.1:18591/index.html'
VPS=[(740,360,1),(844,390,1),(932,430,1),(1280,720,0),(1440,900,0)]
BAND=70
def chk(D,tag):
  F=[];v=D['v'];bot=v['y0']+v['h']
  for c in D['items']:
    if c['feet']>bot+1:F.append(f"{tag}: {c['n']} feet below screen ({c['feet']-bot:.0f})")
    if c['feet']<bot-BAND:F.append(f"{tag}: {c['n']} floating {bot-c['feet']:.0f} above floor band")
    r=(c['w']/c['h'])/c['nr']
    if abs(r-1)>.01:F.append(f"{tag}: {c['n']} aspect {r:.3f}")
  it=D['items']
  for i in range(len(it)):
    for j in range(i+1,len(it)):
      a,b=it[i],it[j]
      if abs(a['x']-b['x'])<(a['w']+b['w'])*.3:F.append(f"{tag}: {a['n']}/{b['n']} overlap")
  return F,len(it)
async def main():
  F=[];n=0
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for W,H,m in VPS:
      ctx=await b.new_context(viewport={'width':W,'height':H},is_mobile=bool(m),has_touch=bool(m))
      pg=await ctx.new_page();pg.on('pageerror',lambda e:F.append('JSERR '+str(e)))
      await pg.goto(URL);await pg.wait_for_timeout(2000);await pg.evaluate("G.fast=1;G.mute=1;SV.open=5")
      for sc in ['title','intro','map','l1','l2','l3','l4','l5','fin','s1','s2','s3','s4']:
        await pg.evaluate(f"talk=null;go('secret',{sc[1]})" if sc[0]=='s' else f"talk=null;G.go('{sc}')");await pg.wait_for_timeout(1200)
        for t in range(3):
          D=await pg.evaluate("new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(G.gnd()))))")
          f,k=chk(D,f'{W}x{H} {sc}');F.extend(f);n+=k;await pg.wait_for_timeout(300)
      await ctx.close()
    await b.close()
  F=sorted(set(F));os.makedirs('shots',exist_ok=True);open('shots/ground_audit.log','w').write('\n'.join(F))
  print('characters checked',n,'FLAGS',len(F))
asyncio.run(main())
