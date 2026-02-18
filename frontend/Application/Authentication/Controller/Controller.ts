import type ControllerHandler from '../../ControllerHandler';
import AuthenticationAdapter from '../Adapter';

export default class Controller {
  constructor(
    private readonly adapter: AuthenticationAdapter,
    private readonly handlers: ControllerHandler[]
  ) {}

  async initialize(): Promise<void> {
    for (const handler of this.handlers) {
      await handler.initialize();
    }
  }
}
