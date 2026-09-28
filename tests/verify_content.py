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
report={'lessons':len(lessons),'passed':count,'failures':failures,'seconds':round(time.monotonic()-t,2)}
(root/'tests/content-results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=True))
sys.exit(bool(failures))
