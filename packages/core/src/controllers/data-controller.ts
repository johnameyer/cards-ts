import { Serializable } from '../intermediary/serializable';
import { AbstractController, GenericControllerProvider } from './controller';

/**
 * Field for the handlers to save their custom data (since they are meant to be stateless)
 */
type DataState = Serializable[];

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

export class DataController extends AbstractController<DataState, {}, Serializable> {
    getDataFor(handler: number) {
        return this.state[handler];
    }

    setDataFor(handler: number, value: Serializable) {
        this.state[handler] = value;
    }

    override getFor(position: number): Serializable {
        return this.state[position];
    }

    override validate() {
        if(!Array.isArray(this.state)) {
            throw new Error('Data state is not an array');
        }
        // TODO maybe add size check? Or is that a handler type problem
    }
}
