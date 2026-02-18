export default interface StateTransition {
  showAuthenticatedView(nickname: string): void;
  showLoginView(): void;
  showRegistrationView(): void;
}
