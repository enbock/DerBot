import type HttpServer from '../../Http/HttpServer';
import type AuthenticationController from '../../Authentication/Controller/AuthenticationController';
import type FileUserStorage from '../../../Infrastructure/Authentication/FileUserStorage';
import type FileSessionStorage from '../../../Infrastructure/Authentication/FileSessionStorage';

export default class Controller {
  private readonly httpServer: HttpServer;
  private readonly authenticationController: AuthenticationController;
  private readonly userStorage: FileUserStorage;
  private readonly sessionStorage: FileSessionStorage;

  constructor(
    httpServer: HttpServer,
    authenticationController: AuthenticationController,
    userStorage: FileUserStorage,
    sessionStorage: FileSessionStorage
  ) {
    this.httpServer = httpServer;
    this.authenticationController = authenticationController;
    this.userStorage = userStorage;
    this.sessionStorage = sessionStorage;
  }

  async start(): Promise<void> {
    console.log('DerBot Backend starting...');
    
    await this.userStorage.initialize();
    await this.sessionStorage.initialize();
    
    const router = this.httpServer.getRouter();
    
    router.get('/styles.css', this.httpServer.serveStaticFile('styles.css'));
    router.get('/main.js', this.httpServer.serveStaticFile('main.js'));
    router.get('/index.html', this.httpServer.serveStaticFile('index.html'));
    
    this.authenticationController.registerRoutes(router);
    this.httpServer.registerRouter(router);
    
    this.httpServer.registerFallbackRoute();
    
    await this.httpServer.start();
    
    console.log('DerBot Backend started successfully');
  }

  async stop(): Promise<void> {
    console.log('DerBot Backend stopping...');
    // Cleanup logic
  }
}
