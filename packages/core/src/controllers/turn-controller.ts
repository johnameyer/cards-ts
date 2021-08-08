import { GenericHandlerController } from "../games/generic-handler-controller";
import { SystemHandlerParams } from "../handlers/system-handler";
import { GenericControllerProvider, GlobalController } from "./controller";
import { DeckController } from "./deck-controller";
import { HandsController } from "./hands-controller";

type TurnState = number;

type TurnDependencies = {
    deck: DeckController;
    players: GenericHandlerController<any, SystemHandlerParams>;
    hand: HandsController;
};

export class TurnControllerProvider implements GenericControllerProvider<TurnState, TurnDependencies, TurnController> {
    controller(state: TurnState, controllers: TurnDependencies): TurnController {
        return new TurnController(state, controllers);
    }

    initialState(): TurnState {
        return 0;
    }

    dependencies() {
        return { deck: true, players: true, hand: true } as const;
    }
}

export class TurnController extends GlobalController<TurnState, TurnDependencies> {
    validate() {
    }

    get() {
        return this.state;
    }

    next() {
        this.state = (this.state + 1) % this.controllers.players.count;
    }

    set(turn: number) {
        this.state = turn;
    }
}