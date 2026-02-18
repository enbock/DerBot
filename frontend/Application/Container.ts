import AuthenticationAdapter from './Authentication/Adapter';
import ChatAdapter from './Chat/Adapter';
import Ajax from '../Infrastructure/Authentication/AuthenticationClient/Ajax/Ajax';
import ChatAjax from '../Infrastructure/Chat/ChatClient/Ajax/Ajax';
import MemoryChatStateStorage from '../Infrastructure/Chat/MemoryChatStateStorage/MemoryChatStateStorage';
import BrowserLocalStorage
  from '../Infrastructure/Authentication/SessionStorage/BrowserLocalStorage/BrowserLocalStorage';
import AuthenticationController from './Authentication/Controller/Controller';
import AuthenticationStateHandler from './Authentication/Controller/Handler/AuthenticationStateHandler';
import RegistrationHandler from './Authentication/Controller/Handler/RegistrationHandler';
import LoginHandler from './Authentication/Controller/Handler/LoginHandler';
import AuthenticatedHandler from './Authentication/Controller/Handler/AuthenticatedHandler';
import ChatHandler from './Chat/Controller/Handler/ChatHandler';
import ChatView from './Chat/View/ChatView';
import ChatPresenter from './Chat/View/ChatPresenter';
import ChatController from './Chat/Controller/Controller';
import UserAuthenticationUseCase from '../Core/Authentication/UserAuthenticationUseCase/UserAuthenticationUseCase';
import ChatUseCase from '../Core/Chat/ChatUseCase/ChatUseCase';

export default class Container {
  public readonly startUp: AuthenticationController;
  private readonly rootElement: HTMLElement;

  constructor() {
    this.rootElement = document.getElementById('content') || document.body;
    
    // Infrastructure Layer
    const authClient = new Ajax();
    const sessionStorage = new BrowserLocalStorage();
    const chatClient = new ChatAjax();
    const chatStateStorage = new MemoryChatStateStorage();
    
    // Application Layer
    const authAdapter = new AuthenticationAdapter();
    const chatAdapter = new ChatAdapter();
    
    // Core Layer (UseCase)
    const authenticationUseCase = new UserAuthenticationUseCase(authClient, sessionStorage);
    const chatUseCase = new ChatUseCase(chatClient, chatStateStorage);
    
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

    const chatView = new ChatView(chatAdapter);
    const chatPresenter = new ChatPresenter();
    const chatHandler = new ChatHandler(chatAdapter, chatUseCase, chatView, chatPresenter);
    const chatController = new ChatController(chatAdapter, [chatHandler], chatHandler);

    const authenticatedHandler = new AuthenticatedHandler(
      authAdapter,
      this.rootElement,
      authStateHandler,
      authenticationUseCase,
      chatController
    );

    // Inject Sub-Handlers into State Handler
    authStateHandler.setHandlers(registrationHandler, loginHandler, authenticatedHandler);
    
    // Create Authentication Controller with all handlers
    this.startUp = new AuthenticationController(
      authAdapter,
      [authStateHandler, registrationHandler, loginHandler, authenticatedHandler, chatController]
    );
  }
}
