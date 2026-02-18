/**
 * Controller Handler Interface
 * Alle Handler implementieren diese Schnittstelle
 */
export default interface ControllerHandler {
  initialize(): Promise<void>;
}
