import { Serializable } from '../intermediary/serializable.js';
import { AbstractController, GenericControllerProvider } from './controller.js';
/**
 * Field for the handlers to save their custom data (since they are meant to be stateless)
 */
type DataState = Record<string, Serializable>[];

/**
 * @category Controller Provider
 */
export class DataControllerProvider implements GenericControllerProvider<DataState, {}, DataController> {
    controller(state: DataState, controllers: {}): DataController {
        return new DataController(state, controllers);
    }

    initialState(): DataState {
        return [];
    }

    dependencies() {
        return {};
    }
}

/**
 * Controls the data for the handlers
 * @category Controller
 */
export class DataController extends AbstractController<DataState, Record<string, never>, Record<string, Serializable>> {
    getDataFor(handler: number) {
        return this.state[handler];
    }

    setDataFor(handler: number, value: Record<string, Serializable>) {
        this.state[handler] = value;
    }

    override getFor(position: number): Record<string, Serializable> {
        return this.state[position];
    }

    override validate() {
        if(!Array.isArray(this.state)) {
            throw new Error('Data state is not an array');
        }
        // TODO maybe add size check? Or is that a handler type problem
    }
}
