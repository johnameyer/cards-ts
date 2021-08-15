import { ControllerHandlerState, ControllerState, ControllersProviders, IndexedControllers, initializeControllers, validate } from '../controllers/controller';
import { reconstruct } from '../intermediary/serializable';

/**
 * A class used to track the current state of the game
 * @typeParam Controllers the state controllers for this game
 */
export class GenericGameState<Controllers extends IndexedControllers> {
    // TODO reconsider how to use 'exposed' in contravariant position
    private state?: ControllerState<Controllers> = undefined;

    private allControllers!: Controllers;
    
    constructor(private readonly providers: ControllersProviders<Controllers>, state?: ControllerState<Controllers>) {
        validate(providers);
        this.state = state || {} as ControllerState<Controllers>;
        this.allControllers = initializeControllers(providers, this.state);
    }
    
    public get controllers(): Controllers {
        if(!this.state) {
            throw new Error('Not yet initialized');
        }
        return this.allControllers;
    }

    asHandlerData(position: number): ControllerHandlerState<Controllers> {
        /*
         * TODO nicer way of cloning state, but without reverting to doing it at the controller level
         * (cloning needed so that mutating in handler does not mutate upstream)
         */
        return Object.fromEntries(Object.entries(this.allControllers).map(([ key, value ]) => [ key, reconstruct(value.getFor(position)) ])) as any;
    }

    public clone(): GenericGameState<Controllers> {
        return new GenericGameState(
            this.providers, 
            Object.fromEntries(Object.entries(this.allControllers).map(([ key, value ]) => [ key, reconstruct((value as any).state) ])) as any,
        );
    }
}
