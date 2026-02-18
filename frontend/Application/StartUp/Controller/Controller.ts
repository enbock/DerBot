import Adapter from '../Adapter';
import View from '../View/View';
import type ControllerHandler from '../../ControllerHandler';

/**
 * Application Controller (Frontend)
 * Startet Control-Logik und initialisiert Handler
 */
export default class Controller {
  constructor(
    private readonly adapter: Adapter,
    private readonly handlers: Array<ControllerHandler>,
    private readonly view: View
  ) {}

  public async initialize(): Promise<void> {
    console.log('DerBot Frontend starting...');
    
    for(const handler of this.handlers) 
      await handler.initialize();

    this.view.render();
  }
}
