import Controller from './StartUp/Controller/Controller';
import HttpServer from './Http/HttpServer';
import AuthenticationController from './Authentication/Controller/AuthenticationController';
import FileUserStorage from '../Infrastructure/Authentication/FileUserStorage';
import FileSessionStorage from '../Infrastructure/Authentication/FileSessionStorage';
import TotpService from '../Core/Authentication/TotpService';
import RateLimitService from '../Core/Authentication/RateLimitService';
import UserAuthenticationUseCase from '../Core/Authentication/UserAuthenticationUseCase/UserAuthenticationUseCase';

export default class Container {
  public readonly startUp: Controller;
  public readonly httpServer: HttpServer;
  public readonly authenticationController: AuthenticationController;

  constructor() {
    const userStorage = new FileUserStorage();
    const sessionStorage = new FileSessionStorage();

    const totpService = new TotpService();
    const rateLimitService = new RateLimitService();

    const userAuthenticationUseCase = new UserAuthenticationUseCase(
      userStorage,
      sessionStorage,
      totpService,
      rateLimitService
    );

    this.httpServer = new HttpServer(8000);
    this.authenticationController = new AuthenticationController(
      userAuthenticationUseCase
    );

    this.startUp = new Controller(
      this.httpServer,
      this.authenticationController,
      userStorage,
      sessionStorage
    );
  }
}
