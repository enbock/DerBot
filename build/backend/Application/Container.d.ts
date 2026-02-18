import Controller from './StartUp/Controller/Controller';
import HttpServer from './Http/HttpServer';
import AuthenticationController from './Authentication/Controller/AuthenticationController';
export default class Container {
    readonly startUp: Controller;
    readonly httpServer: HttpServer;
    readonly authenticationController: AuthenticationController;
    constructor();
}
//# sourceMappingURL=Container.d.ts.map