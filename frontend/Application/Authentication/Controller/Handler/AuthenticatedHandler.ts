import type ControllerHandler from '../../../ControllerHandler';
import type AuthenticationAdapter from '../../Adapter';
import type StateTransition from '../../StateTransition';
import type UserAuthenticationUseCase from '../../../../Core/Authentication/UserAuthenticationUseCase/UserAuthenticationUseCase';
import AuthenticatedView from '../../View/AuthenticatedView';

export default class AuthenticatedHandler implements ControllerHandler {
  private view: AuthenticatedView;

  constructor(
    private readonly adapter: AuthenticationAdapter,
    private readonly rootElement: HTMLElement,
    private readonly stateTransition: StateTransition,
    private readonly authenticationUseCase: UserAuthenticationUseCase
  ) {
    this.view = new AuthenticatedView(adapter);
  }

  async initialize(): Promise<void> {
    this.bindActions();
  }

  private bindActions(): void {
    this.adapter.onLogout = async () => {
      await this.handleLogout();
    };
  }

  private async handleLogout(): Promise<void> {
    try {
      await this.authenticationUseCase.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.stateTransition.showLoginView();
    }
  }

  showAuthenticatedView(nickname: string): void {
    this.view.render(this.rootElement, nickname);
  }
}
