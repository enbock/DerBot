import type HttpServer from '../../Http/HttpServer';
import type AuthenticationController from '../../Authentication/Controller/AuthenticationController';
import type FileUserStorage from '../../../Infrastructure/Authentication/FileUserStorage';
import type FileSessionStorage from '../../../Infrastructure/Authentication/FileSessionStorage';
export default class Controller {
    private readonly httpServer;
    private readonly authenticationController;
    private readonly userStorage;
    private readonly sessionStorage;
    constructor(httpServer: HttpServer, authenticationController: AuthenticationController, userStorage: FileUserStorage, sessionStorage: FileSessionStorage);
    start(): Promise<void>;
    stop(): Promise<void>;
}
//# sourceMappingURL=Controller.d.ts.map