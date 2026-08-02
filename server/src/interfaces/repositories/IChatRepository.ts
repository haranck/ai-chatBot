export interface IChatRepository {
    saveChat(userId: string, question: string, answer: string): Promise<void>;
}