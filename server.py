#!/usr/bin/env python3
import json
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import os
from datetime import datetime
import psutil

# Rate limiting storage
rate_limit_store = {}

class RequestHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        """Custom logging to match the expected format"""
        timestamp = datetime.now().strftime("%I:%M:%S %p")
        print(f"{timestamp} [python] {format % args}")
    
    def add_security_headers(self):
        """Add security headers"""
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('X-XSS-Protection', '1; mode=block')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        if os.getenv('NODE_ENV') != 'production':
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    def check_rate_limit(self):
        """Simple rate limiting"""
        client_ip = self.client_address[0]
        now = time.time()
        window = 15 * 60  # 15 minutes
        max_requests = 1000
        
        if client_ip not in rate_limit_store:
            rate_limit_store[client_ip] = {'count': 1, 'reset_time': now + window}
            return True
        
        client_data = rate_limit_store[client_ip]
        if now > client_data['reset_time']:
            client_data['count'] = 1
            client_data['reset_time'] = now + window
            return True
        
        if client_data['count'] >= max_requests:
            return False
        
        client_data['count'] += 1
        return True
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.add_security_headers()
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        start_time = time.time()
        parsed_path = urlparse(self.path)
        
        # Rate limiting
        if not self.check_rate_limit():
            self.send_response(429)
            self.send_header('Content-Type', 'application/json')
            self.add_security_headers()
            self.end_headers()
            self.wfile.write(json.dumps({'message': 'Too many requests'}).encode())
            return
        
        # API routes
        if parsed_path.path.startswith('/api/'):
            self.handle_api_request(parsed_path, start_time)
        else:
            self.handle_static_request(parsed_path)
    
    def handle_api_request(self, parsed_path, start_time):
        """Handle API requests"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.add_security_headers()
        self.end_headers()
        
        if parsed_path.path == '/api/system/status':
            response = {
                'deviceAuthentication': 'verified',
                'memory': {
                    'used': psutil.virtual_memory().used,
                    'total': psutil.virtual_memory().total,
                    'percent': psutil.virtual_memory().percent
                },
                'uptime': time.time() - start_time,
                'timestamp': datetime.now().isoformat()
            }
            self.wfile.write(json.dumps(response).encode())
        elif parsed_path.path == '/api/chat/messages':
            self.wfile.write(json.dumps([]).encode())
        else:
            self.send_response(404)
            self.wfile.write(json.dumps({'message': 'Not found'}).encode())
        
        # Log API requests
        duration = (time.time() - start_time) * 1000
        self.log_message(f"GET {parsed_path.path} 200 in {duration:.0f}ms")
    
    def handle_static_request(self, parsed_path):
        """Handle static file requests"""
        if parsed_path.path == '/' or parsed_path.path == '':
            self.serve_index()
        else:
            # Serve static files
            file_path = parsed_path.path.lstrip('/')
            if os.path.exists(file_path) and os.path.isfile(file_path):
                self.serve_file(file_path)
            else:
                self.serve_index()  # SPA fallback
    
    def serve_index(self):
        """Serve the main HTML page"""
        self.send_response(200)
        self.send_header('Content-Type', 'text/html')
        self.add_security_headers()
        self.end_headers()
        
        html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>REST Express</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .container { 
            text-align: center;
            max-width: 600px;
            padding: 2rem;
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        h1 { 
            font-size: 3rem;
            margin-bottom: 1rem;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        p { 
            font-size: 1.2rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }
        .status { 
            display: inline-block;
            padding: 0.5rem 1rem;
            background: rgba(76, 175, 80, 0.2);
            border: 2px solid #4caf50;
            border-radius: 25px;
            margin-top: 1rem;
        }
        .api-info {
            margin-top: 2rem;
            text-align: left;
            background: rgba(0,0,0,0.2);
            padding: 1.5rem;
            border-radius: 10px;
        }
        .endpoint {
            font-family: 'Courier New', monospace;
            background: rgba(255,255,255,0.1);
            padding: 0.5rem;
            border-radius: 5px;
            margin: 0.5rem 0;
        }
        @media (max-width: 768px) {
            h1 { font-size: 2rem; }
            .container { padding: 1rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 REST Express</h1>
        <p>Streamlined Python web server running successfully!</p>
        <div class="status">✅ Server Active</div>
        
        <div class="api-info">
            <h3>Available API Endpoints:</h3>
            <div class="endpoint">GET /api/system/status</div>
            <div class="endpoint">GET /api/chat/messages</div>
        </div>
    </div>
    
    <script>
        // Test API connectivity
        fetch('/api/system/status')
            .then(response => response.json())
            .then(data => {
                console.log('API Status:', data);
            })
            .catch(error => {
                console.error('API Error:', error);
            });
    </script>
</body>
</html>"""
        self.wfile.write(html_content.encode())
    
    def serve_file(self, file_path):
        """Serve static files"""
        try:
            with open(file_path, 'rb') as f:
                content = f.read()
            
            # Determine content type
            if file_path.endswith('.html'):
                content_type = 'text/html'
            elif file_path.endswith('.css'):
                content_type = 'text/css'
            elif file_path.endswith('.js'):
                content_type = 'application/javascript'
            elif file_path.endswith('.json'):
                content_type = 'application/json'
            else:
                content_type = 'application/octet-stream'
            
            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.add_security_headers()
            self.end_headers()
            self.wfile.write(content)
        except FileNotFoundError:
            self.send_response(404)
            self.send_header('Content-Type', 'text/html')
            self.add_security_headers()
            self.end_headers()
            self.wfile.write(b'<h1>404 - File Not Found</h1>')

def run_server():
    """Start the HTTP server"""
    server_address = ('0.0.0.0', 5000)
    httpd = HTTPServer(server_address, RequestHandler)
    
    timestamp = datetime.now().strftime("%I:%M:%S %p")
    print(f"{timestamp} [python] serving on port 5000")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.shutdown()

if __name__ == '__main__':
    run_server()