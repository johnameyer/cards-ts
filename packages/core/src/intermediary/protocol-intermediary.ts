import { DisplayElement, DisplayElementCallReturn } from './display-element';
import { Presenter, Serializable } from './presenter';
import { Intermediary } from './intermediary';
import { Protocol } from './protocol';

/**
 * Sends the messages or forms over a protocol
 */
export class ProtocolIntermediary implements Intermediary {
    /**
     * 
     * @param protocol the protocol that supports print and form operations
     */
    constructor(private readonly protocol: Protocol<'print' | 'form'>) {}

    print(...printables: Serializable[]): [sent: Promise<void>] {
        return [this.protocol.send('print', printables)];
    }

    form<T extends keyof Presenter>(first: DisplayElement<T>): [sent: undefined | Promise<void>, received: Promise<[DisplayElementCallReturn<T>]>];
    form<T extends keyof Presenter, U extends keyof Presenter>(first: DisplayElement<T>, second: DisplayElement<U>): [sent: undefined | Promise<void>, received: Promise<[DisplayElementCallReturn<T>, DisplayElementCallReturn<U>]>];
    form<T extends keyof Presenter, U extends keyof Presenter, V extends keyof Presenter>(first: DisplayElement<T>, second: DisplayElement<U>, third: DisplayElement<V>): [sent: undefined | Promise<void>, received: Promise<[DisplayElementCallReturn<T>, DisplayElementCallReturn<U>, DisplayElementCallReturn<V>]>];
    form<T extends keyof Presenter, U extends keyof Presenter, V extends keyof Presenter, W extends keyof Presenter>(first: DisplayElement<T>, second: DisplayElement<U>, third: DisplayElement<V>, fourth: DisplayElement<W>): [sent: undefined | Promise<void>, received: Promise<[DisplayElementCallReturn<T>, DisplayElementCallReturn<U>, DisplayElementCallReturn<V>, DisplayElementCallReturn<W>]>];
    form<T extends keyof Presenter, U extends keyof Presenter, V extends keyof Presenter, W extends keyof Presenter, X extends keyof Presenter>(first: DisplayElement<T>, second: DisplayElement<U>, third: DisplayElement<V>, fourth: DisplayElement<W>, fifth: DisplayElement<X>): [sent: undefined | Promise<void>, received: Promise<[DisplayElementCallReturn<T>, DisplayElementCallReturn<U>, DisplayElementCallReturn<V>, DisplayElementCallReturn<W>, DisplayElementCallReturn<X>]>];
    form<T extends keyof Presenter, U extends keyof Presenter, V extends keyof Presenter, W extends keyof Presenter, X extends keyof Presenter, Y extends keyof Presenter>(first: DisplayElement<T>, second: DisplayElement<U>, third: DisplayElement<V>, fourth: DisplayElement<W>, fifth: DisplayElement<X>, sixth: DisplayElement<Y>): [sent: undefined | Promise<void>, received: Promise<[DisplayElementCallReturn<T>, DisplayElementCallReturn<U>, DisplayElementCallReturn<V>, DisplayElementCallReturn<W>, DisplayElementCallReturn<X>, DisplayElementCallReturn<Y>]>];
    form<T extends keyof Presenter, U extends keyof Presenter, V extends keyof Presenter, W extends keyof Presenter, X extends keyof Presenter, Y extends keyof Presenter, Z extends keyof Presenter>(first: DisplayElement<T>, second: DisplayElement<U>, third: DisplayElement<V>, fourth: DisplayElement<W>, fifth: DisplayElement<X>, sixth: DisplayElement<Y>, seventh: DisplayElement<Z>): [sent: undefined | Promise<void>, received: Promise<[DisplayElementCallReturn<T>, DisplayElementCallReturn<U>, DisplayElementCallReturn<V>, DisplayElementCallReturn<W>, DisplayElementCallReturn<X>, DisplayElementCallReturn<Y>, DisplayElementCallReturn<Z>]>];
    form(...components: DisplayElement<keyof Presenter>[]): [sent: undefined | Promise<void>, received: Promise<DisplayElementCallReturn<keyof Presenter>[]>] {
        const form = Intermediary.serializeComponents(components);
        const [sent, result] = this.protocol.sendAndReceive('form', form);
        const values = result.then(result => Intermediary.deserializeSerializable(result) as Serializable[]);
        return [sent, values];
    }
}