import Controller from './StartUp/Controller/Controller';
import HttpServer from './Http/HttpServer';
import AuthenticationController from './Authentication/Controller/AuthenticationController';
import ChatController from './Chat/Controller/ChatController';
import FileUserStorage from '../Infrastructure/Authentication/FileUserStorage';
import FileSessionStorage from '../Infrastructure/Authentication/FileSessionStorage';
import FileChatStorage from '../Infrastructure/Chat/FileChatStorage';
import TotpService from '../Core/Authentication/TotpService';
import RateLimitService from '../Core/Authentication/RateLimitService';
import UserAuthenticationUseCase from '../Core/Authentication/UserAuthenticationUseCase/UserAuthenticationUseCase';
import ChatUseCase from '../Core/Chat/ChatUseCase/ChatUseCase';
import DummyAIChatClient from '../Infrastructure/Chat/AIChatClient/DummyAIChatClient';

export default class Container {
  public readonly startUp: Controller;
  public readonly httpServer: HttpServer;
  public readonly authenticationController: AuthenticationController;
  public readonly chatController: ChatController;

  constructor() {
    const userStorage = new FileUserStorage();
    const sessionStorage = new FileSessionStorage();
    const chatStorage = new FileChatStorage();

    const totpService = new TotpService();
    const rateLimitService = new RateLimitService();
    const chatClient = new DummyAIChatClient();

    const userAuthenticationUseCase = new UserAuthenticationUseCase(
      userStorage,
      sessionStorage,
      totpService,
      rateLimitService
    );

    const chatUseCase = new ChatUseCase(chatStorage, chatClient);

    this.httpServer = new HttpServer(8000);
    this.authenticationController = new AuthenticationController(
      userAuthenticationUseCase
    );
    this.chatController = new ChatController(chatUseCase);

    this.startUp = new Controller(
      this.httpServer,
      this.authenticationController,
      this.chatController,
      userStorage,
      sessionStorage,
      chatStorage
    );
  }
}
