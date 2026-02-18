import AppAdapter from '../../AppAdapter';
import type ControllerHandler from '../ControllerHandler';
/**
 * Application Handler
 * Enthält Control-Logik für Aktionen
 */
export default class AppHandler implements ControllerHandler {
    private readonly adapter;
    constructor(adapter: AppAdapter);
    initialize(): Promise<void>;
    private bindActions;
    private handleAction;
}
//# sourceMappingURL=AppHandler.d.ts.map