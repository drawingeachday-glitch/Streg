"""Local launcher for the current STREG checkout.

The server deliberately reads files from this folder on every request. That
keeps the desktop launcher, browser testing, and GitHub Pages on the exact same
version instead of maintaining a second embedded copy of index.html.
"""

from __future__ import annotations

import argparse
import http.server
import socket
import threading
from pathlib import Path
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parent
DEFAULT_PORT = 5000


class StregServer(http.server.ThreadingHTTPServer):
    allow_reuse_address = True
    daemon_threads = True


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".json": "application/json",
        ".webmanifest": "application/manifest+json",
        ".js": "text/javascript; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".svg": "image/svg+xml",
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        path = urlsplit(self.path).path
        if path in ("", "/"):
            self.path = "/index.html"
        super().do_GET()

    def end_headers(self):
        # Local development should always reflect the files currently checked
        # out. The service worker remains responsible for real offline caching.
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        super().end_headers()

    def log_message(self, fmt, *args):
        pass


def local_ip() -> str:
    connection = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        connection.connect(("8.8.8.8", 80))
        return connection.getsockname()[0]
    except OSError:
        return "127.0.0.1"
    finally:
        connection.close()


def serve(port: int) -> None:
    with StregServer(("0.0.0.0", port), Handler) as server:
        server.serve_forever()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the local STREG app")
    parser.add_argument("--server", "--no-window", action="store_true", dest="server_only")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    port = args.port
    local_url = f"http://127.0.0.1:{port}"

    print("\n  STREG — local development server\n")
    print(f"  Browser: {local_url}")
    print(f"  Same Wi-Fi: http://{local_ip()}:{port}")
    print("  GPS and login should be tested on localhost or a real HTTPS host.\n")

    if args.server_only:
        print("  Server-only mode. Press Ctrl+C to stop.\n")
        try:
            serve(port)
        except KeyboardInterrupt:
            print("\n  Stopped.")
        return

    server_thread = threading.Thread(target=serve, args=(port,), daemon=True)
    server_thread.start()

    try:
        import webview
    except ImportError:
        print("  pywebview is not installed. The browser server is still available.")
        print("  Install the optional window with: pip install pywebview\n")
        input("  Press Enter to close...")
        return

    webview.create_window(
        "STREG",
        local_url,
        width=402,
        height=874,
        resizable=True,
        min_size=(320, 600),
    )
    webview.start()


if __name__ == "__main__":
    main()
