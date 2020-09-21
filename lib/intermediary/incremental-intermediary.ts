import { Message } from "../games/message";
import { DisplayElement, DisplayElementReturnType } from "./display-element";
import { Presenter, Serializable } from "./presenter";
import { Intermediary } from "./intermediary";

/**
 * Class that presents each element one at a time
 */
export class IncrementalIntermediary implements Intermediary {
    constructor(private readonly presenter: Presenter) {}

    print(...printables: Serializable[]): void {
        this.presenter.print({message: printables});
    }

    async form<T extends keyof Presenter>(first: DisplayElement<T>): Promise<[DisplayElementReturnType<T>]>;
    async form<T extends keyof Presenter, U extends keyof Presenter>(first: DisplayElement<T>, second: DisplayElement<U>): Promise<[DisplayElementReturnType<T>, DisplayElementReturnType<U>]>;
    async form<T extends keyof Presenter, U extends keyof Presenter, V extends keyof Presenter>(first: DisplayElement<T>, second: DisplayElement<U>, third: DisplayElement<V>): Promise<[DisplayElementReturnType<T>, DisplayElementReturnType<U>, DisplayElementReturnType<V>]>;
    async form<T extends keyof Presenter, U extends keyof Presenter, V extends keyof Presenter, W extends keyof Presenter>(first: DisplayElement<T>, second: DisplayElement<U>, third: DisplayElement<V>, fourth: DisplayElement<W>): Promise<[DisplayElementReturnType<T>, DisplayElementReturnType<U>, DisplayElementReturnType<V>, DisplayElementReturnType<W>]>;
    async form<T extends keyof Presenter, U extends keyof Presenter, V extends keyof Presenter, W extends keyof Presenter, X extends keyof Presenter>(first: DisplayElement<T>, second: DisplayElement<U>, third: DisplayElement<V>, fourth: DisplayElement<W>, fifth: DisplayElement<X>): Promise<[DisplayElementReturnType<T>, DisplayElementReturnType<U>, DisplayElementReturnType<V>, DisplayElementReturnType<W>, DisplayElementReturnType<X>]>;
    async form<T extends keyof Presenter, U extends keyof Presenter, V extends keyof Presenter, W extends keyof Presenter, X extends keyof Presenter, Y extends keyof Presenter>(first: DisplayElement<T>, second: DisplayElement<U>, third: DisplayElement<V>, fourth: DisplayElement<W>, fifth: DisplayElement<X>, sixth: DisplayElement<Y>): Promise<[DisplayElementReturnType<T>, DisplayElementReturnType<U>, DisplayElementReturnType<V>, DisplayElementReturnType<W>, DisplayElementReturnType<X>, DisplayElementReturnType<Y>]>;
    async form<T extends keyof Presenter, U extends keyof Presenter, V extends keyof Presenter, W extends keyof Presenter, X extends keyof Presenter, Y extends keyof Presenter, Z extends keyof Presenter>(first: DisplayElement<T>, second: DisplayElement<U>, third: DisplayElement<V>, fourth: DisplayElement<W>, fifth: DisplayElement<X>, sixth: DisplayElement<Y>, seventh: DisplayElement<Z>): Promise<[DisplayElementReturnType<T>, DisplayElementReturnType<U>, DisplayElementReturnType<V>, DisplayElementReturnType<W>, DisplayElementReturnType<X>, DisplayElementReturnType<Y>, DisplayElementReturnType<Z>]>;
    async form(...components: DisplayElement<keyof Presenter>[]): Promise<DisplayElementReturnType<keyof Presenter>[]> {
        let results: DisplayElementReturnType<keyof Presenter>[] = [];
        for(const component of components) {
            const func = this.presenter[component.type];
            // @ts-ignore
            results.push(await func(component)());
        }
        return results;
    }
}