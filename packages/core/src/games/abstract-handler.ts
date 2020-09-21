import { Observer } from "./observer";
import { AbstractHandlerData } from "./abstract-handler-data";
import { Message } from "./message";

export abstract class AbstractHandler<HandlerData extends AbstractHandlerData> implements Observer<HandlerData> {
    abstract message(message: Message, data: HandlerData): void;

    abstract waitingFor(who: string | undefined): void;

    /**
     * The name the user is known by
     * @param taken the names that are already taken by other users
     */
    abstract getName(taken: string[]): string;
}