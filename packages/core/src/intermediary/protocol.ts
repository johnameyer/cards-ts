import { Serializable } from 'child_process';
import { Observable } from 'rxjs';

/**
 * Generic interface for a medium that can have messages sent over channels
 */
export interface Protocol<T extends string = string> {
    send(channel: T, ...data: Serializable[]): Promise<void>;

    sendAndReceive(channel: T, ...data: Serializable[]): [sent: Promise<void>, received: Promise<Serializable[]>];

    receiveAll(channel: T): Observable<Serializable[]>;
}
