/**
 * Adapter Interface
 * Callback-Verbindung zwischen View und Controller/Handler
 */
export interface AppAdapter {
    onInit?: () => void;
    onAction?: (data: any) => void;
}
//# sourceMappingURL=AppAdapter.d.ts.map