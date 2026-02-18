import http from 'http';
import ChatUseCase from '../../../Core/Chat/ChatUseCase/ChatUseCase';
import type CreateSessionRequest from '../../../Core/Chat/ChatUseCase/CreateSessionRequest';
import type LoadSessionRequest from '../../../Core/Chat/ChatUseCase/LoadSessionRequest';
import type SendMessageRequest from '../../../Core/Chat/ChatUseCase/SendMessageRequest';
import { HttpRouter, RequestHelper } from '../../Http/HttpServer';

export default class ChatController {
  private readonly useCase: ChatUseCase;

  constructor(useCase: ChatUseCase) {
    this.useCase = useCase;
  }

  registerRoutes(router: HttpRouter): void {
    router.post('/api/chat/session', this.createSession.bind(this));
    router.get('/api/chat/sessions', this.listSessions.bind(this));
    router.get('/api/chat/session', this.loadSession.bind(this));
    router.post('/api/chat/message', this.sendMessage.bind(this));
  }

  private async createSession(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    try {
      const request: CreateSessionRequest = {};
      const result = await this.useCase.createSession(request);
      RequestHelper.writeJSON(res, 201, result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      RequestHelper.writeJSON(res, 400, { error: message });
    }
  }

  private async listSessions(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    try {
      const result = await this.useCase.listSessions();
      RequestHelper.writeJSON(res, 200, result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      RequestHelper.writeJSON(res, 400, { error: message });
    }
  }

  private async loadSession(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    try {
      const url = new URL(req.url || '/', `http://${req.headers.host}`);
      const sessionId = url.searchParams.get('sessionId') || '';

      if (!sessionId) {
        RequestHelper.writeJSON(res, 400, { error: 'SessionId is required' });
        return;
      }

      const request: LoadSessionRequest = { sessionId };
      const result = await this.useCase.loadSession(request);
      RequestHelper.writeJSON(res, 200, result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      RequestHelper.writeJSON(res, 400, { error: message });
    }
  }

  private async sendMessage(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    try {
      const body = await RequestHelper.getJSONBody(req);
      const { sessionId, content } = body;

      if (!sessionId) {
        RequestHelper.writeJSON(res, 400, { error: 'SessionId is required' });
        return;
      }

      if (!content) {
        RequestHelper.writeJSON(res, 400, { error: 'Message content is required' });
        return;
      }

      const request: SendMessageRequest = { sessionId, content };
      const result = await this.useCase.sendMessage(request);
      RequestHelper.writeJSON(res, 200, result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      RequestHelper.writeJSON(res, 400, { error: message });
    }
  }
}
