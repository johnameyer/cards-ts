import { DisplayElement } from './display-element.js';
import { Presenter } from './presenter.js';
import { Serializable, reconstruct } from './serializable.js';
import { Intermediary, IntermediaryMapping } from './intermediary.js';
import { Protocol } from './protocol.js';

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

    form<T extends DisplayElement<keyof Presenter>[]>(...components: T): [sent: undefined | Promise<void>, received: Promise<IntermediaryMapping<T>>] {
        const form = Intermediary.serializeComponents(components);
        const [sent, result] = this.protocol.sendAndReceive('form', form);
        const values = result.then(result => reconstruct(result) as Serializable[]);
        return [sent, values as Promise<any> as Promise<IntermediaryMapping<T>>];
    }
}
