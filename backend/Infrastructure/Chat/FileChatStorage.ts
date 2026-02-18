import type ChatStorage from '../../Core/Chat/ChatStorage';
import ChatSessionEntity from '../../Core/Chat/ChatSessionEntity';
import ChatMessageEntity from '../../Core/Chat/ChatMessageEntity';
import AgentLogEntity from '../../Core/Chat/AgentLogEntity';
import { promises as fs } from 'fs';
import path from 'path';

interface ChatFileData {
  sessions: ChatSessionEntity[];
  messages: ChatMessageEntity[];
  agentLogs: AgentLogEntity[];
}

export default class FileChatStorage implements ChatStorage {
  private readonly filePath: string;
  private sessions: ChatSessionEntity[] = [];
  private messages: ChatMessageEntity[] = [];
  private agentLogs: AgentLogEntity[] = [];

  constructor(dataDir: string = '.data') {
    this.filePath = path.join(dataDir, 'chat.json');
  }

  async initialize(): Promise<void> {
    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true });

    try {
      const content = await fs.readFile(this.filePath, 'utf-8');
      const data = JSON.parse(content) as ChatFileData;
      this.sessions = Array.isArray(data.sessions) ? data.sessions : [];
      this.messages = Array.isArray(data.messages) ? data.messages : [];
      this.agentLogs = Array.isArray(data.agentLogs) ? data.agentLogs : [];
    } catch (error) {
      this.sessions = [];
      this.messages = [];
      this.agentLogs = [];
      await this.persist();
    }
  }

  async findAllSessions(): Promise<ChatSessionEntity[]> {
    return [...this.sessions];
  }

  async findMessagesBySession(sessionId: string): Promise<ChatMessageEntity[]> {
    return this.messages.filter((message) => message.sessionId === sessionId);
  }

  async findAgentLogsBySession(sessionId: string): Promise<AgentLogEntity[]> {
    return this.agentLogs.filter((log) => log.sessionId === sessionId);
  }

  async saveSession(session: ChatSessionEntity): Promise<void> {
    this.sessions = this.sessions.filter((item) => item.id !== session.id);
    this.sessions.push(session);
    await this.persist();
  }

  async saveMessage(message: ChatMessageEntity): Promise<void> {
    this.messages.push(message);
    await this.persist();
  }

  async saveAgentLog(log: AgentLogEntity): Promise<void> {
    this.agentLogs.push(log);
    await this.persist();
  }

  private async persist(): Promise<void> {
    const data: ChatFileData = {
      sessions: this.sessions,
      messages: this.messages,
      agentLogs: this.agentLogs
    };
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
  }
}
