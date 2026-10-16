# Полный прогон настоящими тапами. python tools/test.py desktop|phone
import asyncio,sys,os
from playwright.async_api import async_playwright
MODE=sys.argv[1] if len(sys.argv)>1 else 'desktop';URL='http://127.0.0.1:18591/index.html';OUT='shots/'+MODE;FAILS=[]
async def main():
  os.makedirs(OUT,exist_ok=True)
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    vp={'width':1280,'height':720} if MODE=='desktop' else {'width':844,'height':390}
    ctx=await b.new_context(viewport=vp,has_touch=MODE=='phone',is_mobile=MODE=='phone',device_scale_factor=1 if MODE=='desktop' else 3)
    pg=await ctx.new_page();logs=[]
    pg.on('pageerror',lambda e:logs.append(str(e)));pg.on('console',lambda m:logs.append(m.text) if m.type=='error' else None)
    await pg.goto(URL);await pg.evaluate('localStorage.clear()');await pg.reload();await pg.wait_for_timeout(2500)
    await pg.screenshot(path=f'{OUT}/00_title.png')
    m=await pg.evaluate('(()=>{let c=0;for(let n=1;n<=100;n++)if(G.math.isP(n))c++;let ok=true;for(let n=2;n<2000;n++){const f=G.math.fac(n);if(f.reduce((a,b)=>a*b,1)!==n||!f.every(G.math.isP))ok=false}return [c,ok,G.math.isP(1)]})()')
    if m!=[25,True,False]:FAILS.append(f'js math {m}')
    async def tapL(x,y):
      q=await pg.evaluate(f'G.pg({x},{y})')
      if MODE=='phone': await pg.touchscreen.tap(q['x'],q['y'])
      else: await pg.mouse.click(q['x'],q['y'])
    async def idle(t=30000): await pg.wait_for_function('!G.busy',timeout=t)
    async def btn(id):
      bs=await pg.evaluate('G.btns()');bb=[x for x in bs if x['id']==id]
      if not bb: FAILS.append(f'no button {id} in {await pg.evaluate("G.scene")}');return
      await tapL(bb[0]['x'],bb[0]['y'])
    async def r(): return (await pg.evaluate('G.info()'))['r']
    async def wrongcheck(tag):
      b0=await r();await pg.evaluate('G.wrong()');await pg.wait_for_timeout(150);await idle()
      if await r()!=b0:FAILS.append(tag+' wrong accepted')
    await btn('play');await pg.wait_for_timeout(1500);await pg.screenshot(path=f'{OUT}/01_intro.png')
    await pg.evaluate('G.fast=true');await btn('skip');await pg.wait_for_timeout(600);await idle()
    await pg.screenshot(path=f'{OUT}/02_map.png')
    for lv in range(1,6):
      await tapL(*[(220,470),(440,360),(650,470),(860,360),(1070,450)][lv-1]);await pg.wait_for_timeout(400)
      if await pg.evaluate('G.scene')!=f'l{lv}':FAILS.append(f'map tap l{lv} failed');await pg.evaluate(f'G.go("l{lv}")')
      await idle();print('level',lv,await pg.evaluate('[G.scene,G.LV()&&G.LV().n]'),FAILS,flush=True)
      if lv<5:
        s=await pg.evaluate('G.secretXY()');await tapL(s['x'],s['y']);await pg.wait_for_timeout(300)
        if await pg.evaluate('G.scene')!='secret':FAILS.append(f'secret{lv} no open')
        else:
          await idle();await pg.screenshot(path=f'{OUT}/s{lv}.png');await pg.evaluate('G.wrong()');await idle()
          if await pg.evaluate('G.S.secret[%d]'%(lv-1)):FAILS.append(f'secret{lv} wrong accepted')
          a=(await pg.evaluate('G.info()'))['a'];await btn(f'o{a}');await pg.wait_for_function(f'G.scene=="l{lv}"',timeout=15000);await idle()
          if not await pg.evaluate('G.S.secret[%d]'%(lv-1)):FAILS.append(f'secret{lv} not credited')
      rounds=[3,6,5,6,3][lv-1]
      for rd in range(rounds):
        await idle()
        if rd==0: await pg.wait_for_timeout(300);await pg.screenshot(path=f'{OUT}/l{lv}.png')
        await wrongcheck(f'l{lv} r{rd}')
        if rd==1: await pg.screenshot(path=f'{OUT}/l{lv}_mistake.png')
        info=await pg.evaluate('G.info()')
        if lv==1:
          print('L1',rd,info,flush=True)
          if info['quiz']:
            if info['ans']!=12:FAILS.append('l1 quiz ans')
            await btn(f"q{info['ans']}");await pg.wait_for_timeout(500);print('after q',await pg.evaluate('[G.busy,G.LV().r,G.LV().done,G.btns()]'),flush=True)
          else:
            exp={0:6,1:9}[rd]
            if info['total']!=exp:FAILS.append(f'l1 total {info["total"]}!={exp}')
            for c in info['missing']:
              for d in c: await btn('d'+d);await pg.wait_for_timeout(200)
              await idle()
        elif lv==2:
          await btn('prime' if info['prime'] else 'comp')
        elif lv==3:
          c=await pg.evaluate(f"G.cellXY({info['expect']})");await tapL(c['x'],c['y'])
        elif lv==4:
          await pg.wait_for_function('["go","wait"].includes(G.info().phase)');info=await pg.evaluate('G.info()')
          o=[o for o in info['opts'] if o['prime']]
          if len(o)!=1:FAILS.append(f'l4 primes {info}')
          await tapL(o[0]['x'],o[0]['y'])
        elif lv==5:
          while True:
            await idle();i=await pg.evaluate('G.info()')
            if i['v'] is None or i['r']!=rd:break
            p=[p for p in (2,3,5,7) if i['v']%p==0][0];await btn(f'p{p}');await pg.wait_for_timeout(100)
            if rd==0 and i['v']==6: await pg.screenshot(path=f'{OUT}/l5_tree.png')
        await pg.wait_for_timeout(200);await idle(60000)
        if lv==3 and rd==4:
          if (await pg.evaluate('G.info()'))['primes']!=15:FAILS.append('sieve != 15')
      await idle();await pg.wait_for_timeout(1200);await pg.screenshot(path=f'{OUT}/l{lv}_end.png')
      if not await pg.evaluate('G.LV().done'):FAILS.append(f'l{lv} not done')
      if lv<5: await btn('map');await pg.wait_for_timeout(300)
    await btn('fin');await pg.wait_for_timeout(1500);await pg.screenshot(path=f'{OUT}/99_fin.png')
    st=await pg.evaluate('G.S');print('save',st)
    # fps check at normal speed
    await pg.evaluate('G.fast=false');await pg.evaluate('G.go("l3")');await pg.wait_for_timeout(2500);print('fps',round(await pg.evaluate('G.fps()')))
    print('LOGS',logs[:10]);print('FAILS',FAILS or 'none')
    await b.close()
asyncio.run(main())
