import { Serializable } from '../intermediary/serializable';
import { GenericControllerProvider, GlobalController } from './controller';

/**
 * The settings that a game runs under
 */
export type ParamsState<GameParams extends Serializable> = GameParams;

export class ParamsControllerProvider<GameParams extends Serializable> implements GenericControllerProvider<ParamsState<GameParams>, {}, ParamsController<GameParams>> {
    private params: GameParams;
    
    constructor(gameParams: GameParams) {
        this.params = gameParams;
    }
    
    controller(state: ParamsState<GameParams>, controllers: {}): ParamsController<GameParams> {
        return new ParamsController(state, controllers);
    }

    initialState() {
        return this.params;
    }

    dependencies() {
        return {};
    }
}

export class ParamsController<GameParams extends Serializable> extends GlobalController<ParamsState<GameParams>, {}> {
    get(): Readonly<GameParams> {
        return this.state as any as Readonly<GameParams>;
    }
}
