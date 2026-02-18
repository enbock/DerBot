import type ControllerHandler from '../../../ControllerHandler';
import type AuthenticationAdapter from '../../Adapter';
import type StateTransition from '../../StateTransition';
import type UserAuthenticationUseCase from '../../../../Core/Authentication/UserAuthenticationUseCase/UserAuthenticationUseCase';
import type RegistrationHandler from './RegistrationHandler';
import type LoginHandler from './LoginHandler';
import type AuthenticatedHandler from './AuthenticatedHandler';

export default class AuthenticationStateHandler implements ControllerHandler, StateTransition {
  private registrationHandler?: RegistrationHandler;
  private loginHandler?: LoginHandler;
  private authenticatedHandler?: AuthenticatedHandler;

  constructor(
    private readonly adapter: AuthenticationAdapter,
    private readonly authenticationUseCase: UserAuthenticationUseCase
  ) {}

  setHandlers(
    registrationHandler: RegistrationHandler,
    loginHandler: LoginHandler,
    authenticatedHandler: AuthenticatedHandler
  ): void {
    this.registrationHandler = registrationHandler;
    this.loginHandler = loginHandler;
    this.authenticatedHandler = authenticatedHandler;
  }

  async initialize(): Promise<void> {
    this.bindNavigationActions();
    await this.checkExistingSession();
  }

  private bindNavigationActions(): void {
    this.adapter.onShowLogin = this.showLoginView.bind(this);
    this.adapter.onShowRegister = this.showRegistrationView.bind(this);
  }

  private async checkExistingSession(): Promise<void> {
    const response = await this.authenticationUseCase.verifySession();
    if (response.nickname) {
      this.showAuthenticatedView(response.nickname);
    } else {
      this.showLoginView();
    }
  }

  showRegistrationView(): void {
    if (!this.registrationHandler) throw new Error('registrationHandler not set');
    this.registrationHandler.showRegistrationForm();
  }

  showLoginView(): void {
    if (!this.loginHandler) throw new Error('loginHandler not set');
    this.loginHandler.showLoginForm();
  }

  showAuthenticatedView(nickname: string): void {
    if (!this.authenticatedHandler) throw new Error('authenticatedHandler not set');
    this.authenticatedHandler.showAuthenticatedView(nickname);
  }
}
