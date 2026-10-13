"""Local dev server for the Grablab site: same as `python -m http.server 8099`,
but tells the browser never to cache, so every reload shows the latest files.
Run from this folder:  python serve.py
"""
import http.server, socketserver, os, sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8099
os.chdir(os.path.dirname(os.path.abspath(__file__)))

class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        # the physics lab: SimArena (app.simarena.ai) fetches lab/*.json from this machine
        if self.path.startswith("/lab/"):
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Headers", "*")
            self.send_header("Access-Control-Allow-Private-Network", "true")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

if __name__ == "__main__":
    with Server(("", PORT), NoCache) as httpd:
        print(f"Grablab dev server (no-cache) on http://localhost:{PORT}")
        httpd.serve_forever()
