import { Card } from "../cards/card";
import { Meld } from "../cards/meld";
import { GenericHandlerController } from "../games/generic-handler-controller";
import { SystemHandlerParams } from "../handlers/system-handler";
import { GenericControllerProvider, GlobalController } from "./controller";
import { DeckController } from "./deck-controller";
import { TurnController } from "./turn-controller";

type MeldState = {
    /**
     * This is where the three of a kind, four card runs are played for each of the hands
     */
    melds: Meld[][];
    
    toPlay: Meld[];
    toPlayOnOthers: Card[][][];
}

type MeldDependencies = {
    deck: DeckController;
    turn: TurnController;
    players: GenericHandlerController<any, SystemHandlerParams>;
};

export class MeldControllerProvider implements GenericControllerProvider<MeldState, {}, MeldController> {
    controller(state: MeldState, controllers: MeldDependencies): MeldController {
        return new MeldController(state, controllers);
    }

    initialState(controllers: MeldDependencies) {
        return {
            melds: new Array(controllers.players.count).fill(0).map(() => []),
            toPlay: [],
            toPlayOnOthers: []
        };
    }

    dependencies() {
        return { players: true, turn: true, deck: true } as const;
    }
}

export class MeldController extends GlobalController<MeldState, MeldDependencies> {
    resetTurn() {
        this.controllers.turn.set((this.controllers.deck.dealer + 1) % this.controllers.players.count);
    }

    get() {
        return this.state.melds;
    }

    isCardLive(card: Card) {
        return this.state.melds.some((runs) => runs.some((play) => play.isLive(card)));
    }

    get toPlay() {
        return this.state.toPlay;
    }

    get toPlayOnOthers() {
        return this.state.toPlayOnOthers;
    }

    play(melds: Meld[]) {
        this.state.toPlay = melds;
    }

    resetTransient() {
        this.state.toPlay = [];
        this.state.toPlayOnOthers = [];
    }

    reset() {
        this.state = new MeldControllerProvider().initialState(this.controllers);
    }
    
    getFor() {
        return super.getFor();
    }
}