import { ControllerHandlerState, ControllerState, ControllersProviders, IndexedControllers, initializeControllers, validate } from '../controllers/controller.js';
import { reconstruct } from '../intermediary/serializable.js';

/**
 * A class used to track the current state of the game
 * @typeParam Controllers the state controllers for this game
 * @category Game Builder
 */
export class GenericGameState<Controllers extends IndexedControllers> {
    // TODO reconsider how to use 'exposed' in contravariant position
    private allControllers!: Controllers;
    
    constructor(private readonly providers: ControllersProviders<Controllers>, state?: ControllerState<Controllers>) {
        validate(providers);
        state = state || {} as ControllerState<Controllers>;
        this.allControllers = initializeControllers(providers, state);
    }
    
    public get controllers(): Controllers {
        return this.allControllers;
    }

    asHandlerData(position: number): ControllerHandlerState<Controllers> {
        /*
         * TODO nicer way of cloning state, but without reverting to doing it at the controller level
         * (cloning needed so that mutating in handler does not mutate upstream)
         *
         * Built lazily per-key: reconstruct() is the dominant cost of message
         * dispatch (it runs on every message() / messageAll() / messageOthers()
         * call, for every controller, regardless of whether the receiving
         * handler ever reads the result - a no-op/message-acknowledging
         * handler pays full reconstruction cost for data it discards). A Proxy
         * defers each controller's reconstruct() until that key is actually
         * read, and caches it so repeated reads of the same key within one
         * asHandlerData() call don't redo the work.
         */
        /*
         * Handlers are also free to read/write arbitrary properties on
         * handlerData that aren't backed by any controller at all (e.g.
         * euchre/hearts's heuristic handlers stash scratch state on
         * `handlerData.data`) - so the proxy's `target` doubles as a normal
         * writable backing object. Materializing a controller's value writes
         * it onto `target` too (rather than a separate cache), which keeps
         * the Proxy invariants (defineProperty/getOwnPropertyDescriptor must
         * agree with the target) satisfied for both controller-backed and
         * arbitrary keys.
         */
        const allControllers = this.allControllers;
        const target = {} as Record<string, unknown>;
        const materialize = (prop: string): void => {
            if(!(prop in target) && prop in allControllers) {
                target[prop] = reconstruct((allControllers as Record<string, { getFor(position: number): unknown }>)[prop].getFor(position));
            }
        };
        return new Proxy(target, {
            get(_target, prop: string) {
                materialize(prop);
                return target[prop];
            },
            has(_target, prop: string) {
                return prop in target || prop in allControllers;
            },
            ownKeys(_target) {
                return [ ...new Set([ ...Reflect.ownKeys(target), ...Reflect.ownKeys(allControllers) ]) ];
            },
            getOwnPropertyDescriptor(_target, prop: string) {
                materialize(prop);
                return Reflect.getOwnPropertyDescriptor(target, prop);
            },
        }) as ControllerHandlerState<Controllers>;
    }

    public clone(): GenericGameState<Controllers> {
        return new GenericGameState(
            this.providers,
            this.state,
        );
    }

    get state() {
        return Object.fromEntries(Object.entries(this.allControllers).map(([ key, value ]) => [ key, reconstruct((value as any).state) ])) as ControllerState<Controllers>;
    }
}
