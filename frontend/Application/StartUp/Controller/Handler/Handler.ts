import Adapter from '../../Adapter';
import type ControllerHandler from '../../../ControllerHandler';

/**
 * Application Handler
 * Enthält Control-Logik für Aktionen
 */
export default class Handler implements ControllerHandler {
  constructor(private readonly adapter: Adapter) {
  }

  public async initialize():Promise<void> {
       this.bindActions();
  }

  private bindActions(): void {
    this.adapter.onAction = (data: any) => this.handleAction(data);
  }

  private handleAction(data: any): void {
    console.log('Action triggered:', data);
  }
}
