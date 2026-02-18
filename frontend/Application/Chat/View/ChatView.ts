import type ChatAdapter from '../Adapter.ts';
import type { ChatViewModel } from './ChatPresenter.ts';
import type ChatSessionEntity from '../../../Core/Chat/ChatSessionEntity.ts';
import type ChatMessageEntity from '../../../Core/Chat/ChatMessageEntity.ts';
import type AgentLogEntity from '../../../Core/Chat/AgentLogEntity.ts';

export default class ChatView {
  constructor(private readonly adapter: ChatAdapter) {}

  render(container: HTMLElement, model: ChatViewModel): void {
    container.innerHTML = `
      <div class="chat-shell">
        <div class="chat-header">
          <div class="chat-title">
            <h1>DerBot Chat</h1>
            <p>${this.getSessionLabel(model.currentSessionId)}</p>
          </div>
          <button id="newChatBtn" class="btn-primary">Neuer Chat</button>
        </div>
        <div class="chat-columns">
          <aside class="chat-sessions">
            <h2>Chats</h2>
            <ul>
              ${model.sessions.map((session, index) => this.renderSessionItem(session, index, model.currentSessionId)).join('')}
            </ul>
          </aside>
          <main class="chat-main">
            <div class="chat-messages">
              ${this.renderMessages(model.messages)}
            </div>
            <div class="chat-input">
              <textarea id="chatInput" rows="4" placeholder="Write a message..."></textarea>
              <div class="chat-actions">
                <span class="chat-hint">Ctrl+Enter sends</span>
                <button id="sendBtn" class="btn-primary">Senden</button>
              </div>
            </div>
          </main>
          <aside class="chat-agent">
            <h2>Agent Log</h2>
            <ul>
              ${this.renderAgentLogs(model.agentLogs)}
            </ul>
          </aside>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  private attachEvents(): void {
    const newChatBtn = document.getElementById('newChatBtn');
    if (newChatBtn) {
      newChatBtn.addEventListener('click', () => {
        this.adapter.onCreateSession();
      });
    }

    const sendBtn = document.getElementById('sendBtn');
    const input = document.getElementById('chatInput') as HTMLTextAreaElement | null;

    if (sendBtn && input) {
      sendBtn.addEventListener('click', () => {
        this.handleSend(input);
      });

      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && event.ctrlKey) {
          event.preventDefault();
          this.handleSend(input);
        }
      });

      input.focus();
    }

    const sessionItems = document.querySelectorAll('.chat-session');
    sessionItems.forEach((item) => {
      item.addEventListener('click', () => {
        const sessionId = (item as HTMLElement).dataset.sessionId || '';
        if (sessionId) {
          this.adapter.onSelectSession(sessionId);
        }
      });
    });
  }

  private handleSend(input: HTMLTextAreaElement): void {
    const content = input.value;
    if (!content.trim()) {
      return;
    }
    this.adapter.onSendMessage(content);
    input.value = '';
  }

  private renderSessionItem(session: ChatSessionEntity, index: number, currentSessionId: string): string {
    const activeClass = session.id === currentSessionId ? 'chat-session active' : 'chat-session';
    const label = `Chat ${index + 1}`;
    const time = this.formatTime(session.createdAt);

    return `
      <li class="${activeClass}" data-session-id="${session.id}">
        <div class="chat-session-label">${label}</div>
        <div class="chat-session-meta">${time}</div>
      </li>
    `;
  }

  private renderMessages(messages: ChatMessageEntity[]): string {
    if (!messages.length) {
      return '<div class="chat-empty">No messages yet. Start the conversation.</div>';
    }

    return messages
      .map((message) => {
        const roleClass = message.role === 'assistant' ? 'assistant' : 'user';
        const content = this.renderMarkdown(message.content);
        const time = this.formatTime(message.createdAt);

        return `
          <div class="chat-message ${roleClass}">
            <div class="chat-message-content">${content}</div>
            <div class="chat-message-time">${time}</div>
          </div>
        `;
      })
      .join('');
  }

  private renderAgentLogs(logs: AgentLogEntity[]): string {
    if (!logs.length) {
      return '<li class="chat-log-empty">No logs for this session.</li>';
    }

    return logs
      .map((log) => {
        const time = this.formatTime(log.createdAt);
        return `<li><span class="chat-log-time">${time}</span>${this.escapeHtml(log.message)}</li>`;
      })
      .join('');
  }

  private getSessionLabel(sessionId: string): string {
    return sessionId ? `Session ${sessionId.slice(0, 8)}` : 'No active session';
  }

  private formatTime(value: string): string {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private renderMarkdown(input: string): string {
    let output = this.escapeHtml(input);

    const codeTokens: string[] = [];
    output = output.replace(/`([^`]+)`/g, (_match, code: string) => {
      const token = `{{CODE_${codeTokens.length}}}`;
      codeTokens.push(`<code>${code}</code>`);
      return token;
    });

    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    output = output.replace(linkPattern, (_match, text: string, url: string) => {
      if (!/^https?:\/\//i.test(url)) {
        return text;
      }
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    });

    const boldTokens: string[] = [];
    output = output.replace(/\*\*([^*]+)\*\*/g, (_match, bold: string) => {
      const token = `{{BOLD_${boldTokens.length}}}`;
      boldTokens.push(`<strong>${bold}</strong>`);
      return token;
    });

    output = output.replace(/\*([^*]+)\*/g, (_match, italic: string) => {
      return `<em>${italic}</em>`;
    });

    boldTokens.forEach((token, index) => {
      output = output.replace(`{{BOLD_${index}}}`, token);
    });

    codeTokens.forEach((token, index) => {
      output = output.replace(`{{CODE_${index}}}`, token);
    });

    return output.replace(/\n/g, '<br>');
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
