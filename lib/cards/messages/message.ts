/**
 * Parent class for any message to be delivered to handlers
 */
export class Message {
    /**
     * @param message a textual form of the message
     */
    constructor(public readonly message: string) {

    }
}