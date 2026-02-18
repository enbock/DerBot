import type ControllerHandler from '../../../ControllerHandler';
import type AuthenticationAdapter from '../../Adapter';
import type StateTransition from '../../StateTransition';
import type UserAuthenticationUseCase from '../../../../Core/Authentication/UserAuthenticationUseCase/UserAuthenticationUseCase';
import LoginView from '../../View/LoginView';

export default class LoginHandler implements ControllerHandler {
  private view: LoginView;

  constructor(
    private readonly adapter: AuthenticationAdapter,
    private readonly rootElement: HTMLElement,
    private readonly stateTransition: StateTransition,
    private readonly authenticationUseCase: UserAuthenticationUseCase
  ) {
    this.view = new LoginView(adapter);
  }

  async initialize(): Promise<void> {
    this.bindActions();
  }

  private bindActions(): void {
    this.adapter.onLogin = async (totp: string) => {
      await this.handleLogin(totp);
    };
  }

  private async handleLogin(totp: string): Promise<void> {
    this.view.clearError();

    try {
      const response = await this.authenticationUseCase.login({ totp });
      this.stateTransition.showAuthenticatedView(response.nickname);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      this.view.showError(message);
    }
  }

  showLoginForm(): void {
    this.view.render(this.rootElement);
  }
}
