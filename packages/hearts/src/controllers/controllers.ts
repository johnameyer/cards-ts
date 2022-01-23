import { GameStates } from '../game-states';
import { GameParams } from '../game-params';
import { GameHandlerParams } from '../game-handler-params';
import { ResponseMessage } from '../messages/response-message';
import { PassingControllerProvider } from './passing-controller';
import { DefaultControllerKeys, DefaultControllers, SystemHandlerParams, DeckControllerProvider, HandsControllerProvider, PointsControllerProvider, TricksControllerProvider, TurnControllerProvider, ControllersProviders, UnwrapProviders, ValidatedProviders } from '@cards-ts/core';

type TypedDefaultControllers = DefaultControllers<GameParams, typeof GameStates, ResponseMessage, GameHandlerParams & SystemHandlerParams>;

export const buildProviders = () => {
    const providers = {
        deck: new DeckControllerProvider(1, true, false),
        hand: new HandsControllerProvider(),
        trick: new TricksControllerProvider(),
        trickPoints: new PointsControllerProvider(),
        passing: new PassingControllerProvider(),
        score: new PointsControllerProvider(),
        turn: new TurnControllerProvider(),
    };
    return providers as Omit<ValidatedProviders<typeof providers & ControllersProviders<TypedDefaultControllers>>, DefaultControllerKeys>;
};

export type GameControllers = UnwrapProviders<ReturnType<typeof buildProviders>>;

export type Controllers = GameControllers & TypedDefaultControllers;
