import { NamesControllerProvider, DataControllerProvider, GameStateControllerProvider, ParamsControllerProvider, WaitingControllerProvider, CompletedControllerProvider, CompletedController, DataController, GameStateController, NamesController, ParamsController, WaitingController } from "../controllers";
import { ValidatedProviders } from "../controllers/controller";
import { SystemHandlerParams } from "../handlers/system-handler";
import { Serializable } from "../intermediary/serializable";
import { Message } from "../messages/message";
import { STANDARD_STATES } from "./game-states";
import { GenericHandlerController, GenericHandlerControllerProvider, GenericHandlerProxy } from "./generic-handler-controller";

export const buildDefaultProviders = <GameParams extends Serializable, State extends typeof STANDARD_STATES, ResponseMessage extends Message, Handlers extends {[key: string]: any[]} & SystemHandlerParams>(params: GameParams, names: string[], initialState: keyof State, proxy: GenericHandlerProxy<ResponseMessage, Handlers>) => {
    const controllers = {
        names: new NamesControllerProvider(names),
        data: new DataControllerProvider(),
        state: new GameStateControllerProvider<State>(initialState),
        params: new ParamsControllerProvider(params),
        waiting: new WaitingControllerProvider(),
        completed: new CompletedControllerProvider(),
        players: new GenericHandlerControllerProvider(proxy)
    };
    return controllers as ValidatedProviders<typeof controllers>;
};

export type DefaultControllers<GameParams extends Serializable, State extends typeof STANDARD_STATES, ResponseMessage extends Message, Handlers extends {[key: string]: any[]} & SystemHandlerParams> = {
    params: ParamsController<GameParams>;
    data: DataController;
    state: GameStateController<State>;
    names: NamesController;
    waiting: WaitingController;
    completed: CompletedController;
    players: GenericHandlerController<ResponseMessage, Handlers>;
};

export type DefaultControllerKeys = 'params' | 'data' | 'state' | 'names' | 'waiting' | 'completed' | 'players';