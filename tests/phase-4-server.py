"""Local static QA server with production-like extensionless paths and 404 status."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit
from pathlib import Path

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        path = urlsplit(self.path).path
        if path != '/' and not Path(self.translate_path(path)).exists():
            if Path(self.translate_path(path+'.html')).is_file():
                self.path = path+'.html'
            else:
                body = Path('404.html').read_bytes()
                self.send_response(404)
                self.send_header('Content-Type','text/html; charset=utf-8')
                self.send_header('Content-Length',str(len(body)))
                self.end_headers()
                self.wfile.write(body)
                return
        super().do_GET()

ThreadingHTTPServer(('127.0.0.1',4173),Handler).serve_forever()
