"""Browser regression of v15: manual fictional fallback, government delivery, historic career.
Run: python3 scripts/test_integrated_v15.py
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json, tempfile, subprocess, sys
from test_rosters import fixture
P=Path(__file__).resolve().parents[1]

def readstate(page):
    return page.evaluate('JSON.parse(window.__store.mandato_save_v1)')

def setstate(page,state):
    page.evaluate('(s)=>{window.__store.mandato_save_v1=JSON.stringify(s);document.getElementById("game").classList.add("hidden");document.getElementById("setup").classList.remove("hidden");document.getElementById("loadGameSetup").click()}',state)

def main():
  with tempfile.TemporaryDirectory() as tmp:
    fixtures={}
    z26=fixture(Path(tmp),2026)
    z24=fixture(Path(tmp),2024)
    cmd=[sys.executable,str(P/'scripts'/'build_rosters.py'),'--input-2026',str(z26),'--input-2024',str(z24),'--output',str(Path(tmp)/'rosters')]
    subprocess.run(cmd,check=True,capture_output=True,text=True)
    # copy fixture paths for both years
    fixtures={str(p.relative_to(Path(tmp))):json.loads(p.read_text()) for p in (Path(tmp)/'rosters').rglob('*.json')}
    with sync_playwright() as w:
      browser=w.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
      page=browser.new_page(viewport={'width':375,'height':812})
      errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
      page.set_content((P/'index.html').read_text().replace('<head>','<head><base href="https://mandato.example/">',1))
      page.add_style_tag(content=(P/'styles.css').read_text())
      page.evaluate('''()=>{window.__store={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>window.__store[k]??null,setItem:(k,v)=>window.__store[k]=v,removeItem:k=>delete window.__store[k]}})}''')
      page.evaluate("""data=>{window.__fixtures=data;window.fetch=async url=>{const key=new URL(String(url)).pathname.replace(/^\\//,'');const data=window.__fixtures[key];return{ok:!!data,status:data?200:404,json:async()=>data}}} """,fixtures)
      page.add_script_tag(content=(P/'real_candidates.js').read_text())
      page.add_script_tag(content=(P/'app.js').read_text())
      page.evaluate("()=>{window.confirm=()=>true;window.alert=()=>{}}")
      page.click('#newCareerSetup');page.fill('#candidateName','Rafael Andrade');page.click('#setupNextStep')
      page.select_option('#officeChoice','governador');page.select_option('#stateChoice','SP')
      page.click('#startGame');page.wait_for_function('!document.getElementById("game").classList.contains("hidden")')
      state=readstate(page)
      assert state['rosterMode']=='historic' and state['office']=='governador'
      assert all('fictício' not in o['name'].lower() for o in state['opponents'])
      print('OK 1: candidatos históricos de SP')
      # Government simulated from election result. Existing state model is reused, without bypassing the game's action functions.
      state.update({'phase':'government','finished':False,'week':0,'energy':3,'administration':{'month':1,'maxMonths':48,'approval':56,'congress':80,'inflation':5.8,'unemployment':8.4,'gdp':1.6,'debt':74,'health':48,'education':49,'security':45,'budget':80,'coalition':15,'policies':[],'history':[]},'careerHistory':[{'kind':'mandate','office':'prefeito','district':'São Paulo / SP','party':'PT','result':'eleito','status':'em curso','months':1,'total':48,'approval':56,'vote':38,'round':1,'election':1,'year':2028}]})
      setstate(page,state)
      page.evaluate("window.__game.governmentPolicy('health')")
      new=readstate(page)
      assert len(new['administration']['policies'])==1,new['administration']['policies']
      project=new['administration']['policies'][0]
      assert project['status']=='em execução' and new['administration']['health']==48,project
      print('OK 2: projeto aprovado, sem efeito imediato')
      for i in range(6):
        page.evaluate("()=>{document.getElementById('nextTurn').click()}")
      new=readstate(page)
      project=new['administration']['policies'][0]
      assert project['status'] in ('entregue','atrasado','em execução')
      if project['status']=='entregue':assert new['administration']['health']>48
      print('OK 3: mês de governo avança execução e atualiza indicadores após entrega')
      page.evaluate("()=>{window.confirm=()=>true;window.prompt=()=>null}")
      page.evaluate("()=>{window.__game.changeCareerDraft('party','FICTICIO')}")
      before=readstate(page);status=before['careerHistory'][-1]['status']
      page.evaluate("()=>window.__game.startNextCampaign()")
      page.wait_for_timeout(100)
      after=readstate(page)
      assert after['phase']=='government' and after['careerHistory'][-1]['status']==status,after['careerHistory'][-1]
      print('OK 4: cancelar novo partido preserva mandato')
      # History must affect next campaign without overwriting the recorded office
      page.evaluate("()=>{window.prompt=()=> 'Partido Novo Teste'}")
      page.evaluate("()=>window.__game.startNextCampaign()")
      page.wait_for_timeout(200)
      migrated=readstate(page)
      assert migrated['phase']=='campaign' and migrated['campaignNumber']==2
      assert migrated['careerHistory'][-1]['status']!='em curso'
      assert migrated['rosterMode']=='historic'
      print('OK 5: próxima campanha preserva histórico')
      # explicit fictional fallback in another city not found in fixture
      page.evaluate("()=>{window.confirm=()=>true;document.getElementById('newGame').click()}")
      page.click('#newCareerSetup');page.click('#setupNextStep')
      page.select_option('#officeChoice','vereador');page.select_option('#stateChoice','GO');page.fill('#cityChoice','Cidade Sem Cadastro')
      page.click('#startGame');page.wait_for_function('!document.getElementById("game").classList.contains("hidden")')
      fallback=readstate(page)
      assert fallback['rosterMode']=='fictional' and len(fallback['opponents'])>0
      assert all('fictício' in o['name'] for o in fallback['opponents'])
      print('OK 6: sem cadastro => modo fictício explícito e não bloqueado')
      # Full fictional counting flow (proportional) & save consistency
      fallback.update({'week':1,'pendingDebate':None,'debateAvailable':None,'pendingEvent':None})
      setstate(page,fallback)
      page.evaluate('document.getElementById("nextTurn").click()')
      ap=readstate(page)
      assert ap['phase']=='counting'
      assert all('SIMULADA' in c['name'] or c['name']==ap['candidate'] for c in ap['apuracao']['candidates'])
      assert sum(c['votes'] for c in ap['apuracao']['candidates'])==ap['apuracao']['validVotes']
      print('OK 7: apuração fictícia auditável e conservação de votos')
      viewport=page.evaluate('({scroll:document.documentElement.scrollWidth,width:window.innerWidth})')
      assert viewport['scroll']<=viewport['width']+1, viewport
      print('OK 8: sem rolagem horizontal em 375px')
      assert not errors,errors
      print('OK 9: sem erros JavaScript')
      page.screenshot(path=str(P/'preview-v15-mobile.png'),full_page=True)
      browser.close()
if __name__=='__main__':main()
