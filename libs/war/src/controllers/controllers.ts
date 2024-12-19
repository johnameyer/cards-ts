import { GameParams } from '../game-params.js';
import { GameHandlerParams } from '../game-handler-params.js';
import { ResponseMessage } from '../messages/response-message.js';
import { WarControllerProvider } from './war-controller.js';
import { HiddenHandsControllerProvider, DefaultControllerKeys, DefaultControllers, SystemHandlerParams, DeckControllerProvider, ControllersProviders, UnwrapProviders, ValidatedProviders, STANDARD_STATES } from '@cards-ts/core';

type TypedDefaultControllers = DefaultControllers<GameParams, typeof STANDARD_STATES, ResponseMessage, GameHandlerParams & SystemHandlerParams>;

export const buildProviders = () => {
    const providers = {
        deck: new DeckControllerProvider(1, true, false),
        hand: new HiddenHandsControllerProvider(),
        war: new WarControllerProvider(),
    };
    return providers as Omit<ValidatedProviders<typeof providers & ControllersProviders<TypedDefaultControllers>>, DefaultControllerKeys>;
};

export type GameControllers = UnwrapProviders<ReturnType<typeof buildProviders>>;

export type Controllers = GameControllers & TypedDefaultControllers;
