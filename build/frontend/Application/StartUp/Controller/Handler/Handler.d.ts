import Adapter from '../../Adapter';
import type ControllerHandler from '../../../ControllerHandler';
/**
 * Application Handler
 * Enthält Control-Logik für Aktionen
 */
export default class Handler implements ControllerHandler {
    private readonly adapter;
    constructor(adapter: Adapter);
    initialize(): Promise<void>;
    private bindActions;
    private handleAction;
}
//# sourceMappingURL=Handler.d.ts.map