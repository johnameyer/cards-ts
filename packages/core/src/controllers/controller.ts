import { Serializable } from '../intermediary/serializable';

/**
 * Parent class of controllers, which own a slice of state
 * @typeParam State the state to be wrapped
 * @typeParam WrappedControllers the controllers that this controller depends on
 * @typeParam HandlerData the data that this controller provides to handlers
 */
export abstract class AbstractController<State extends Serializable, WrappedControllers extends IndexedControllers, HandlerData extends Serializable = State> {
    constructor(protected state: State, protected controllers: WrappedControllers) {
        this.validate();
    }

    abstract getFor(position: number): HandlerData;

    // eslint-disable-next-line @typescript-eslint/no-empty-function, no-empty-function
    validate(): void {} // TODO can we make this more declarative - matchers per state field + overall checker?
}

export interface GenericControllerProvider<State extends Serializable, WrappedControllers extends IndexedControllers, Controller extends AbstractController<State, WrappedControllers, any>> {
    /**
     * Return the initial state for the controller
     */
    initialState(controllers: WrappedControllers): State;

    controller(state: State, controllers: WrappedControllers): Controller;

    // TODO consider having "optional dependencies", that can be specified as false here. Loops in that graph nondeterministic
    dependencies(): { readonly [key in keyof WrappedControllers]: true };
}

export abstract class GlobalController<State extends Serializable, WrappedControllers extends IndexedControllers> extends AbstractController<State, WrappedControllers> {
    override getFor() {
        return this.state;
    }
}

export abstract class StatelessController<WrappedControllers extends IndexedControllers> extends AbstractController<undefined, WrappedControllers> {
    initialState(): undefined {
        return undefined;
    }

    getFor() {
        return undefined;
    }
}

export interface IndexedControllers {
    [key: string]: AbstractController<any, any, any>
}

export interface IndexedProviders {
    [key: string]: GenericControllerProvider<any, any, AbstractController<any, any, any>>
}

export type UnwrapProviders<T extends IndexedProviders> = {
    [key in keyof T]: T[key] extends GenericControllerProvider<any, any, any> ? ReturnType<T[key]['controller']> : never
}

export type ControllersProviders<T extends IndexedControllers> = {
    [key in keyof T]: GenericControllerProvider<any, any, T[key]>
}

export type ValidatedProviders<T extends IndexedProviders> = {
    [key in keyof T]: T[key] extends GenericControllerProvider<any, infer U, any> ? (UnwrapProviders<T> extends U ? T[key] : never) : never
}

function getTopologicalOrdering<T extends IndexedProviders>(controllers: T): (string & keyof T)[] {
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
    return sortedKeys;
}

export function validate<T extends IndexedProviders>(controllers: T): ValidatedProviders<T> {
    const keysToInclude = new Set(getTopologicalOrdering(controllers));

    return Object.fromEntries(Object.entries(controllers).filter(([ key, _value ]) => keysToInclude.has(key))) as ValidatedProviders<T>;
}

export function initializeControllers<T extends IndexedControllers>(providers: ControllersProviders<T>, state: ControllerState<T>) {
    const retained: T = {} as T;

    for(const name of getTopologicalOrdering(validate(providers)) as (keyof T)[]) {
        const dependencyKeys = Object.keys(providers[name].dependencies());
        const dependencyControllers = Object.fromEntries(Object.entries(retained).filter(([ key, _val ]) => dependencyKeys.includes(key)));
        if(!state[name]) {
            state[name] = providers[name].initialState(dependencyControllers) as any;
        }
        retained[name] = providers[name].controller(state[name], dependencyControllers);
    }

    return retained;
}

export type ControllerState<T> = {
    [key in keyof T]: T[key] extends AbstractController<infer State, any> ? State : never
}

export type ControllerHandlerState<T> = {
    [key in keyof T]: T[key] extends AbstractController<infer State, any> ? ReturnType<T[key]['getFor']> : never
}
