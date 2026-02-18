import AppAdapter from '../AppAdapter';
import AppView from '../View/AppView';
import type ControllerHandler from './ControllerHandler';
/**
 * Application Controller (Frontend)
 * Startet Control-Logik und initialisiert Handler
 */
export default class AppController {
    private readonly adapter;
    private readonly handlers;
    private readonly view;
    constructor(adapter: AppAdapter, handlers: Array<ControllerHandler>, view: AppView);
    initialize(): Promise<void>;
}
//# sourceMappingURL=AppController.d.ts.map