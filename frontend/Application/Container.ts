import Controller from './StartUp/Controller/Controller';
import Handler from './StartUp/Controller/Handler/Handler';
import View from './StartUp/View/View';
import Adapter from './StartUp/Adapter';
import type ControllerHandler from './ControllerHandler';

/**
 * Frontend Dependency Injection Container
 * Erstellt alle Controller-Instanzen im Konstruktor
 */
export default class Container {
  public readonly startUp: Controller;

  constructor() {
    const adapter = new Adapter();
    const view = new View(adapter);
    
    const handlers: ControllerHandler[] = [
      new Handler(adapter)
    ];
    
    this.startUp = new Controller(adapter, handlers, view);
  }
}
