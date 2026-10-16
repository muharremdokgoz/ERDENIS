"""Local preview server: like `python -m http.server`, but serves 404.html for unknown paths
(as GitHub Pages does), so /team, /reports etc. work when opened directly.
Usage: python serve.py [port]"""
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_head(self):
        path = self.translate_path(self.path)
        import os
        if not os.path.exists(path):
            self.path = "/404.html"
            self.send_response_only(404)
            f = open(self.translate_path(self.path), "rb")
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(os.fstat(f.fileno()).st_size))
            self.end_headers()
            return f
        return super().send_head()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    ThreadingHTTPServer(("", port), Handler).serve_forever()
