import asyncio,sys
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:18591/index.html'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required']);pg=await b.new_page(viewport={'width':844,'height':390})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
    await pg.goto(URL);await pg.evaluate("localStorage.clear()");await pg.reload();await pg.wait_for_function("G.scene==='title'||scene==='title'",timeout=30000)
    await pg.evaluate("SV.open=5;save&&save()")
    for n in range(1,6):
      for hop in ['map','title','l%d'%(n%5+1)]:
        await pg.evaluate(f"go('l{n}')");await pg.wait_for_timeout(1800)
        await pg.evaluate(f"go('{hop}')");await pg.wait_for_timeout(300)
        await pg.evaluate(f"go('l{n}')");await pg.wait_for_timeout(6000)
        s=await pg.evaluate("({r:LV.r,done:LV.done,busy:G._busy,ps:PS.length,talk:!!talk,n:LV.n,sc:scene})")
        print(n,hop,s)
        if s['r']!=0 or s['done']: print('FAIL stale progress',n,hop)
    print('ERRS',errs[:5])
    await b.close()
asyncio.run(main())
