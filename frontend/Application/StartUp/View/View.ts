import Adapter from '../Adapter';

/**
 * Application View
 * Native HTML5 UI - keine Frameworks
 */
export default class View {
  private rootElement: HTMLElement | null = null;

  constructor(private readonly adapter: Adapter) {}

  render(): void {
    this.rootElement = document.getElementById('content');
    if (!this.rootElement) {
      console.error('Root element not found');
      return;
    }

    this.rootElement.innerHTML = this.getTemplate();
    this.attachEvents();
  }

  private getTemplate(): string {
    return `
      <div class="app-container">
        <p>Welcome to DerBot</p>
        <button id="actionButton">Click Me</button>
      </div>
    `;
  }

  private attachEvents(): void {
    const button = document.getElementById('actionButton');
    if (button) {
      button.addEventListener('click', () => {
        this.adapter.onAction?.({ type: 'button-click' });
      });
    }
  }

  updateContent(content: string): void {
    if (this.rootElement) {
      const container = this.rootElement.querySelector('.app-container');
      if (container) {
        container.innerHTML += `<p>${content}</p>`;
      }
    }
  }
}
