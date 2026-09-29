import io, json, sys, time, traceback
from pathlib import Path
root=Path(__file__).resolve().parents[1]
lessons=json.loads((root/'curriculum.json').read_text(encoding='utf-8'))
failures=[];count=0;t=time.monotonic()
for lesson in lessons:
    for index,case in enumerate(lesson['tests']):
        before=(sys.stdin,sys.stdout,sys.stderr)
        out=io.StringIO()
        try:
            sys.stdin=io.TextIOWrapper(io.BytesIO(case['input'].encode()))
            sys.stdout=out;sys.stderr=io.StringIO()
            exec(compile(lesson['solution'],'solution.py','exec'),{'__name__':'__main__'})
            assert out.getvalue().split()==case['expected'].split(),(out.getvalue()[:300],case['expected'][:300])
            count+=1
        except BaseException as ex:
            failures.append({'lesson':lesson['id'],'case':index,'error':str(ex)})
        finally:sys.stdin,sys.stdout,sys.stderr=before
ids={lesson['id'] for lesson in lessons}
for lesson in lessons:
    try:compile(lesson['starter'],'starter.py','exec')
    except SyntaxError as ex:failures.append({'lesson':lesson['id'],'case':'starter','error':str(ex)})
    quiz=lesson['quiz']
    if len(lesson['hints'])!=3 or not 0<=quiz['answer']<len(quiz['options']) or lesson.get('parent',lesson['id']) not in ids:
        failures.append({'lesson':lesson['id'],'case':'structure','error':'hints, quiz or parent'})
def run(code,data=''):
    before=(sys.stdin,sys.stdout,sys.stderr);out=io.StringIO()
    try:
        sys.stdin=io.TextIOWrapper(io.BytesIO(data.encode()));sys.stdout=out;sys.stderr=io.StringIO()
        exec(compile(code,'theory.py','exec'),{'__name__':'__main__'});return out.getvalue(),None
    except SyntaxError as ex:return out.getvalue(),'SyntaxError: '+ex.msg
    except Exception as ex:return out.getvalue(),f'{type(ex).__name__}: {ex}'
    finally:sys.stdin,sys.stdout,sys.stderr=before
clean=lambda s:'\n'.join(x.rstrip() for x in s.rstrip().split('\n')) if s.strip() else ''
passes=lambda code,tests:all((lambda o,e:not e and o.split()==t['expected'].split())(*run(code,t['input'])) for t in tests)
drills=[]
for lesson in lessons:
    if lesson.get('day') and not lesson.get('deep'):failures.append({'lesson':lesson['id'],'case':'theory','error':'no deep theory'})
    for block in lesson.get('deep',[]):
        kind,where=block['type'],f"{lesson['id']}/{block.get('id',block['type'])}";ok=True
        if kind=='code' and 'output' in block:out,err=run(block['code'],block['input']);ok=not err and clean(out)==block['output']
        elif kind=='predict':out,err=run(block['code'],block['input']);ok=not err and clean(out)==block['answer']!=''
        elif kind=='fill':parts=block['code'].split('___');ok=len(parts)==len(block['answers'])+1 and passes(parts[0]+''.join(a+q for a,q in zip(block['answers'],parts[1:])),block['tests'])
        elif kind=='mini':ok=passes(block['solution'],block['tests']) and not passes(block['starter'],block['tests'])
        elif kind=='mistake':wo,we=run(block['wrong'],block['input']);ro,re_=run(block['right'],block['input']);ok=(we or clean(wo))==block['wrongOut'] and not re_ and clean(ro)==block['rightOut']
        if block.get('id'):drills.append(block['id'])
        if not ok:failures.append({'lesson':lesson['id'],'case':where,'error':'theory block does not match'})
if len(drills)!=len(set(drills)):failures.append({'lesson':'*','case':'theory','error':'duplicate drill ids'})
report={'lessons':len(lessons),'passed':count,'theoryDrills':len(drills),'failures':failures,'seconds':round(time.monotonic()-t,2)}
(root/'tests/content-results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=True))
sys.exit(bool(failures))
