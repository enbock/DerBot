import { Container } from './Container';
/**
 * Application Controller
 * Startet die Control-Logik und initialisiert Handler
 */
export declare class AppController {
    private readonly container;
    constructor(container: Container);
    start(): Promise<void>;
    stop(): Promise<void>;
}
//# sourceMappingURL=AppController.d.ts.map