import { DisplayElement, DisplayElementCallReturn, DisplayElementReturnType } from './display-element';
import { Presenter } from './presenter';
import { Serializable } from "./serializable";
import { Intermediary, IntermediaryMapping } from './intermediary';
import { Presentable } from './presentable';

/**
 * Class that presents each display element one at a time
 */
export class IncrementalIntermediary implements Intermediary {
    /**
     * Create a new incremental intermediary
     * @param presenter the presenter to wrap
     */
    constructor(private readonly presenter: Presenter) {}

    /**
     * Print serializables
     * @param printables the serializables to print in order
     */
    print(...printables: Presentable[]): [] {
        this.presenter.print({message: printables})();
        return [];
    }

    /**
     * Show the form elements one at a time
     */
    form<T extends (DisplayElement<keyof Presenter>)[]>(...components: T): [sent: undefined | Promise<void>, received: Promise<IntermediaryMapping<T>>] {
        const results = new Promise<IntermediaryMapping<T>>(resolver => {
            const results: any[] = [];
            for(const component of components) {
                const func = this.presenter[component.type];
                // @ts-ignore
                results.push(func(component)());
            }
            resolver(Promise.all(results) as any as IntermediaryMapping<T>);
        });
        return [, results];
    }
}