/**
 * Adapter Class
 * Callback-Verbindung zwischen View und Controller/Handler
 */
export default class Adapter {
  public onAction?: (data: any) => void;
}
