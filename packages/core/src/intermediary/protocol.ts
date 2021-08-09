import { Observable } from 'rxjs';

/**
 * Generic interface for a medium that can have messages sent over channels
 */
export interface Protocol<T extends string = string> {
    send(channel: T, ...data: any[]): Promise<void>;

    sendAndReceive(channel: T, ...data: any[]): [sent: Promise<void>, received: Promise<any[]>];

    receiveAll(channel: T): Observable<any[]>;
}
