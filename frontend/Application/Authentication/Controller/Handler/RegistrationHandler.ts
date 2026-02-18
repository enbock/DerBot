import type ControllerHandler from '../../../ControllerHandler';
import type AuthenticationAdapter from '../../Adapter';
import type StateTransition from '../../StateTransition';
import type UserAuthenticationUseCase from '../../../../Core/Authentication/UserAuthenticationUseCase/UserAuthenticationUseCase';
import RegistrationView from '../../View/RegistrationView';

export default class RegistrationHandler implements ControllerHandler {
  private view: RegistrationView;

  constructor(
    private readonly adapter: AuthenticationAdapter,
    private readonly rootElement: HTMLElement,
    private readonly stateTransition: StateTransition,
    private readonly authenticationUseCase: UserAuthenticationUseCase
  ) {
    this.view = new RegistrationView(adapter);
  }

  async initialize(): Promise<void> {
    this.bindActions();
  }

  private bindActions(): void {
    this.adapter.onRegister = async (nickname: string) => {
      await this.handleRegister(nickname);
    };
  }

  private async handleRegister(nickname: string): Promise<void> {
    this.view.clearError();

    try {
      const response = await this.authenticationUseCase.register({ nickname });
      this.view.showQRCode(response.qrCodeDataUrl, response.secret, nickname);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      this.view.showError(message);
    }
  }

  showRegistrationForm(): void {
    this.view.render(this.rootElement);
  }
}
