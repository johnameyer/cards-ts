import { Serializable } from '../intermediary/serializable.js';

/**
 * Parent class of controllers, which own a slice of state
 * @typeParam State the state to be wrapped
 * @typeParam WrappedControllers the controllers that this controller depends on
 * @typeParam HandlerData the data that this controller provides to handlers
 * @category Controller
 */
export abstract class AbstractController<State extends Serializable, WrappedControllers extends IndexedControllers, HandlerData extends Serializable = State> {
    constructor(protected state: State, protected controllers: WrappedControllers) {
        this.validate();
    }

    abstract getFor(position: number): HandlerData;

    // eslint-disable-next-line @typescript-eslint/no-empty-function, no-empty-function
    validate(): void {} // TODO can we make this more declarative - matchers per state field + overall checker?
}

/**
 * Provides a controller
 * @category Controller Provider
 */
export interface GenericControllerProvider<State extends Serializable, WrappedControllers extends IndexedControllers, Controller extends AbstractController<State, WrappedControllers, any>> {
    /**
     * Return the initial state for the controller
     */
    initialState(controllers: WrappedControllers): State;

    controller(state: State, controllers: WrappedControllers): Controller;

    // TODO consider having "optional dependencies", that can be specified as false here. Loops in that graph nondeterministic
    dependencies(): { readonly [key in keyof WrappedControllers]: true };
}

/**
 * Subclass of abstract controller that shows the state for all handlers
 * @typeParam State the state to be wrapped
 * @typeParam WrappedControllers the controllers that this controller depends on
 * @category Controller
 */
export abstract class GlobalController<State extends Serializable, WrappedControllers extends IndexedControllers> extends AbstractController<State, WrappedControllers> {
    override getFor() {
        return this.state;
    }
}

/**
 * Subclass of abstract controller for a controller with no state
 * @typeParam WrappedControllers the controllers that this controller depends on
 * @category Controller
 */
export abstract class StatelessController<WrappedControllers extends IndexedControllers> extends AbstractController<undefined, WrappedControllers> {
    initialState(): undefined {
        return undefined;
    }

    getFor() {
        return undefined;
    }
}

/**
 * Controllers indexed by a string
 * @category Controller
 */
export interface IndexedControllers {
    [key: string]: AbstractController<any, any, any>
}

/**
 * Controller providers indexed by a string
 * @category Controller Provider
 */
export interface IndexedProviders {
    [key: string]: GenericControllerProvider<any, any, AbstractController<any, any, any>>
}

/**
 * Gets the associated controllers out of providers
 * @category Controller
 */
export type UnwrapProviders<T extends IndexedProviders> = {
    [key in keyof T]: T[key] extends GenericControllerProvider<any, any, any> ? ReturnType<T[key]['controller']> : never
}

/**
 * Gets the providers that would produce controllers
 * @category Controller
 */
export type ControllersProviders<T extends IndexedControllers> = {
    [key in keyof T]: GenericControllerProvider<any, any, T[key]>
}

/**
 * The providers that will exist once the dependency tree is run (assuming no loops) by removing items whose dependencies cannot be fulfilled
 * @category Controller
 */
export type ValidatedProviders<T extends IndexedProviders> = {
    [key in keyof T]: T[key] extends GenericControllerProvider<any, infer U, any> ? (UnwrapProviders<T> extends U ? T[key] : never) : never
}

/*
 * Memoized by the `controllers`/`providers` object's identity. The dependency
 * graph is static per game type - the same providers object is passed to
 * validate() and initializeControllers() (directly, and again internally)
 * on every GenericGameState construction, which happens repeatedly per
 * ISMCTS iteration (selection/expansion/action-generation/simulation each
 * build their own). Recomputing an identical sort every time was measured
 * as a real hot path; a WeakMap avoids retaining providers objects that
 * would otherwise be garbage.
 */
const topologicalOrderingCache = new WeakMap<IndexedProviders, string[]>();

function getTopologicalOrdering<T extends IndexedProviders>(controllers: T): (string & keyof T)[] {
    const cached = topologicalOrderingCache.get(controllers);
    if(cached) {
        return cached as (string & keyof T)[];
    }

    const sortedKeys = [];
    const children = new Set();
    const edgesByDestination = new Map<string, Set<string>>();

    for(const [ key, controller ] of Object.entries(controllers as IndexedProviders)) {
        if(Object.keys(controller.dependencies()).length === 0) {
            children.add(key);
        } else {
            if(!Object.keys(controller.dependencies()).some(dependency => !controllers[dependency as string])) {
                // exclude from the final graph if dependencies do not exist
                for(const dependency of Object.keys(controller.dependencies()) as string[]) {
                    const set = edgesByDestination.get(dependency) || new Set();
                    set.add(key);
                    edgesByDestination.set(dependency, set);
                }
            }
        }
    }

    while(children.size) {
        const node = children.keys().next().value as string;
        children.delete(node);
        sortedKeys.push(node);
        const edgesForNode = (edgesByDestination.get(node) as Set<string>)?.keys() || [];
        edgesByDestination.delete(node);
        for(const parent of edgesForNode) {
            const nowChildless = Object.keys(controllers[parent].dependencies())
                .every(child => controllers[child as string] && !edgesByDestination.get(child as string));
            if(nowChildless) {
                children.add(parent);
            }
        }
    }

    if(edgesByDestination.size) {
        throw new Error('Graph has loops');
    }

    topologicalOrderingCache.set(controllers, sortedKeys);
    return sortedKeys as (string & keyof T)[];
}

export function validate<T extends IndexedProviders>(controllers: T): ValidatedProviders<T> {
    const keysToInclude = new Set(getTopologicalOrdering(controllers));

    return Object.fromEntries(Object.entries(controllers).filter(([ key, _value ]) => keysToInclude.has(key))) as ValidatedProviders<T>;
}

export function initializeControllers<T extends IndexedControllers>(providers: ControllersProviders<T>, state: ControllerState<T>) {
    const retained: T = {} as T;

    /*
     * Equivalent to getTopologicalOrdering(validate(providers)): validate()
     * filters providers down to exactly the keys getTopologicalOrdering
     * already determined are valid (reachable, no missing dependencies), so
     * re-running the sort on that filtered set always reproduces the same
     * order. Calling it directly on `providers` instead avoids a second
     * (redundant) sort and hits the same cache entry validate() already
     * populated for this providers object.
     */
    for(const name of getTopologicalOrdering(providers) as (keyof T)[]) {
        const dependencyKeys = Object.keys(providers[name].dependencies());
        const dependencyControllers = Object.fromEntries(Object.entries(retained).filter(([ key, _val ]) => dependencyKeys.includes(key)));
        
        if(process.env.DEBUG_RECONSTRUCTION === 'true' && name === 'turnState') {
            console.error('[INIT-CONTROLLERS] Processing controller:', name);
            console.error('[INIT-CONTROLLERS] state[name] exists:', name in state);
            console.error('[INIT-CONTROLLERS] state[name] value:', JSON.stringify((state as any)[name]));
        }
        
        if(!state[name]) {
            state[name] = providers[name].initialState(dependencyControllers) as any;
            if(process.env.DEBUG_RECONSTRUCTION === 'true' && name === 'turnState') {
                console.error('[INIT-CONTROLLERS] Created initial state for', name);
            }
        }
        
        const controller = providers[name].controller(state[name], dependencyControllers);
        retained[name] = controller;
        
        if(process.env.DEBUG_RECONSTRUCTION === 'true' && name === 'turnState') {
            console.error('[INIT-CONTROLLERS] Created controller for', name);
            console.error('[INIT-CONTROLLERS] controller.get():', JSON.stringify((controller as any).get?.()));
        }
    }

    return retained;
}

export type ControllerState<T> = {
    [key in keyof T]: T[key] extends AbstractController<infer State, any, any> ? State : never
}

/**
 * Gets the handler state of controllers
 * @category Controller
 */
export type ControllerHandlerState<T> = {
    [key in keyof T]: T[key] extends AbstractController<any, any, any> ? ReturnType<T[key]['getFor']> : never
}
