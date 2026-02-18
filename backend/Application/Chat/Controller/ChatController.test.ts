import { describe, it } from 'node:test';
import assert from 'node:assert';
import { EventEmitter } from 'node:events';
import type http from 'node:http';
import ChatController from './ChatController.ts';
import HttpServer from '../../Http/HttpServer.ts';
import { createSpy, mock } from '../../../test/mock.ts';
import type ChatUseCase from '../../../Core/Chat/ChatUseCase/ChatUseCase.ts';

const createResponse = () => {
  const writeHead = createSpy<(statusCode: number, headers?: unknown) => void>();
  const end = createSpy<(body?: unknown) => void>();
  const res = { writeHead, end } as unknown as http.ServerResponse;
  return { res, writeHead, end };
};

const createRequest = (url: string, body?: unknown): http.IncomingMessage => {
  const req = new EventEmitter() as unknown as http.IncomingMessage;
  (req as any).headers = { host: 'localhost' };
  (req as any).url = url;
  if (body) {
    (req as any).body = body;
  }
  return req;
};

describe('ChatController', () => {
  it('registers chat routes', () => {
    const server = new HttpServer(0);
    const router = server.getRouter();
    const useCase = mock<ChatUseCase>();
    const controller = new ChatController(useCase as unknown as ChatUseCase);

    controller.registerRoutes(router);

    const routes = router.getRoutes();
    assert.strictEqual(routes.length, 4);
    const paths = routes.map((route) => `${route.method} ${route.path}`);
    assert.ok(paths.includes('POST /api/chat/session'));
    assert.ok(paths.includes('GET /api/chat/sessions'));
    assert.ok(paths.includes('GET /api/chat/session'));
    assert.ok(paths.includes('POST /api/chat/message'));
  });

  it('creates a session', async () => {
    const server = new HttpServer(0);
    const router = server.getRouter();
    const useCase = mock<ChatUseCase>();
    useCase.createSession.and.resolveTo({ sessionId: 's1', createdAt: 'now' });

    const controller = new ChatController(useCase as unknown as ChatUseCase);
    controller.registerRoutes(router);

    const route = router.getRoutes().find((item) => item.path === '/api/chat/session');
    assert.ok(route);

    const req = createRequest('/api/chat/session');
    const response = createResponse();

    await route?.handler(req, response.res);

    assert.strictEqual(useCase.createSession.mock.calls.length, 1);
    assert.strictEqual(response.writeHead.mock.calls[0].arguments[0], 201);
    const body = response.end.mock.calls[0].arguments[0] as string;
    assert.ok(body.includes('"sessionId":"s1"'));
  });

  it('rejects message without session id', async () => {
    const server = new HttpServer(0);
    const router = server.getRouter();
    const useCase = mock<ChatUseCase>();
    const controller = new ChatController(useCase as unknown as ChatUseCase);
    controller.registerRoutes(router);

    const route = router.getRoutes().find((item) => item.path === '/api/chat/message');
    assert.ok(route);

    const req = createRequest('/api/chat/message');
    const response = createResponse();

    const handlerPromise = route?.handler(req, response.res);
    (req as any).emit('data', JSON.stringify({ content: 'hi' }));
    (req as any).emit('end');
    await handlerPromise;

    assert.strictEqual(response.writeHead.mock.calls[0].arguments[0], 400);
    const body = response.end.mock.calls[0].arguments[0] as string;
    assert.ok(body.includes('SessionId is required'));
  });
});
