import {loadPyodide} from './vendor/pyodide/pyodide.mjs';
let runtime;
try {
  runtime = await loadPyodide({indexURL:new URL('./vendor/pyodide/',import.meta.url).href});
  runtime.runPython(`
import sys, io, json, traceback, time
class _LimitedOutput(io.StringIO):
    def write(self, text):
        if self.tell() + len(text) > 16000:
            raise RuntimeError('Вывод больше 16000 символов. Проверь цикл и print().')
        return super().write(text)
def _execute(code, data):
    before = (sys.stdin, sys.stdout, sys.stderr)
    out, err = _LimitedOutput(), _LimitedOutput()
    sys.stdin = io.TextIOWrapper(io.BytesIO(data.encode('utf-8')))
    sys.stdout, sys.stderr = out, err
    started = time.perf_counter()
    failure = None
    try:
        exec(compile(code, 'solution.py', 'exec'), {'__name__': '__main__'})
    except SystemExit as e:
        if e.code not in (None, 0):
            failure = 'SystemExit: ' + str(e.code)
    except BaseException:
        failure = traceback.format_exc()
    finally:
        sys.stdin, sys.stdout, sys.stderr = before
    return json.dumps({'output':out.getvalue(), 'stderr':err.getvalue(), 'error':failure, 'ms':round((time.perf_counter()-started)*1000, 1)}, ensure_ascii=False)
`);
  self.postMessage({type:'ready',version:runtime.runPython('sys.version.split()[0]')});
} catch(e) {self.postMessage({type:'init-error',error:String(e)});}
self.onmessage = async ({data}) => {
  if (!runtime) return;
  const {id,code,cases} = data;
  try {
    for (let i=0;i<cases.length;i++) {
      self.postMessage({type:'case-start',id,index:i});
      runtime.globals.set('_code_to_run',code);
      runtime.globals.set('_stdin_to_run',cases[i].input);
      const result = JSON.parse(runtime.runPython('_execute(_code_to_run, _stdin_to_run)'));
      self.postMessage({type:'case-result',id,index:i,...result});
      if(result.error) break;
    }
    self.postMessage({type:'done',id});
  } catch(e) { self.postMessage({type:'failed',id,error:String(e)}); }
};
