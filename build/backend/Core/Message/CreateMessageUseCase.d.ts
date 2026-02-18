import type { Message } from './MessageEntity';
/**
 * Example UseCase
 * Enthält Business-Logik
 */
export declare class CreateMessageUseCase {
    execute(content: string): Promise<Message>;
    private generateId;
}
//# sourceMappingURL=CreateMessageUseCase.d.ts.map