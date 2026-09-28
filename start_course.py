"""Read-only localhost server. Python exercises execute in browser WebAssembly."""
import argparse, functools, mimetypes, threading, webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
ROOT = Path(__file__).resolve().parent
PORT = 8766
mimetypes.add_type('application/wasm', '.wasm')
mimetypes.add_type('text/javascript', '.mjs')
class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('X-Content-Type-Options','nosniff')
        self.send_header('Cache-Control','no-cache')
        self.send_header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'")
        super().end_headers()
    def do_GET(self):
        if self.path.split('?')[0] == '/health':
            body=b'{"app":"semifinal-python-workshop","version":1}'
            self.send_response(200);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body);return
        super().do_GET()
    def list_directory(self,path):
        self.send_error(404)
def main():
    parser=argparse.ArgumentParser();parser.add_argument('--no-browser',action='store_true');args=parser.parse_args()
    url=f'http://127.0.0.1:{PORT}/'
    try:
        server=ThreadingHTTPServer(('127.0.0.1',PORT),functools.partial(Handler,directory=str(ROOT)))
    except OSError:
        from urllib.request import build_opener, ProxyHandler
        try:
            health=build_opener(ProxyHandler({})).open(url+'health',timeout=2).read()
            if b'semifinal-python-workshop' not in health:raise RuntimeError()
        except Exception:
            print('Port 8766 is occupied by another program. Close it or change PORT in start_course.py.');input('Press Enter to close.');return
        if not args.no_browser:webbrowser.open(url)
        return
    if not args.no_browser:threading.Timer(.5,lambda:webbrowser.open(url)).start()
    print(f'Python workshop: {url}\nKeep this window open. Ctrl+C stops the server.',flush=True)
    try:server.serve_forever()
    except KeyboardInterrupt:pass
    finally:server.server_close()
if __name__=='__main__':main()
