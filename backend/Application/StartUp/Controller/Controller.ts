import type HttpServer from '../../Http/HttpServer';
import type AuthenticationController from '../../Authentication/Controller/AuthenticationController';
import type ChatController from '../../Chat/Controller/ChatController';
import type FileUserStorage from '../../../Infrastructure/Authentication/FileUserStorage';
import type FileSessionStorage from '../../../Infrastructure/Authentication/FileSessionStorage';
import type FileChatStorage from '../../../Infrastructure/Chat/FileChatStorage';
import type AIChatClient from '../../../Core/Chat/AIChatClient';
import CopilotAIChatClient from '../../../Infrastructure/Chat/AIChatClient/CopilotAIChatClient';

export default class Controller {
  private readonly httpServer: HttpServer;
  private readonly authenticationController: AuthenticationController;
  private readonly chatController: ChatController;
  private readonly userStorage: FileUserStorage;
  private readonly sessionStorage: FileSessionStorage;
  private readonly chatStorage: FileChatStorage;
  private readonly chatClient: AIChatClient;

  constructor(
    httpServer: HttpServer,
    authenticationController: AuthenticationController,
    chatController: ChatController,
    userStorage: FileUserStorage,
    sessionStorage: FileSessionStorage,
    chatStorage: FileChatStorage,
    chatClient: AIChatClient
  ) {
    this.httpServer = httpServer;
    this.authenticationController = authenticationController;
    this.chatController = chatController;
    this.userStorage = userStorage;
    this.sessionStorage = sessionStorage;
    this.chatStorage = chatStorage;
    this.chatClient = chatClient;
  }

  async start(): Promise<void> {
    console.log('DerBot Backend starting...');
    
    await this.userStorage.initialize();
    await this.sessionStorage.initialize();
    await this.chatStorage.initialize();
    
    if (this.chatClient instanceof CopilotAIChatClient) {
      await this.chatClient.initialize();
    }
    
    const router = this.httpServer.getRouter();
    
    router.get('/styles.css', this.httpServer.serveStaticFile('styles.css'));
    router.get('/main.js', this.httpServer.serveStaticFile('main.js'));
    router.get('/index.html', this.httpServer.serveStaticFile('index.html'));
    
    this.authenticationController.registerRoutes(router);
    this.chatController.registerRoutes(router);
    this.httpServer.registerRouter(router);
    
    this.httpServer.registerFallbackRoute();
    
    await this.httpServer.start();
    
    console.log('DerBot Backend started successfully');
  }

  async stop(): Promise<void> {
    console.log('DerBot Backend stopping...');
    
    if (this.chatClient instanceof CopilotAIChatClient) {
      await this.chatClient.cleanup();
    }
    
    console.log('DerBot Backend stopped successfully');
  }
}
