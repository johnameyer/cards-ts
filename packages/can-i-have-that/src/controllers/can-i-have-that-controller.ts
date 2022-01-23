import { GameParams } from '../game-params';
import { AbstractController, DeckController, ParamsController, GenericControllerProvider } from '@cards-ts/core';

type CanIHaveThatState = {
    wantCard?: boolean;

    whoseAsk: number;

    round: number;
}

type CanIHaveThatDependencies = { deck: DeckController, params: ParamsController<GameParams> };

export class CanIHaveThatControllerProvider implements GenericControllerProvider<CanIHaveThatState, CanIHaveThatDependencies, CanIHaveThatController> {
    initialState() {
        return {
            whoseAsk: 0,
            round: 0,
        };
    }

    dependencies() {
        return { deck: true, params: true } as const;
    }

    controller(state: CanIHaveThatState, controllers: CanIHaveThatDependencies) {
        return new CanIHaveThatController(state, controllers);
    }
}

export class CanIHaveThatController extends AbstractController<CanIHaveThatState, CanIHaveThatDependencies, Omit<CanIHaveThatState, 'wantCard'>> {
    getFor() {
        return {
            whoseAsk: this.state.whoseAsk,
            round: this.state.round,
        };
    }    

    validate(): void {
        if(!Number.isInteger(this.state.round)) { 
            throw new Error('Expected integer round');
        }
        if(this.state.wantCard !== undefined && this.state.wantCard !== true && this.state.wantCard !== false) {
            throw new Error('Expected boolean or undefined wantCard');
        }
        if(!Number.isInteger(this.state.whoseAsk)) {
            throw new Error('Expected integer whoseAsk');
        }
    }

    get round() {
        return this.state.round;
    }

    /**
     * Advance to the next round
     */
    nextRound() {
        this.state.round += 1;
        this.controllers.deck.incrementDealer();
    }

    get wantCard() {
        return this.state.wantCard;
    }

    set wantCard(wantCard: CanIHaveThatState['wantCard']) {
        this.state.wantCard = wantCard;
    }

    /**
     * Returns whether it is the last round
     */
    isLastRound() {
        return this.round === this.controllers.params.get().rounds.length - 1;
    }

    /**
     * Return the current round
     */
    getRound() {
        return this.controllers.params.get().rounds[this.round];
    }

    /**
     * Returns the number to deal at the beginning for the current round
     */
    getNumToDeal() {
        const roundNeeded = this.getRound().reduce((one, two) => one + two, 0);
        if(this.getRound() === this.controllers.params.get().rounds[-1]) {
            return roundNeeded; // on the last hand, since there is no discard, deal one less
        }
        return roundNeeded + 1;
    }
}
