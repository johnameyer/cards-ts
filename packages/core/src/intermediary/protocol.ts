import { Observable } from "rxjs";

export interface Protocol<T extends string = string> {
    send(channel: T, ...data: any[]): Promise<void>;

    sendAndReceive(channel: T, ...data: any[]): [sent: Promise<void>, received: Promise<any[]>];

    receiveAll(channel: T): Observable<any[]>;
}