import AuthenticationAdapter from './Authentication/Adapter';
import Ajax from '../Infrastructure/Authentication/AuthenticationClient/Ajax/Ajax';
import BrowserLocalStorage
  from '../Infrastructure/Authentication/SessionStorage/BrowserLocalStorage/BrowserLocalStorage';
import AuthenticationController from './Authentication/Controller/Controller';
import AuthenticationStateHandler from './Authentication/Controller/Handler/AuthenticationStateHandler';
import RegistrationHandler from './Authentication/Controller/Handler/RegistrationHandler';
import LoginHandler from './Authentication/Controller/Handler/LoginHandler';
import AuthenticatedHandler from './Authentication/Controller/Handler/AuthenticatedHandler';
import UserAuthenticationUseCase from '../Core/Authentication/UserAuthenticationUseCase/UserAuthenticationUseCase';

export default class Container {
  public readonly startUp: AuthenticationController;
  private readonly rootElement: HTMLElement;

  constructor() {
    this.rootElement = document.getElementById('content') || document.body;
    
    // Infrastructure Layer
    const authClient = new Ajax();
    const sessionStorage = new BrowserLocalStorage();
    
    // Application Layer
    const authAdapter = new AuthenticationAdapter();
    
    // Core Layer (UseCase)
    const authenticationUseCase = new UserAuthenticationUseCase(authClient, sessionStorage);
    
    // Create State Handler (implements StateTransition)
    const authStateHandler = new AuthenticationStateHandler(
      authAdapter,
      authenticationUseCase
    );
    
    // Create Sub-Handlers with UseCase
    const registrationHandler = new RegistrationHandler(
      authAdapter,
      this.rootElement,
      authStateHandler,
      authenticationUseCase
    );

    const loginHandler = new LoginHandler(
      authAdapter,
      this.rootElement,
      authStateHandler,
      authenticationUseCase
    );

    const authenticatedHandler = new AuthenticatedHandler(
      authAdapter,
      this.rootElement,
      authStateHandler,
      authenticationUseCase
    );

    // Inject Sub-Handlers into State Handler
    authStateHandler.setHandlers(registrationHandler, loginHandler, authenticatedHandler);
    
    // Create Authentication Controller with all handlers
    this.startUp = new AuthenticationController(
      authAdapter,
      [authStateHandler, registrationHandler, loginHandler, authenticatedHandler]
    );
  }
}
