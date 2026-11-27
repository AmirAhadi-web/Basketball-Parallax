#!/usr/bin/env python3
"""Dev server for BLACKTOP — same as `python -m http.server` but sends
Cache-Control: no-store so the live preview always shows the latest files.

Usage: python3 scripts/serve.py [port]   (default 8080)
"""
import http.server
import socketserver
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):  # quieter logs
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))


class ReuseTCPServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True


if __name__ == "__main__":
    with ReuseTCPServer(("0.0.0.0", PORT), NoCacheHandler) as httpd:
        print(f"BLACKTOP dev server → http://0.0.0.0:{PORT} (no-cache)", flush=True)
        httpd.serve_forever()
