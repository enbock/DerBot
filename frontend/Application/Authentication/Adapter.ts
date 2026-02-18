export default class AuthenticationAdapter {
  public onRegister: (nickname: string) => void = () => <never>false;
  public onLogin: (totp: string) => void = () => <never>false;
  public onLogout: () => void = () => <never>false;
  public onShowLogin: () => void = () => <never>false;
  public onShowRegister: () => void = () => <never>false;
}
