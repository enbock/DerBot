import http from 'http';
import fs from 'fs';
import path from 'path';

export interface RouteHandler {
  (req: http.IncomingMessage, res: http.ServerResponse): Promise<void> | void;
}

interface Route {
  method: string;
  path: string;
  handler: RouteHandler;
}

export default class HttpServer {
  private readonly server: http.Server;
  private readonly port: number;
  private readonly routes: Route[] = [];
  private fallbackHandler: RouteHandler | null = null;

  constructor(port: number = 8000) {
    this.port = port;
    this.server = http.createServer((req, res) => this.handleRequest(req, res));
  }

  getRouter(): HttpRouter {
    return new HttpRouter(this);
  }

  registerRouter(router: HttpRouter): void {
    router.getRoutes().forEach((route) => {
      this.routes.push(route);
    });
  }

  registerFallbackRoute(): void {
    this.fallbackHandler = (req: http.IncomingMessage, res: http.ServerResponse) => {
      const pathname = new URL(req.url || '/', `http://${req.headers.host}`).pathname;
      if (!pathname.startsWith('/api')) {
        this.serveSPAIndex(res);
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
      }
    };
  }

  private async handleRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    try {
      const url = new URL(req.url || '/', `http://${req.headers.host}`);
      const pathname = url.pathname;
      const method = req.method || 'GET';

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      const route = this.routes.find(
        (r) => r.method === method && this.matchPath(r.path, pathname)
      );

      if (route) {
        await route.handler(req, res);
        return;
      }

      if (this.fallbackHandler) {
        await this.fallbackHandler(req, res);
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal Server Error';
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: message }));
    }
  }

  private matchPath(routePath: string, urlPath: string): boolean {
    return routePath === urlPath;
  }

  serveStaticFile(filePath: string): RouteHandler {
    return (req: http.IncomingMessage, res: http.ServerResponse) => {
      const fullPath = path.join(process.cwd(), 'build', 'frontend', filePath);
      fs.readFile(fullPath, (err, data) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `${filePath} not found` }));
        } else {
          const contentType = this.getContentType(filePath);
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(data);
        }
      });
    };
  }

  private getContentType(filePath: string): string {
    if (filePath.endsWith('.css')) return 'text/css';
    if (filePath.endsWith('.js')) return 'application/javascript';
    if (filePath.endsWith('.html')) return 'text/html';
    if (filePath.endsWith('.json')) return 'application/json';
    if (filePath.endsWith('.png')) return 'image/png';
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
    if (filePath.endsWith('.svg')) return 'image/svg+xml';
    return 'application/octet-stream';
  }

  private serveSPAIndex(res: http.ServerResponse): void {
    const indexPath = path.join(process.cwd(), 'build', 'frontend', 'index.html');
    fs.readFile(indexPath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'index.html not found' }));
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  }

  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        console.log(`HTTP Server listening on http://localhost:${this.port}`);
        resolve();
      });
    });
  }
}

export class HttpRouter {
  private readonly routes: Route[] = [];
  private readonly server: HttpServer;

  constructor(server: HttpServer) {
    this.server = server;
  }

  post(path: string, handler: RouteHandler): void {
    this.routes.push({ method: 'POST', path, handler });
  }

  get(path: string, handler: RouteHandler): void {
    this.routes.push({ method: 'GET', path, handler });
  }

  getRoutes(): Route[] {
    return this.routes;
  }
}

export class RequestHelper {
  static async getJSONBody(req: http.IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      let data = '';
      req.on('data', (chunk) => {
        data += chunk;
      });
      req.on('end', () => {
        try {
          resolve(data ? JSON.parse(data) : {});
        } catch (error) {
          reject(new Error('Invalid JSON'));
        }
      });
      req.on('error', reject);
    });
  }

  static writeJSON(
    res: http.ServerResponse,
    statusCode: number,
    data: any,
    headers: Record<string, string> = {}
  ): void {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json',
      ...headers
    });
    res.end(JSON.stringify(data));
  }
}
