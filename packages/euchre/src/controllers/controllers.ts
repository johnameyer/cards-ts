import { GameParams } from '../game-params.js';
import { GameStates } from '../game-states.js';
import { ResponseMessage } from '../messages/response-message.js';
import { GameHandlerParams } from '../game-handler-params.js';
import { EuchreControllerProvider } from './euchre-controller.js';
import { DefaultControllerKeys, DefaultControllers, SystemHandlerParams, Rank, ControllersProviders, DeckControllerProvider, HandsControllerProvider, PointsControllerProvider, TricksControllerProvider, TurnControllerProvider, UnwrapProviders, ValidatedProviders } from '@cards-ts/core';

type TypedDefaultControllers = DefaultControllers<GameParams, typeof GameStates, ResponseMessage, GameHandlerParams & SystemHandlerParams>;

export const buildProviders = () => {
    const providers = {
        deck: new DeckControllerProvider(1, true, false, Rank.ranks.slice(Rank.ranks.indexOf(Rank.NINE))),
        hand: new HandsControllerProvider(),
        trick: new TricksControllerProvider(),
        score: new PointsControllerProvider(),
        euchre: new EuchreControllerProvider(),
        tricksTaken: new PointsControllerProvider(),
        turn: new TurnControllerProvider(),
    };
    return providers as Omit<ValidatedProviders<typeof providers & ControllersProviders<TypedDefaultControllers>>, DefaultControllerKeys>;
};

export type GameControllers = UnwrapProviders<ReturnType<typeof buildProviders>>;

export type Controllers = GameControllers & TypedDefaultControllers;
