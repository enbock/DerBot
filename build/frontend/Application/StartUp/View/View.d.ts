import Adapter from '../Adapter';
/**
 * Application View
 * Native HTML5 UI - keine Frameworks
 */
export default class View {
    private readonly adapter;
    private rootElement;
    constructor(adapter: Adapter);
    render(): void;
    private getTemplate;
    private attachEvents;
    updateContent(content: string): void;
}
//# sourceMappingURL=View.d.ts.map