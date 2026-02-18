import Adapter from '../Adapter';
import View from '../View/View';
import type ControllerHandler from '../../ControllerHandler';
/**
 * Application Controller (Frontend)
 * Startet Control-Logik und initialisiert Handler
 */
export default class Controller {
    private readonly adapter;
    private readonly handlers;
    private readonly view;
    constructor(adapter: Adapter, handlers: Array<ControllerHandler>, view: View);
    initialize(): Promise<void>;
}
//# sourceMappingURL=Controller.d.ts.map