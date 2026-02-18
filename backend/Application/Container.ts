import Controller from './StartUp/Controller/Controller';

/**
 * Dependency Injection Container
 * Verwaltet alle Dependencies nach Inverse Dependency Principle
 */
export default class Container {
  public readonly startUp: Controller;

  constructor() {
    this.startUp = new Controller();
  }
}
