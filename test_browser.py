import asyncio, json, shutil, subprocess, sys, tempfile, threading, http.server, socketserver
from pathlib import Path
from playwright.async_api import async_playwright
sys.path.insert(0,str(Path(__file__).resolve().parent))
from test_rosters import fixture
P=Path(__file__).resolve().parents[1]

class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass

async def run():
 with tempfile.TemporaryDirectory() as tmp:
  root=Path(tmp)/'www';shutil.copytree(P,root,ignore=shutil.ignore_patterns('*.pyc','__pycache__','rosters'))
  z2026=fixture(Path(tmp),2026);z2024=fixture(Path(tmp),2024)
  subprocess.run([sys.executable,str(root/'scripts'/'build_rosters.py'),'--input-2026',str(z2026),'--input-2024',str(z2024),'--output',str(root/'rosters')],check=True,stdout=subprocess.DEVNULL)
  fixtures={str(path.relative_to(root)):json.loads(path.read_text()) for path in (root/'rosters').rglob('*.json')}
  async with async_playwright() as pw:
    browser=await pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    page=await browser.new_page(viewport={'width':1200,'height':850})
    errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
    await page.set_content((root/'index.html').read_text().replace('<head>','<head><base href="https://mandato.example/">',1))
    await page.add_style_tag(content=(root/'styles.css').read_text())
    await page.evaluate("""()=>{window.__store={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem(k){return window.__store[k]??null},setItem(k,v){window.__store[k]=v},removeItem(k){delete window.__store[k]}}})}""")
    await page.evaluate(r"""data=>{window.__fixtures=data;window.fetch=async url=>{const key=new URL(String(url)).pathname.replace(/^\//,'');let data=window.__fixtures[key];return{ok:!!data,status:data?200:404,json:async()=>data}};}""",fixtures)
    await page.add_script_tag(content=(root/'real_candidates.js').read_text())
    await page.add_script_tag(content=(root/'app.js').read_text())
    async def select_and_start(office,uf,city=None):
     await page.click('#newCareerSetup')
     await page.fill('#candidateName','Rafael Andrade')
     await page.click('#setupNextStep')
     await page.select_option('#officeChoice',office)
     if uf is not None:await page.select_option('#stateChoice',uf)
     if city is not None:await page.fill('#cityChoice',city)
     await page.click('#startGame')
     await page.wait_for_function('!document.getElementById("game").classList.contains("hidden")')
     saved=await page.evaluate('JSON.parse(window.__store.mandato_save_v1)')
     assert saved['office']==office and saved['opponents'] and saved['opponents'][0]['name'].startswith('Pessoa '),saved.get('opponents')
     return saved
    # 2026 in two different UFs + DF
    await select_and_start('governador','SP');print('OK governo SP')
    await page.evaluate("()=>{window.confirm=()=>true;document.getElementById('newGame').click()}")
    await select_and_start('senador','DF');print('OK senador DF')
    await page.evaluate("()=>{window.confirm=()=>true;document.getElementById('newGame').click()}")
    await select_and_start('vereador','AM','CIDADE TESTE');print('OK vereador AM')
    await page.evaluate('''()=>{
      const s=JSON.parse(window.__store.mandato_save_v1);
      s.week=1;s.pendingEvent=null;s.pendingDebate=null;s.debateAvailable=null;
      window.__store.mandato_save_v1=JSON.stringify(s);
      document.getElementById('game').classList.add('hidden');
      document.getElementById('setup').classList.remove('hidden');
      document.getElementById('loadGameSetup').click();
      document.getElementById('nextTurn').click();
    }''')
    await page.wait_for_function('document.querySelector("#apuracaoContent #tallySearch") !== null')
    state=await page.evaluate('JSON.parse(window.__store.mandato_save_v1)')
    a=state['apuracao']
    assert state['phase']=='counting' and len(a["candidates"])>=12
    assert all('Candidato fict' not in c['name'] and 'Sem cadastro' not in c['name'] for c in a['candidates'])
    assert sum(c['votes'] for c in a['candidates'])==a['validVotes']
    assert await page.locator('#apuracaoContent .count-candidate').count()<=30
    await page.fill('#tallySearch','Pessoa AM')
    assert await page.locator('#apuracaoContent .count-candidate').count()>0
    for i in range(7):await page.evaluate('window.__game.advanceApuracao()')
    state=await page.evaluate('JSON.parse(window.__store.mandato_save_v1)')
    assert state['apuracao']['hourIndex']==7
    print('OK apuração AM, busca, votos, horas')
    assert not errors,errors
    print('OK navegador sem erros',len(errors))
    await browser.close()

asyncio.run(run())
