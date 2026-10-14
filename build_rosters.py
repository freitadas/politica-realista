#!/usr/bin/env python3
"""Gera fichas de candidaturas históricas oficiais para TODAS as UFs e municípios.

Entrada: ZIPs oficiais 'consulta_cand_2026.zip' e 'consulta_cand_2024.zip'.
Saída: rosters/2026/<UF>.json, rosters/2026/BR.json,
       rosters/2024/<UF>/<MUNICIPIO>.json.

Não cria nomes de candidatos; preserva nome de urna e partido da fonte histórica.
"""
import argparse
import csv
import io
import json
import os
import re
import sys
import tempfile
import unicodedata
import urllib.request
import zipfile
from collections import defaultdict
from pathlib import Path

OFFICES = {
    'PRESIDENTE': 'presidente',
    'GOVERNADOR': 'governador',
    'SENADOR': 'senador',
    'DEPUTADO FEDERAL': 'deputado_federal',
    'DEPUTADO ESTADUAL': 'deputado_estadual',
    'DEPUTADO DISTRITAL': 'deputado_estadual',
    'PREFEITO': 'prefeito',
    'VEREADOR': 'vereador',
}
UFS = set('AC AL AM AP BA CE DF ES GO MA MG MS MT PA PB PE PI PR RJ RN RO RR RS SC SE SP TO'.split())
URL = 'https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_{year}.zip'

def normal(s):
    s = unicodedata.normalize('NFD', str(s or ''))
    return ''.join(c for c in s if unicodedata.category(c) != 'Mn').upper().strip()

def slug(s):
    return re.sub(r'-+', '-', re.sub(r'[^A-Z0-9]+', '-', normal(s))).strip('-')

def download(year, dest):
    url=URL.format(year=year)
    print(f'Download oficial {year}: {url}', flush=True)
    req=urllib.request.Request(url,headers={'User-Agent':'MandatoCandidateDataBuilder/1.0 (public open data)'})
    with urllib.request.urlopen(req,timeout=90) as source, open(dest,'wb') as output:
        while True:
            chunk=source.read(1024*1024)
            if not chunk:break
            output.write(chunk)
    if os.path.getsize(dest)<1000:raise RuntimeError(f'ZIP {year} vazio')

def rows_in_zip(zip_path,year):
    with zipfile.ZipFile(zip_path) as archive:
        names=[n for n in archive.namelist() if n.lower().endswith('.csv') and ('consulta_cand' in n.lower())]
        if not names:raise ValueError(f'Não há CSVs de candidatos no ZIP {year}')
        # Prefer a single BRASIL file to avoid double counting when per-UF also exists.
        br=[n for n in names if n.upper().endswith('_BRASIL.CSV')]
        if br: names=br[:1]
        print(f'{year}: lendo {len(names)} CSV(s)',flush=True)
        for member in names:
            with archive.open(member) as binary, io.TextIOWrapper(binary,encoding='latin-1',newline='',errors='replace') as text:
                reader=csv.DictReader(text,delimiter=';',quotechar='"')
                required={'NM_URNA_CANDIDATO','SG_PARTIDO','DS_CARGO','SG_UF'}
                fields={name.lstrip('\ufeff') for name in (reader.fieldnames or [])}
                if not required<=fields:raise ValueError(f'Colunas ausentes: {required-fields} ({member})')
                for record in reader:
                    yield {str(k).lstrip('\ufeff'):v for k,v in record.items() if k}

def write_json(path, value):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(value,ensure_ascii=False,separators=(',',':')),encoding='utf-8')

def build(year, src, target):
    registries=defaultdict(lambda:defaultdict(list))
    seen=defaultdict(set)
    totals=0
    for row in rows_in_zip(src,year):
        uf=normal(row.get('SG_UF'))
        office=OFFICES.get(normal(row.get('DS_CARGO')))
        if not office or (uf not in UFS and uf!='BR'):continue
        if year==2024 and office not in ('prefeito','vereador'):continue
        if year==2026 and office in ('prefeito','vereador'):continue
        if office=='presidente':uf='BR'
        city=normal(row.get('NM_UE') or row.get('NM_MUNICIPIO') or '') if year==2024 else ''
        if year==2024 and not city:continue
        name=str(row.get('NM_URNA_CANDIDATO') or '').strip()
        party=normal(row.get('SG_PARTIDO'))
        if not name or not party or name.startswith('#'):continue
        district=(uf,city) if year==2024 else (uf,)
        key=(district,office)
        # Um candidato não deve aparecer duas vezes por arquivo/UF.
        sq=str(row.get('SQ_CANDIDATO') or '').strip()
        dedupe=sq if sq and sq!='-1' else (normal(name),party)
        if dedupe in seen[key]:continue
        seen[key].add(dedupe)
        registries[district][office].append([name,party])
        totals+=1
    source=URL.format(year=year)
    number_of_files=0
    states=set()
    for district,data in registries.items():
        uf=district[0]
        location=(target/str(year)/uf/(slug(district[1])+'.json')) if year==2024 else (target/str(year)/(uf+'.json'))
        if len(district)==2:
            # distinct 2024 cities could normalize to the same slug; verify no silent overwrites.
            if location.exists():raise ValueError(f'Colisão de município: {district}')
        payload={'year':year,'uf':uf,'source':source,'sourceLabel':f'TSE, candidaturas {year}',
                 'offices':dict(data)}
        if len(district)==2:payload['municipality']=district[1]
        write_json(location,payload)
        number_of_files+=1;states.add(uf)
    print(f'{year}: {totals} candidaturas únicas, {number_of_files} arquivos, {len(states)} UFs',flush=True)
    if year==2026 and (not UFS<=states or 'BR' not in states):
        raise ValueError(f'2026: faltam UFs no cadastro: {sorted(UFS-states)}; BR={"BR" in states}')
    if year==2024 and (not UFS - {'DF'} <= states):
        raise ValueError(f'2024: faltam UFs municipais: {sorted((UFS-{"DF"})-states)}')
    return {'year':year,'totalCandidates':totals,'files':number_of_files,'states':sorted(states)}

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--input-2026',type=Path)
    p.add_argument('--input-2024',type=Path)
    p.add_argument('--output',type=Path,default=Path(__file__).resolve().parents[1]/'rosters')
    p.add_argument('--skip-if-present',action='store_true',help='Não baixará ZIPs quando rosters/manifest.json já estiver válido')
    args=p.parse_args()
    if args.skip_if_present:
        manifest_file=args.output/'manifest.json'
        if manifest_file.is_file():
            old=json.loads(manifest_file.read_text(encoding='utf-8'))
            sources=set(old.get('yearSources') or [])
            if {2024,2026}<=sources:
                print('Cadastro histórico TSE já gerado: mantendo rosters existentes.',flush=True)
                return

    tmpdir=tempfile.TemporaryDirectory()
    try:
        staging=Path(tmpdir.name)/'rosters'
        reports=[]
        for year in (2026,2024):
            src=getattr(args,f'input_{year}')
            if src is None:
                src=Path(tmpdir.name)/f'tse_{year}.zip'
                download(year,src)
            reports.append(build(year,src,staging))
        manifest={'source':'Tribunal Superior Eleitoral — dados abertos','yearSources':[2026,2024], 'reports':reports}
        write_json(staging/'manifest.json',manifest)
        # Only replace the destination after both sources have been processed.
        import shutil
        if args.output.exists():shutil.rmtree(args.output)
        args.output.parent.mkdir(parents=True,exist_ok=True)
        shutil.copytree(staging,args.output)
        print('Manifesto:',json.dumps(manifest,ensure_ascii=False),flush=True)
    finally:
        tmpdir.cleanup()

if __name__=='__main__': main()
