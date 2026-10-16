# Настоящие тапы (hasTouch, мобильная эмуляция) на 844x390, 667x375, 932x430: на каждом уровне и в каждой тайной комнате —
# нарочная ошибка, исправление, отмена правильного хода (цифра кода), прохождение до финала; ввод открыт <=600 мс после ошибки.
# python tools/test_touch.py   (сервер: python3 -m http.server 18591 в корне игры)
import asyncio,os,time,sys
from playwright.async_api import async_playwright
URL='http://127.0.0.1:18591/index.html'
VPS=[(844,390),(667,375),(932,430)]
if os.environ.get('VPS'):VPS=[tuple(map(int,v.split('x'))) for v in os.environ['VPS'].split(',')]
ROUNDS=[3,6,5,6,3]
async def run(b,W,H,F,R):
  tag=f'{W}x{H}';out=f'shots/touch/{tag}';os.makedirs(out,exist_ok=True)
  ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=True,is_mobile=True,device_scale_factor=2)
  pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
  await pg.goto(URL);await pg.evaluate('localStorage.clear()');await pg.reload();await pg.wait_for_timeout(2500)
  await pg.evaluate('G.fast=true;SV.open=5')
  ev=pg.evaluate
  async def tap(x,y,w=230):
    q=await ev(f'G.pg({x},{y})');await pg.touchscreen.tap(q['x'],q['y']);await pg.wait_for_timeout(w)
  async def btn(i,w=230):
    bb=[x for x in await ev('G.btns()') if x['id']==i]
    if not bb:F.append(f'{tag} {await ev("G.scene")}: no btn {i}');return False
    await tap(bb[0]['x'],bb[0]['y'],w);return True
  async def hitcheck(where):
    for s in await ev("UI.filter(b=>!b.dis).map(b=>({id:b.id,w:Math.max(b.w+12,56/S)*S,h:Math.max(b.h+12,56/S)*S})).filter(b=>b.w<56||b.h<56)"):F.append(f'{tag} {where}: btn {s["id"]} hit {s["w"]:.0f}x{s["h"]:.0f}')
  READY="(()=>{if(G.locked())return false;const L=G.LV();if(L&&L.n===4&&!['go','wait'].includes(L.phase))return false;return true})()"
  async def after_mistake(where,m0,shot=None):
    t=time.time()
    while await ev('G.scene=="secret"?0:G.LV().mist')<=m0 and time.time()-t<4:await pg.wait_for_timeout(20)
    t=time.time()
    while not await ev(READY) and time.time()-t<5:await pg.wait_for_timeout(20)
    ms=(time.time()-t)*1000;R.append(f'{tag} {where}: input open {ms:.0f} ms after mistake')
    if ms>600:F.append(f'{tag} {where}: input locked {ms:.0f} ms after mistake')
    if shot and W==844:await pg.wait_for_timeout(120);await pg.screenshot(path=f'{out}/{shot}.png')
  async def waitround(r0,lv,t=25):
    t0=time.time()
    while await ev('G.LV().r')==r0 and not await ev('G.LV().done') and time.time()-t0<t:await pg.wait_for_timeout(40)
    if await ev('G.LV().r')==r0 and not await ev('G.LV().done'):F.append(f'{tag} l{lv} r{r0}: correct answer not accepted');return False
    t0=time.time()
    while not await ev(READY) and not await ev('G.LV().done') and time.time()-t0<25:await pg.wait_for_timeout(40)
    return True
  for lv in range(1,6):
    await ev(f'G.go("l{lv}")');await pg.wait_for_timeout(600)
    if await ev('G.locked()'):F.append(f'{tag} l{lv}: locked during intro voice')
    for rd in range(ROUNDS[lv-1]):
      if await ev('G.LV().done'):break
      info=await ev('G.info()');m0=await ev('G.LV().mist');first=rd==0
      if lv==1:
        if info['quiz']:
          await hitcheck('l1 quiz');wrong=[v for v in [7,12,16] if v!=info['ans']][0]
          await btn(f'q{wrong}');await after_mistake('l1 quiz',m0)
          if not await ev(f'UI.find(b=>b.id=="q{wrong}").dis'):F.append(f'{tag} l1 quiz: wrong option not greyed')
          await btn(f"q{info['ans']}")
        else:
          await hitcheck('l1')
          L=await ev('({ds:G.LV().R.ds,len:G.LV().R.len,rep:G.LV().R.rep,found:G.LV().found})')
          if first:  # ошибка: повтор цифры, затем исправление; отмена правильной цифры тапом по плитке
            d=L['ds'][0];bad=str(d)*2+str(L['ds'][1]) if not L['rep'] else None
            if bad:
              for c in bad[:L['len']]:await btn('d'+c)
              await after_mistake('l1 code',m0,'l1_mistake')
            await btn('d'+str(info['missing'][0][0]))
            if await ev('G.LV().cur.length')!=1:F.append(f'{tag} l1: digit after mistake not accepted')
            await tap(465-(L['len']-1)*53,225)
            if await ev('G.LV().cur.length')!=0:F.append(f'{tag} l1: undo of a correct digit (tap on tile) failed')
            await btn('d'+str(info['missing'][0][0]));await btn('del')
            if await ev('G.LV().cur.length')!=0:F.append(f'{tag} l1: «Стереть» did not remove the digit')
            if W==844:await pg.screenshot(path=f'{out}/l1_fixed.png')
          for c in (await ev('G.info()'))['missing']:
            for d in c:await btn('d'+d)
            await pg.wait_for_timeout(120)
      elif lv==2:
        await hitcheck('l2')
        if first:
          await btn('comp' if info['prime'] else 'prime');await after_mistake('l2',m0,'l2_mistake')
        await btn('prime' if info['prime'] else 'comp')
        if first and W==844:await pg.wait_for_timeout(300);await pg.screenshot(path=f'{out}/l2_fixed.png')
      elif lv==3:
        if first:
          c=await ev('G.cellXY(4)');await tap(c['x'],c['y']);await after_mistake('l3',m0,'l3_mistake')
        c=await ev(f"G.cellXY({info['expect']})");await tap(c['x'],c['y'])
        if first and W==844:await pg.wait_for_timeout(300);await pg.screenshot(path=f'{out}/l3_fixed.png')
      elif lv==4:
        await pg.wait_for_function('["go","wait"].includes(G.info().phase)',timeout=20000);info=await ev('G.info()')
        if first:
          o=[o for o in info['opts'] if not o['prime']][0];await tap(o['x'],o['y']);await after_mistake('l4',m0,'l4_mistake')
          info=await ev('G.info()')
          if not [o for o in info['opts'] if o['tried']]:F.append(f'{tag} l4: wrong carriage not greyed')
        o=[o for o in info['opts'] if o['prime']][0];await tap(o['x'],o['y'])
        if first and W==844:await pg.wait_for_timeout(500);await pg.screenshot(path=f'{out}/l4_fixed.png')
      elif lv==5:
        await pg.wait_for_function('G.info().v!=null',timeout=20000);await hitcheck('l5');mk=False
        while True:
          i=await ev('G.info()')
          if i['v'] is None or i['r']!=rd:break
          if first and not mk:
            mk=True;p=[p for p in [2,3,5,7] if i['v']%p][0];await btn(f'p{p}');await after_mistake('l5',m0,'l5_mistake')
            if W==844:await pg.wait_for_timeout(1);
          p=[p for p in [2,3,5,7] if i['v']%p==0][0];await btn(f'p{p}');await pg.wait_for_timeout(250)
          if first and W==844 and mk and not os.path.exists(f'{out}/l5_fixed.png'):await pg.screenshot(path=f'{out}/l5_fixed.png')
      if not await waitround(rd,lv):break
    if not await ev('G.LV().done'):F.append(f'{tag} l{lv}: not finished');continue
    R.append(f'{tag} l{lv}: finished, mistakes {await ev("G.LV().mist")}')
    if lv<5:
      await ev(f'SV.secret[{lv-1}]=0;go("secret",{lv})');await pg.wait_for_timeout(500);await hitcheck(f'secret{lv}')
      a=(await ev('G.info()'))['a'];await btn(f'o{(a+1)%3}')
      t=time.time()
      while await ev('G.locked()') and time.time()-t<3:await pg.wait_for_timeout(20)
      ms=(time.time()-t)*1000
      if ms>600:F.append(f'{tag} secret{lv}: locked {ms:.0f} ms')
      if lv==1 and W==844:await pg.screenshot(path=f'{out}/s1_mistake.png')
      await btn(f'o{a}');await pg.wait_for_timeout(300)
      if not await ev(f'SV.secret[{lv-1}]'):F.append(f'{tag} secret{lv}: right answer after mistake not accepted')
      else:R.append(f'{tag} secret{lv}: wrong then right ok ({ms:.0f} ms)')
  await ev('G.go("l5")');await pg.wait_for_timeout(300);await ev('G.go("fin")');await pg.wait_for_timeout(1200);await hitcheck('fin')
  if await ev('G.scene')!='fin':F.append(f'{tag}: finale not reached')
  F.extend(f'{tag} JSERR {e}' for e in errs);await ctx.close()
async def main():
  F=[];R=[]
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    for W,H in VPS:await run(b,W,H,F,R)
    await b.close()
  print('\n'.join(R));print('FAILS',F);print('PASS' if not F else 'FAIL')
asyncio.run(main())
