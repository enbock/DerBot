import AppAdapter from '../AppAdapter';
/**
 * Application View
 * Native HTML5 UI - keine Frameworks
 */
export default class AppView {
    private readonly adapter;
    private rootElement;
    constructor(adapter: AppAdapter);
    render(): void;
    private getTemplate;
    private attachEvents;
    updateContent(content: string): void;
}
//# sourceMappingURL=AppView.d.ts.map