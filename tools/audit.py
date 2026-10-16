# text layout audit: python tools/audit.py [WxH ...]  -> tools/audit_flags.json, shots/audit/
import asyncio,sys,json,os
from playwright.async_api import async_playwright
URL='http://127.0.0.1:18591/index.html'
VPS=sys.argv[1:] or ['740x360','844x390','932x430','1280x720','1440x900']
LN=json.load(open('tools/lines.json'));KEYS=[o['k'] for o in LN]
def scene_of(k):
    if k in('p1','p2','p3','p4','p5','p6'):return 'intro'
    if k=='map':return 'map'
    if k.startswith('l1'):return 'l1'
    if k.startswith('l2') or k.startswith('n'):return 'l2'
    if k.startswith('l3'):return 'l3'
    if k.startswith('l4'):return 'l4'
    if k.startswith('l5') or k.startswith('b'):return 'l5'
    if k.startswith('s'):return 'secret'
    return 'fin'
BAN={'l2':["9 = 3 × 3 — составное.","Тупик! 91 = 7 × 13 — составное."],'l3':['Сначала нажми на число 1.','49 = 7 × 7 — составное, его смоет вода.','47 простое, но сначала самое маленькое: 7.'],'l4':['Тупик! 49 = 7 × 7 — составное.'],'l5':['Не делится нацело! Попробуй другое простое число.']}
async def main():
  allf={}
  async with async_playwright() as p:
    b=await p.chromium.launch()
    for vp in VPS:
      w,h=map(int,vp.split('x'));ph=h<500
      ctx=await b.new_context(viewport={'width':w,'height':h},has_touch=ph,is_mobile=ph,device_scale_factor=2 if ph else 1)
      pg=await ctx.new_page();await pg.goto(URL);await pg.evaluate('localStorage.clear()');await pg.reload();await pg.wait_for_timeout(2500)
      await pg.add_script_tag(path='tools/audit.js');await pg.evaluate('AC&&AC.suspend&&AC.suspend()')
      out=[];os.makedirs(f'shots/audit/{vp}',exist_ok=True)
      async def aud(tag,shot=False):
        await pg.wait_for_timeout(350);r=await pg.evaluate('AUDIT()')
        for f in r['flags']:out.append([tag]+f)
        if shot or r['flags']:await pg.screenshot(path=f'shots/audit/{vp}/{tag}.png')
      for sc in ['title','intro','map','l1','l2','l3','l4','l5','secret','fin']:
        if sc=='secret':await pg.evaluate('go("secret",1)')
        else:await pg.evaluate(f'G.go("{sc}")')
        await pg.wait_for_timeout(900);await pg.evaluate('talk=null;if(skipTalk)skipTalk();');await aud(sc+'_plain',True)
        for k in KEYS:
          if scene_of(k)!=sc:continue
          await pg.evaluate(f'talk={{who:LINES["{k}"].who,text:LINES["{k}"].t,k:"{k}",t0:T-1}}');await aud(sc+'_'+k)
        await pg.evaluate('talk=null')
        for i,t in enumerate(BAN.get(sc,[])):
          await pg.evaluate(f'banner({json.dumps(t)},"#ffd0d0",600)');await aud(f'{sc}_ban{i}',i==0)
          await pg.evaluate(f'talk={{who:"iskorka",text:LINES["l2w"].t,k:"x",t0:T-1}}');await aud(f'{sc}_bantalk{i}');await pg.evaluate('talk=null')
        if sc.startswith('l'):
          await pg.evaluate('LV.banner=null;LV.done=true;LV.doneT=T-3;LV.stars=2;LV.mist=3');await aud(sc+'_victory',True)
      allf[vp]=out;print(vp,len(out),flush=True)
      await ctx.close()
    await b.close()
  json.dump(allf,open('tools/audit_flags.json','w'),ensure_ascii=False,indent=0)
  tot=sum(len(v) for v in allf.values());print('TOTAL',tot)
  from collections import Counter
  c=Counter((f[1],f[2] if len(f)>2 else '') for v in allf.values() for f in v);[print(x) for x in c.most_common(40)]
asyncio.run(main())
