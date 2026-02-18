import type AIChatClient from '../../../Core/Chat/AIChatClient';
import AIChatResponse from '../../../Core/Chat/AIChatResponse';
import type { CopilotClient } from '@github/copilot-sdk';
import type CopilotClientFactory from './CopilotClientFactory';

export default class CopilotAIChatClient implements AIChatClient {
  private readonly factory: CopilotClientFactory;
  private client: CopilotClient | null;
  private sessions: Map<string, any>;

  constructor(factory: CopilotClientFactory) {
    this.factory = factory;
    this.client = null;
    this.sessions = new Map();
  }

  async initialize(): Promise<void> {
    try {
      this.client = this.factory.create();
      await this.client.start();
      console.log('[CopilotAIChatClient] SDK initialized successfully');
    } catch (error) {
      console.error('[CopilotAIChatClient] Failed to initialize:', error);
      throw new Error('Copilot SDK initialization failed. Ensure "gh copilot" is available and authenticated.');
    }
  }

  async reply(sessionId: string, message: string): Promise<AIChatResponse> {
    if (!this.client) {
      throw new Error('CopilotAIChatClient not initialized. Call initialize() first.');
    }

    try {
      let session = this.sessions.get(sessionId);

      if (!session) {
        session = await this.client.createSession({
          model: 'auto'
        });
        this.sessions.set(sessionId, session);
        console.log(`[CopilotAIChatClient] Created new session: ${sessionId}`);
      }

      const agentLogs: string[] = [];
      agentLogs.push(`[${new Date().toISOString()}] Sending message to ChatBot agent`);

      let reply = '';
      let received = false;

      const messageHandler = (event: any) => {
        if (event?.data?.content) {
          reply = event.data.content;
          received = true;
        }
      };

      const idleHandler = () => {
        session.removeListener('assistant.message', messageHandler);
        session.removeListener('session.idle', idleHandler);
      };

      session.on('assistant.message', messageHandler);
      session.on('session.idle', idleHandler);
      session.on('tool.execution_complete', (event: any) => {
        agentLogs.push(`[${new Date().toISOString()}] Tool execution: ${event?.data?.tool_name || 'unknown'}`);
      });

      await session.send({ prompt: message });

      await new Promise<void>((resolve) => {
        const checkInterval = setInterval(() => {
          if (received) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 50);
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve();
        }, 10000);
      });

      agentLogs.push(`[${new Date().toISOString()}] Received response from agent`);

      return new AIChatResponse(reply, agentLogs);
    } catch (error) {
      console.error('[CopilotAIChatClient] Error processing message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Copilot SDK error: ${errorMessage}`);
    }
  }

  async cleanup(): Promise<void> {
    if (this.client) {
      try {
        for (const [sessionId, session] of this.sessions) {
          await session.end();
          console.log(`[CopilotAIChatClient] Ended session: ${sessionId}`);
        }
        this.sessions.clear();
        
        await this.client.stop();
        console.log('[CopilotAIChatClient] SDK stopped successfully');
        this.client = null;
      } catch (error) {
        console.error('[CopilotAIChatClient] Error during cleanup:', error);
      }
    }
  }
}
