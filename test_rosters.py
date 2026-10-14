import csv, tempfile, zipfile, subprocess, json, sys
from pathlib import Path
from build_rosters import UFS, slug

def fixture(path,year):
    names=['SG_UF','NM_UE','DS_CARGO','NM_URNA_CANDIDATO','SG_PARTIDO','SQ_CANDIDATO']
    target=path/f'consulta_cand_{year}.zip'
    with tempfile.TemporaryDirectory() as t:
        csvfile=Path(t)/f'consulta_cand_{year}_BRASIL.csv'
        with csvfile.open('w',encoding='latin1',newline='') as f:
            w=csv.writer(f,delimiter=';',quotechar='"');w.writerow(names)
            seq=0
            for uf in sorted(UFS | ({'BR'} if year==2026 else set())):
                cargos= (['PRESIDENTE'] if uf=='BR' else ['GOVERNADOR','SENADOR','DEPUTADO FEDERAL','DEPUTADO DISTRITAL' if uf=='DF' else 'DEPUTADO ESTADUAL']) if year==2026 else ['PREFEITO','VEREADOR']
                for cargo in cargos:
                    if year==2024 and uf=='DF':continue
                    for i in range(12):
                        seq+=1
                        w.writerow([uf,'VITÓRIA' if uf=='ES' else 'CIDADE TESTE',cargo,f'Pessoa {uf} {cargo} {i}',('PL' if i%2 else 'PT'),str(seq)])
        with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as z:z.write(csvfile,csvfile.name)
    return target

def run():
    with tempfile.TemporaryDirectory() as t:
        root=Path(t);zip26=fixture(root,2026);zip24=fixture(root,2024);out=root/'rosters'
        cmd=[sys.executable,str(Path(__file__).with_name('build_rosters.py')),'--input-2026',str(zip26),'--input-2024',str(zip24),'--output',str(out)]
        subprocess.run(cmd,check=True,capture_output=False)
        assert (out/'2026'/'BR.json').is_file()
        assert len(list((out/'2026').glob('*.json')))==28
        assert len(list((out/'2024').rglob('*.json')))==26
        es=json.loads((out/'2024'/'ES'/'VITORIA.json').read_text())
        assert len(es['offices']['vereador'])==12
        assert es['offices']['prefeito'][1][0].startswith('Pessoa ES')
        df=json.loads((out/'2026'/'DF.json').read_text())
        assert 'deputado_estadual' in df['offices']
        sp=json.loads((out/'2026'/'SP.json').read_text())
        assert len(sp['offices'])==4
        print('OK: 27 UFs, BR, municipais, cargos, nomes e partidos')
        return out
if __name__=='__main__':run()
