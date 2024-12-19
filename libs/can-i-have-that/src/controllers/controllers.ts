import { GameParams } from '../game-params.js';
import { GameHandlerParams } from '../game-handler-params.js';
import { ResponseMessage } from '../messages/response-message.js';
import { CanIHaveThatControllerProvider } from './can-i-have-that-controller.js';
import { DefaultControllers, SystemHandlerParams, DeckControllerProvider, PointsControllerProvider, TurnControllerProvider, MeldControllerProvider, DefaultControllerKeys, ValidatedProviders, HandsControllerProvider, ControllersProviders, UnwrapProviders, STANDARD_STATES } from '@cards-ts/core';

type TypedDefaultControllers = DefaultControllers<GameParams, typeof STANDARD_STATES, ResponseMessage, GameHandlerParams & SystemHandlerParams>;

export const buildProviders = () => {
    const providers = {
        deck: new DeckControllerProvider(3, true), // TODO start with different number / add decks as game continues
        hand: new HandsControllerProvider(),
        score: new PointsControllerProvider(),
        turn: new TurnControllerProvider(),
        ask: new TurnControllerProvider(),
        melds: new MeldControllerProvider(),
        canIHaveThat: new CanIHaveThatControllerProvider(),
    };

    return providers as Omit<ValidatedProviders<typeof providers & ControllersProviders<TypedDefaultControllers>>, DefaultControllerKeys>;
};

export type GameControllers = UnwrapProviders<ReturnType<typeof buildProviders>>;

export type Controllers = GameControllers & TypedDefaultControllers;
