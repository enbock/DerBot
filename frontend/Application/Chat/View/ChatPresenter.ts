import type ChatStateResponse from '../../../Core/Chat/ChatUseCase/ChatStateResponse.ts';
import type ChatSessionEntity from '../../../Core/Chat/ChatSessionEntity.ts';
import type ChatMessageEntity from '../../../Core/Chat/ChatMessageEntity.ts';
import type AgentLogEntity from '../../../Core/Chat/AgentLogEntity.ts';

export type ChatViewModel = {
  sessions: ChatSessionEntity[];
  messages: ChatMessageEntity[];
  agentLogs: AgentLogEntity[];
  currentSessionId: string;
};

export default class ChatPresenter {
  createModel(response: ChatStateResponse): ChatViewModel {
    return {
      sessions: response.sessions,
      messages: response.messages,
      agentLogs: response.agentLogs,
      currentSessionId: response.currentSessionId
    };
  }
}
