import { CompletedController, CompletedControllerProvider, DataController, DataControllerProvider, GameStateController, GameStateControllerProvider, NamesController, NamesControllerProvider, ParamsController, ParamsControllerProvider, WaitingController, WaitingControllerProvider } from '../controllers/index.js';
import { ValidatedProviders } from '../controllers/controller.js';
import { SystemHandlerParams } from '../handlers/system-handler.js';
import { Serializable } from '../intermediary/serializable.js';
import { Message } from '../messages/message.js';
import { STANDARD_STATES } from './game-states.js';
import { GenericHandlerController, GenericHandlerControllerProvider, GenericHandlerProxy } from './generic-handler-controller.js';

/**
 * Build the default providers, which will be merged with the game specific providers in the game factory
 * @param params the params of the game to be run
 * @param names the names of the players
 * @param proxy the proxy wrapping the handlers
 * @returns the default controllers providers
 */
export const buildDefaultProviders = <GameParams extends Serializable, State extends typeof STANDARD_STATES, ResponseMessage extends Message, Handlers extends {[key: string]: any[]} & SystemHandlerParams>(params: GameParams, names: string[], proxy: GenericHandlerProxy<ResponseMessage, Handlers>) => {
    const controllers = {
        names: new NamesControllerProvider(names),
        data: new DataControllerProvider(),
        state: new GameStateControllerProvider<State>(),
        params: new ParamsControllerProvider(params),
        waiting: new WaitingControllerProvider(),
        completed: new CompletedControllerProvider(),
        players: new GenericHandlerControllerProvider(proxy),
    };
    return controllers as ValidatedProviders<typeof controllers>;
};

/**
 * The type of the default controllers, once initialized from their providers in buildDefaultProviders
 * @typeParam Handlers the custom event handlers that this game has
 * @typeParam GameParams the custom params for this game
 * @typeParam State the state enum for this game
 * @typeParam ResponseMessage the response messages this game expects
 * @link buildDefaultProviders
 */
export type DefaultControllers<GameParams extends Serializable, State extends typeof STANDARD_STATES, ResponseMessage extends Message, Handlers extends {[key: string]: any[]} & SystemHandlerParams> = {
    params: ParamsController<GameParams>;
    data: DataController;
    state: GameStateController<State>;
    names: NamesController;
    waiting: WaitingController;
    completed: CompletedController;
    players: GenericHandlerController<ResponseMessage, Handlers>;
};

/**
 * The reserved names that the default controllers use
 */
export type DefaultControllerKeys = 'params' | 'data' | 'state' | 'names' | 'waiting' | 'completed' | 'players';
